// Professional Neural Network knowledge graph — top level: one of the 9 OEI expertise
// domains (the "galaxy" view, always fully loaded — see `NetworkGraphPort.listDomains`).
//
// `x`/`y` are the domain's precomputed position in the knowledge-graph layout (the "galaxy"
// coordinate space the canvas explorer renders): a legitimate piece of this bounded context's
// data (where a domain sits relative to its neighbours), not a rendering-only detail — which is
// why it lives on the model rather than being invented by the presentation layer. Purely
// cosmetic per-frame rendering attributes (radius, animation phase, decorative satellite dots)
// are NOT modelled here: those are derived deterministically from `id` by the canvas's render
// mapper (`domain/model/network/network-render-graph.ts`).
export interface NetworkDomain {
  readonly id: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  // Ids of other domains this one is linked to in the galaxy view (drawn as "dd" edges).
  readonly neighborDomainIds: readonly string[];
}
