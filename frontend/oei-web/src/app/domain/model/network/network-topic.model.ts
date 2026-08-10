// Second level of the Professional Neural Network graph: a concept/skill topic inside one
// domain — only loaded once the user zooms into that domain (see
// `NetworkGraphPort.listTopicsAndCertifications`).
export interface NetworkTopic {
  readonly id: string;
  readonly domainId: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  // Other topics (usually in the same domain, occasionally a neighbouring one) this topic is
  // cross-linked to in the graph (drawn as "tt" edges).
  readonly relatedTopicIds: readonly string[];
}
