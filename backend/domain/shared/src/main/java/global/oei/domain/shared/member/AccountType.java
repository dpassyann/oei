package global.oei.domain.shared.member;

/**
 * Distinguishes a real OEI member account from a demonstration account seeded for the
 * public showcase (network graph, salary transparency demo data, ...). A demo account can be
 * disabled later without deleting it (its historical data stays reviewable) by flipping this
 * flag on the owning {@link Member} — see {@code docs/adr} for the "honesty of demo data"
 * rule this supports (demo content must always be identifiable as such).
 */
public enum AccountType {
    REAL,
    DEMO
}
