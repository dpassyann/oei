package global.oei.domain.shared.profile;

/**
 * CEFR-style proficiency level, mirrored one-to-one on the OEI OpenAPI contract
 * ({@code LanguageProficiency.level} enum).
 */
public enum LanguageLevel {
    A1,
    A2,
    B1,
    B2,
    C1,
    C2,
    NATIVE
}
