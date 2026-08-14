package global.oei.domain.shared.content;

/**
 * {@code GIT} for normative documents (versioned Markdown source of truth, synced from a Git
 * repository — see {@code DocumentSource}, not implemented in this iteration, documented
 * TODO), {@code CMS} for editorial content managed directly in the database.
 */
public enum ContentSourceType {
    GIT,
    CMS
}
