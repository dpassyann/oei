// Shared UI-chrome types for the Professional Neural Network canvas explorer, used by the page
// (`reseau-neuronal.ts`) and its presentational sub-components (`components/network-*`). Kept
// separate from `network-canvas.ts` (the engine) and from the domain models so none of the
// small chrome components need to import the canvas component itself.
import { NetworkNode, NetworkNodeKind } from '../../../domain/model/network/network-render-graph';

export type SelectableKind = NetworkNodeKind;

export interface JourneyState {
  readonly steps: readonly string[];
  readonly idx: number;
  readonly name: string;
}

export interface SearchResult {
  readonly node: NetworkNode;
  readonly label: string;
  readonly kindLabelKey: string;
  readonly color: string;
  readonly flyZoom: number;
}

export interface Chip {
  readonly label: string;
  readonly active: boolean;
}

export interface OrbitIcon {
  readonly key: 'profile' | 'linkedin' | 'youtube' | 'contact';
  readonly labelKey: string;
  readonly x: number;
  readonly y: number;
  readonly delay: string;
}

export const KIND_ZOOM: Readonly<Record<SelectableKind, number>> = { domain: 1.9, topic: 4.8, cert: 5.2, expert: 8.4 };
export const KIND_COLOR: Readonly<Record<SelectableKind, string>> = {
  domain: '#3FA9FF',
  topic: '#3FA9FF',
  cert: '#E8A530',
  expert: '#F7F3EA',
};
export const KIND_LABEL_KEY: Readonly<Record<SelectableKind, string>> = {
  domain: 'network.legend.domain',
  topic: 'network.legend.concept',
  cert: 'network.legend.certification',
  expert: 'network.legend.expert',
};
