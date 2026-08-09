import { Component, DestroyRef, ElementRef, afterNextRender, inject, viewChild } from '@angular/core';
import * as THREE from 'three';

// Ported (not copy-pasted) from a standalone reference file the author designed and validated
// visually first: `.prompt/media/logo_html/globe-oei.html`. Kept functionally identical —
// same colors, same geometry, same animation timings — except:
// - No `OrbitControls`: the reference allowed drag-to-rotate (zoom/pan already disabled there),
//   but this is a passive hero decoration, not an interactive widget: capturing drag gestures on
//   a background element would fight a visitor trying to scroll/select text. The camera is
//   simply static; the globe's own automatic Y-axis rotation is the only motion, exactly as
//   before, just without the (unused, for a background element) ability to fling it around.
// - No DOM `<svg id="shield">` element to serialize: the same markup is inlined as a template
//   string and rasterized directly, since this component has no need to expose that SVG in the
//   real DOM (the reference only put it in the DOM so it could screenshot/inspect it).
const NAVY = 0x0a1e3f;
const NAVY2 = 0x12295a;
const GOLD = 0xe8a530;

const SHIELD_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 122" fill="none">
  <path d="M50 5 L89 19 V57 C89 87 71 104 50 116 C29 104 11 87 11 57 V19 Z"
        fill="rgba(10,30,63,0.7)" stroke="#E8A530" stroke-width="2.6" stroke-linejoin="round"/>
  <circle cx="50" cy="57" r="23" stroke="#E8A530" stroke-width="1.8"/>
  <ellipse cx="50" cy="57" rx="10.5" ry="23" stroke="#E8A530" stroke-width="1.2"/>
  <path d="M28.5 49 H71.5 M28.5 65 H71.5" stroke="#E8A530" stroke-width="1.2"/>
  <path d="M50 34 V24" stroke="#E8A530" stroke-width="1.4"/><circle cx="50" cy="21.5" r="2" fill="#E8A530"/>
  <path d="M66 40 L73 33 H79" stroke="#E8A530" stroke-width="1.4"/><circle cx="81.5" cy="33" r="2" fill="#E8A530"/>
  <path d="M73 57 H81" stroke="#E8A530" stroke-width="1.4"/><circle cx="83.5" cy="57" r="2" fill="#E8A530"/>
  <path d="M34 40 L27 33 H21" stroke="#E8A530" stroke-width="1.4"/><circle cx="18.5" cy="33" r="2" fill="#E8A530"/>
  <path d="M27 57 H19" stroke="#E8A530" stroke-width="1.4"/><circle cx="16.5" cy="57" r="2" fill="#E8A530"/>
  <path d="M64 76 L71 83" stroke="#E8A530" stroke-width="1.4"/><circle cx="73" cy="85" r="2" fill="#E8A530"/>
  <path d="M36 76 L29 83" stroke="#E8A530" stroke-width="1.4"/><circle cx="27" cy="85" r="2" fill="#E8A530"/>
</svg>`;

// [lat, lon] of the 14 "connected cities" the reference design places nodes at, and the arcs
// (indexes into this array) drawn between them — unchanged from the reference.
const CITIES: readonly [number, number][] = [
  [40.7, -74], [37.7, -122.4], [-23.5, -46.6], [51.5, 0], [48.8, 2.3], [46.2, 6.1], [6.5, 3.4], [-26.2, 28],
  [25.2, 55.3], [19, 72.8], [1.35, 103.8], [35.7, 139.7], [-33.8, 151.2], [-1.3, 36.8],
];
const LINKS: readonly [number, number][] = [
  [0, 3], [0, 2], [0, 11], [1, 11], [1, 0], [2, 6], [3, 4], [3, 8], [4, 5], [4, 6], [5, 8], [6, 13], [7, 13],
  [7, 8], [8, 9], [9, 10], [10, 11], [10, 12], [11, 12], [13, 8],
];

const ROT_PERIOD_SECONDS = 50;

function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function glowTexture(inner: string, outer: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, inner);
  gradient.addColorStop(0.35, outer);
  gradient.addColorStop(1, 'rgba(232,165,48,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

interface Pulse {
  readonly curve: THREE.CatmullRomCurve3;
  readonly group: THREE.Sprite[];
  readonly speed: number;
  readonly offset: number;
}

@Component({
  selector: 'oei-hero-globe',
  template: `<canvas #canvas class="oei-hero-globe__canvas"></canvas>`,
  styleUrl: './hero-globe.scss',
})
export class HeroGlobe {
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    // Browser-only by construction (Angular never calls afterNextRender callbacks during SSR) —
    // no extra platform check needed to keep WebGL/Canvas/Image APIs safe to use unconditionally.
    afterNextRender(() => this.init());
  }

  private init(): void {
    const canvas = this.canvasRef().nativeElement;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
    camera.position.set(0, 0.72, 3.8);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(2.5, 3, 2);
    scene.add(key);
    const fill = new THREE.DirectionalLight(NAVY2, 2.0);
    fill.position.set(-2, -1, -2);
    scene.add(fill);

    const globe = new THREE.Group();
    scene.add(globe);

    const globeMat = new THREE.MeshStandardMaterial({
      color: NAVY,
      roughness: 0.75,
      metalness: 0.15,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    globe.add(new THREE.Mesh(new THREE.SphereGeometry(0.982, 64, 64), globeMat));

    // Discreet lat/lon wireframe grid.
    {
      const pts: THREE.Vector3[] = [];
      for (let lat = -60; lat <= 60; lat += 30) {
        for (let i = 0; i < 96; i++) {
          pts.push(latLonToVector3(lat, (i / 96) * 360 - 180, 1.0), latLonToVector3(lat, ((i + 1) / 96) * 360 - 180, 1.0));
        }
      }
      for (let lon = -180; lon < 180; lon += 30) {
        for (let i = 0; i < 48; i++) {
          pts.push(
            latLonToVector3(-90 + (i / 48) * 180, lon, 1.0),
            latLonToVector3(-90 + ((i + 1) / 48) * 180, lon, 1.0),
          );
        }
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(pts);
      globe.add(new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: NAVY2, transparent: true, opacity: 0.85 })));
    }

    // Real continents (TopoJSON land-110m), fetched at runtime from a public CDN — same
    // reasoning as the Livre Blanc's CDN-loaded Mermaid renderer: a data file only needed for
    // this one decorative element isn't worth vendoring/bundling, and a failed fetch degrades
    // gracefully (the plain wireframe globe above still renders).
    fetch('https://unpkg.com/world-atlas@2.0.2/land-110m.json')
      .then((r) => r.json())
      .then((topo) => this.applyContinents(topo, globe, globeMat))
      .catch((error: unknown) => console.warn('[hero-globe] continents not loaded', error));

    const nodeGlowTex = glowTexture('rgba(255,255,255,0.95)', 'rgba(232,165,48,0.55)');
    const pulseTex = glowTexture('rgba(255,240,210,1)', 'rgba(232,165,48,0.7)');

    const nodeGlows: THREE.Sprite[] = [];
    {
      const dotGeo = new THREE.SphereGeometry(0.012, 16, 16);
      const dotMat = new THREE.MeshBasicMaterial({ color: GOLD });
      CITIES.forEach((c, i) => {
        const p = latLonToVector3(c[0], c[1], 1.005);
        const dot = new THREE.Mesh(dotGeo, dotMat);
        dot.position.copy(p);
        globe.add(dot);
        const spr = new THREE.Sprite(
          new THREE.SpriteMaterial({ map: nodeGlowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
        );
        spr.position.copy(p);
        spr.scale.setScalar(0.11);
        spr.userData['phase'] = i * 0.9;
        globe.add(spr);
        nodeGlows.push(spr);
      });
    }

    const pulses: Pulse[] = [];
    {
      const arcMat = new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false });
      LINKS.forEach((lk, i) => {
        const a = latLonToVector3(CITIES[lk[0]][0], CITIES[lk[0]][1], 1.005);
        const b = latLonToVector3(CITIES[lk[1]][0], CITIES[lk[1]][1], 1.005);
        const ang = a.angleTo(b);
        const N = 64;
        const pts: THREE.Vector3[] = [];
        for (let j = 0; j <= N; j++) {
          const t = j / N;
          const p = a.clone().lerp(b, t).normalize().multiplyScalar(1.005 + Math.sin(t * Math.PI) * ang * 0.09);
          pts.push(p);
        }
        const curve = new THREE.CatmullRomCurve3(pts);
        globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), arcMat));

        const group: THREE.Sprite[] = [];
        for (let k = 0; k < 4; k++) {
          const s = new THREE.Sprite(
            new THREE.SpriteMaterial({ map: pulseTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 1 - k * 0.24 }),
          );
          s.scale.setScalar(0.055 * (1 - k * 0.18));
          globe.add(s);
          group.push(s);
        }
        pulses.push({ curve, group, speed: 0.055 + (i % 7) * 0.012, offset: (i * 0.37) % 1 });
      });
    }

    // Fixed, camera-facing shield billboard at the globe's center — rasterized once from the
    // inline SVG markup above.
    const shieldGroup = new THREE.Group();
    scene.add(shieldGroup);
    {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 624;
        c.getContext('2d')!.drawImage(img, 0, 0, 512, 624);
        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        const plane = new THREE.Mesh(
          new THREE.PlaneGeometry(0.66, 0.805),
          new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0.7 }),
        );
        plane.name = 'shield';
        shieldGroup.add(plane);
        const glow = new THREE.Sprite(
          new THREE.SpriteMaterial({ map: nodeGlowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.2 }),
        );
        glow.name = 'shieldGlow';
        glow.scale.setScalar(1.15);
        glow.position.z = -0.02;
        shieldGroup.add(glow);
      };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(SHIELD_SVG);
    }

    // Soft navy atmospheric rim glow.
    {
      const mat = new THREE.ShaderMaterial({
        uniforms: { c: { value: new THREE.Color(0x2a4b8f) } },
        vertexShader: `varying vec3 vN; varying vec3 vP;
          void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.0); vP = mv.xyz; gl_Position = projectionMatrix*mv; }`,
        fragmentShader: `uniform vec3 c; varying vec3 vN; varying vec3 vP;
          void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(-vP))), 3.5); gl_FragColor = vec4(c, f*0.55); }`,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
      });
      scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.16, 64, 64), mat));
    }
    const spec = new THREE.PointLight(0xffffff, 3, 8);
    spec.position.set(1.6, 1.8, 2.2);
    scene.add(spec);

    const resize = (): void => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    let t = 0;
    let lastTimeMs: number | undefined;
    renderer.setAnimationLoop((nowMs: number) => {
      const delta = lastTimeMs === undefined ? 0 : (nowMs - lastTimeMs) / 1000;
      lastTimeMs = nowMs;
      t += Math.min(delta, 0.05);
      globe.rotation.y = t * ((2 * Math.PI) / ROT_PERIOD_SECONDS);
      nodeGlows.forEach((s) => {
        const b = 0.72 + 0.28 * Math.sin((t * 2 * Math.PI) / 3.2 + (s.userData['phase'] as number));
        (s.material as THREE.SpriteMaterial).opacity = b;
        s.scale.setScalar(0.09 + 0.035 * b);
      });
      pulses.forEach((p) => {
        const head = (t * p.speed + p.offset) % 1;
        p.group.forEach((s, k) => {
          const f = head - k * 0.02;
          if (f < 0) {
            s.visible = false;
            return;
          }
          s.visible = true;
          s.position.copy(p.curve.getPoint(f));
        });
      });
      shieldGroup.quaternion.copy(camera.quaternion);
      const sg = shieldGroup.getObjectByName('shieldGlow') as THREE.Sprite | undefined;
      if (sg) {
        (sg.material as THREE.SpriteMaterial).opacity = 0.14 + 0.1 * Math.sin((t * 2 * Math.PI) / 3.2);
      }
      renderer.render(scene, camera);
    });
    resize();

    this.destroyRef.onDestroy(() => {
      resizeObserver.disconnect();
      renderer.setAnimationLoop(null);
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Line || obj instanceof THREE.LineSegments) {
          obj.geometry.dispose();
        }
        const material = (obj as THREE.Mesh | THREE.Sprite).material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(material)) {
          material.forEach((m) => m.dispose());
        } else {
          material?.dispose();
        }
      });
    });
  }

  private applyContinents(
    topo: {
      transform: { scale: [number, number]; translate: [number, number] };
      arcs: [number, number][][];
      objects: { land: { geometries: { arcs: number[][][] }[] } };
    },
    globe: THREE.Group,
    globeMat: THREE.MeshStandardMaterial,
  ): void {
    const tf = topo.transform;
    const arcs = topo.arcs.map((arc) => {
      let x = 0;
      let y = 0;
      return arc.map(([dx, dy]) => {
        x += dx;
        y += dy;
        return [x * tf.scale[0] + tf.translate[0], y * tf.scale[1] + tf.translate[1]] as [number, number];
      });
    });
    const ring = (idxs: number[]): [number, number][] => {
      let pts: [number, number][] = [];
      for (const i of idxs) {
        let a = i < 0 ? arcs[~i].slice().reverse() : arcs[i];
        if (pts.length) a = a.slice(1);
        pts = pts.concat(a);
      }
      return pts;
    };
    const polys = topo.objects.land.geometries[0].arcs.map((poly) => poly.map((r) => ring(r)));

    const W = 2048;
    const H = 1024;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const x = c.getContext('2d')!;
    x.fillStyle = '#0A1E3F';
    x.fillRect(0, 0, W, H);
    x.fillStyle = '#16305F';
    for (const poly of polys) {
      x.beginPath();
      for (const rg of poly) {
        rg.forEach(([lon, lat], i) => {
          const px = ((lon + 180) / 360) * W;
          const py = ((90 - lat) / 180) * H;
          i ? x.lineTo(px, py) : x.moveTo(px, py);
        });
        x.closePath();
      }
      x.fill('evenodd');
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    globeMat.map = tex;
    globeMat.color.set(0xffffff);
    globeMat.needsUpdate = true;

    const coastMat = new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.4 });
    const segs: THREE.Vector3[] = [];
    for (const poly of polys) {
      for (const rg of poly) {
        for (let i = 0; i < rg.length - 1; i++) {
          segs.push(latLonToVector3(rg[i][1], rg[i][0], 1.003), latLonToVector3(rg[i + 1][1], rg[i + 1][0], 1.003));
        }
      }
    }
    globe.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(segs), coastMat));
  }
}
