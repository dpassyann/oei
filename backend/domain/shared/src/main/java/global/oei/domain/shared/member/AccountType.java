package global.oei.domain.shared.member;

/**
 * Distinguishes a real OEI member account from a demonstration account seeded for the
 * public showcase (network graph, salary transparency demo data, events, institution
 * workspace, ...).
 *
 * <p><b>{@link #DEMO} members are permanent, durable demonstration data — never deleted,
 * disabled, or expired.</b> They intentionally have no associated Keycloak account: they
 * exist purely as database rows so every other bounded context can reference a realistic,
 * richly-populated dataset (compensation declarations, badges, certifications, network
 * graph nodes, event registrations, institution affiliations, ...) end to end, without ever
 * being a real authenticated caller themselves. See {@code docs/adr} for the "honesty of
 * demo data" rule this supports (demo content must always be identifiable as such, e.g. via
 * {@code isDemoAccount()}/{@code isDemoData} flags on referencing aggregates).</p>
 */
public enum AccountType {
    REAL,
    DEMO
}
