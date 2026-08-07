// Mermaid is loaded from a CDN at runtime, in the end user's browser, rather than bundled as
// an npm dependency of this app. Reasoning: (1) it is only ever needed on this one page (the
// Livre Blanc's 3 flowcharts), so bundling it into every visitor's initial download for a
// niche, occasional-use feature is wasteful; (2) mermaid ships an official CDN-ready ESM build
// designed for exactly this "import on demand" pattern. Pinned to a major version (not
// unpinned `@latest`) so a Mermaid release can't silently change rendering site-wide.
const MERMAID_CDN_URL = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

// The `mermaid` package is intentionally not an npm dependency of this app (see below), so its
// real type declarations aren't available at compile time — this is a deliberately minimal,
// hand-written shape covering only the two methods this file calls.
interface MermaidModule {
  readonly default: {
    initialize(config: Record<string, unknown>): void;
    run(options: { nodes: readonly HTMLElement[] }): Promise<void>;
  };
}

let mermaidModulePromise: Promise<MermaidModule> | undefined;

function loadMermaid(): Promise<MermaidModule> {
  mermaidModulePromise ??= import(
    /* webpackIgnore: true */ /* @vite-ignore */ MERMAID_CDN_URL
  ) as Promise<MermaidModule>;
  return mermaidModulePromise;
}

/** Renders every `pre.mermaid` element inside `container` into an inline SVG diagram, in place.
 * Safe to call repeatedly (e.g. once per language change): Mermaid only touches elements that
 * still contain their raw source text, so already-rendered diagrams are left untouched, and a
 * fresh `contentHtml()` render (which recreates the `pre.mermaid` elements from Markdown) is
 * picked up correctly on the next call. Failures (offline, CDN unreachable, malformed diagram
 * source) are caught and logged rather than breaking the rest of the page — the reader still
 * gets the full text of the Livre Blanc even if a diagram can't render. */
export async function renderMermaidDiagrams(container: HTMLElement): Promise<void> {
  const nodes = container.querySelectorAll<HTMLElement>('pre.mermaid');
  if (nodes.length === 0) {
    return;
  }
  try {
    const { default: mermaid } = await loadMermaid();
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables: {
        primaryColor: '#fbf3e2',
        primaryTextColor: '#0a1e3f',
        primaryBorderColor: '#e8a530',
        lineColor: '#0a1e3f',
        fontFamily: 'inherit',
      },
    });
    await mermaid.run({ nodes: Array.from(nodes) });
  } catch (error) {
    console.error('[livre-blanc] Mermaid diagram rendering failed', error);
  }
}
