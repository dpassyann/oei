// A certification attached to a topic, loaded together with its topic (see
// `NetworkGraphPort.listTopicsAndCertifications`) — certifications are few enough per domain
// (max a handful) that they don't need their own paginated endpoint, unlike experts.
export interface NetworkCertification {
  readonly id: string;
  readonly topicId: string;
  readonly domainId: string;
  readonly label: string;
  readonly provider: string;
  // Previous certification in the chain (e.g. "AWS Developer Associate" before "AWS Solutions
  // Architect"), or `null` for the entry-level certification of a chain.
  readonly prereqCertificationId: string | null;
  readonly description: string;
  readonly validatedSkills: readonly string[];
  readonly validityPeriod: string;
  readonly expertCount: number;
  readonly x: number;
  readonly y: number;
}
