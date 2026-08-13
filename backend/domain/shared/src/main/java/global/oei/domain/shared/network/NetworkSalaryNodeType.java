package global.oei.domain.shared.network;

/**
 * Kinds of Professional Neural Network graph node a salary insight aggregate can attach to.
 * Deliberately excludes an "expert" node type — an individual member is never the subject of
 * an aggregate, only ever a (never-individually-visible) contributor to one. Mirrors the
 * frontend's {@code NetworkSalaryNodeType} union type (network-salary-insight.model.ts).
 */
public enum NetworkSalaryNodeType {
    DOMAIN,
    TOPIC,
    CERTIFICATION
}
