import { Component, ElementRef, computed, effect, input, viewChild } from '@angular/core';
import * as QRCode from 'qrcode';

// Navy/gold gradient applied across the dot matrix, matching the OEI charter
// (#0A1E3F navy nuit -> #E8A530 doré) rather than the generic pink/purple "sticker QR" look.
const NAVY: readonly [number, number, number] = [0x0a, 0x1e, 0x3f];
const GOLD: readonly [number, number, number] = [0xe8, 0xa5, 0x30];

// Fraction of the code's full size left untouched at the center so the logo/photo overlay
// never sits on top of drawn modules — kept comfortably under the ~30% payload recovery
// budget of error-correction level H used below.
const CLEAR_ZONE_RATIO = 0.3;
const QUIET_ZONE_MODULES = 3;

function mixChannel(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

function mixColor(t: number): string {
  const clamped = Math.min(1, Math.max(0, t));
  const r = mixChannel(NAVY[0], GOLD[0], clamped);
  const g = mixChannel(NAVY[1], GOLD[1], clamped);
  const b = mixChannel(NAVY[2], GOLD[2], clamped);
  return `rgb(${r}, ${g}, ${b})`;
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// A real, scannable QR code (generated client-side via the `qrcode` package, error-correction
// level H so a logo can safely cover the center) rendered as a premium "sticker" — navy→gold
// gradient dots for data modules, solid rounded squares for the three finder patterns (kept
// as reliable solid blocks rather than dots, since those are what a scanner locks onto first),
// with the OEI shield (or the member's photo, when provided) overlaid at the center.
//
// Shared by `CarteNumerique` (private card management view) and `CartePublique` (`/card/:slug`)
// so both QR codes look and behave identically.
@Component({
  selector: 'oei-styled-qr',
  templateUrl: './styled-qr.html',
  styleUrl: './styled-qr.scss',
})
export class StyledQr {
  readonly value = input.required<string>();
  readonly size = input<number>(220);
  readonly photoUrl = input<string | undefined>(undefined);
  readonly ariaLabel = input<string>('');

  protected readonly logoDiameter = computed(() => Math.round(this.size() * CLEAR_ZONE_RATIO));

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  constructor() {
    effect(() => {
      const canvas = this.canvasRef()?.nativeElement;
      if (!canvas) {
        return;
      }
      this.draw(canvas, this.value(), this.size());
    });
  }

  private draw(canvas: HTMLCanvasElement, value: string, size: number): void {
    const ctx = canvas.getContext('2d');
    if (!ctx || !value) {
      return;
    }

    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    let qr;
    try {
      qr = QRCode.create(value, { errorCorrectionLevel: 'H' });
    } catch {
      // Malformed/empty input (e.g. resource not loaded yet) — leave the canvas blank rather
      // than throwing, the caller will re-render once a valid `value` arrives.
      return;
    }

    // Ivoire sticker backing so the code stays scannable regardless of the page's own
    // background (navy on the Wallet preview, white/ivoire elsewhere).
    roundRectPath(ctx, 0, 0, size, size, size * 0.07);
    ctx.fillStyle = '#F7F4EC';
    ctx.fill();

    const count = qr.modules.size;
    const totalModules = count + QUIET_ZONE_MODULES * 2;
    const moduleSize = size / totalModules;
    const center = size / 2;
    const clearRadius = (size * CLEAR_ZONE_RATIO) / 2;

    const isFinderPattern = (row: number, col: number): boolean => {
      const inTopLeft = row < 7 && col < 7;
      const inTopRight = row < 7 && col >= count - 7;
      const inBottomLeft = row >= count - 7 && col < 7;
      return inTopLeft || inTopRight || inBottomLeft;
    };

    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (!qr.modules.get(row, col)) {
          continue;
        }
        const x = (col + QUIET_ZONE_MODULES) * moduleSize;
        const y = (row + QUIET_ZONE_MODULES) * moduleSize;
        const cx = x + moduleSize / 2;
        const cy = y + moduleSize / 2;
        if (Math.hypot(cx - center, cy - center) < clearRadius) {
          continue;
        }

        ctx.fillStyle = mixColor((cx + cy) / (size * 2));

        if (isFinderPattern(row, col)) {
          roundRectPath(ctx, x, y, moduleSize, moduleSize, moduleSize * 0.2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(cx, cy, moduleSize * 0.34, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }
}
