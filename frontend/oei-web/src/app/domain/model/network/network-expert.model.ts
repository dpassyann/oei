export type NetworkExpertLevel = 'I' | 'II' | 'III';

// A member expert attached to one topic. The only truly paginated resource of this bounded
// context (see `NetworkGraphPort.listExperts`) — there can be many experts per topic, and the
// canvas only needs the ones currently visible at the "experts" zoom level.
export interface NetworkExpert {
  readonly id: string;
  readonly topicId: string;
  readonly domainId: string;
  readonly label: string;
  readonly role: string;
  readonly company: string;
  readonly country: string;
  readonly level: NetworkExpertLevel;
  readonly score: number;
  readonly certificationLabels: readonly string[];
  readonly badges: readonly string[];
  // Topic ids forming this expert's suggested learning journey (for the "Voir le parcours"
  // dossier action), ending on `topicId`.
  readonly journeyTopicIds: readonly string[];
  readonly x: number;
  readonly y: number;
}
