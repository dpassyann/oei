package global.oei.domain.shared.cv;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import global.oei.domain.shared.member.MemberId;

/**
 * A member's CV: a deliberate "big object" (template + source language + an ordered list of
 * independently translatable {@link CvSection}s), read/replaced as a whole by
 * {@code CvPort#save}, mirroring {@code ProfessionalProfile}'s persistence strategy (ADR
 * 0002) even though the OpenAPI contract exposes finer-grained per-section/per-translation
 * operations — those are implemented here as pure aggregate mutations (this class), then
 * persisted wholesale.
 *
 * <p>A member may have several CVs (one per template/target audience), unlike the
 * single-per-member {@code ProfessionalProfile}.</p>
 */
public record Cv(
        String id,
        MemberId memberId,
        String templateId,
        String sourceLanguage,
        CvStatus status,
        List<CvSection> sections) {

    public Cv {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(memberId, "memberId must not be null");
        Objects.requireNonNull(templateId, "templateId must not be null");
        Objects.requireNonNull(sourceLanguage, "sourceLanguage must not be null");
        Objects.requireNonNull(status, "status must not be null");
        sections = List.copyOf(sections == null ? List.of() : sections);
    }

    /**
     * @return a new instance with {@link #templateId()}/{@link #sourceLanguage()} replaced;
     *         every other field (notably {@link #sections()}) unchanged
     */
    public Cv withMetadata(final String templateId, final String sourceLanguage) {
        return new Cv(id, memberId, templateId, sourceLanguage, status, sections);
    }

    /**
     * @return a new instance with {@code section} appended to {@link #sections()}; every
     *         other field unchanged
     */
    public Cv addSection(final CvSection section) {
        final List<CvSection> merged = new ArrayList<>(sections);
        merged.add(section);
        return new Cv(id, memberId, templateId, sourceLanguage, status, merged);
    }

    /**
     * @return a new instance with the section matching {@code sectionId} replaced by
     *         {@code updated}, or empty if no such section exists
     */
    public Optional<Cv> replaceSection(final String sectionId, final CvSection updated) {
        return mapSection(sectionId, existing -> updated);
    }

    /**
     * @return a new instance with {@code translation} attached to the section matching
     *         {@code sectionId}, or empty if no such section exists
     */
    public Optional<Cv> addSectionTranslation(final String sectionId, final CvTranslation translation) {
        return mapSection(sectionId, section -> section.addTranslation(translation));
    }

    /**
     * @return a new instance with the translation matching {@code language} on the section
     *         matching {@code sectionId} validated, or empty if either the section or that
     *         language's translation does not exist
     */
    public Optional<Cv> validateSectionTranslation(final String sectionId, final String language, final String validatedBy) {
        return findSection(sectionId)
                .flatMap(section -> section.validateTranslation(language, validatedBy))
                .flatMap(updated -> replaceSection(sectionId, updated));
    }

    /**
     * @return the section matching {@code sectionId}, if any
     */
    public Optional<CvSection> findSection(final String sectionId) {
        return sections.stream().filter(section -> section.id().equals(sectionId)).findFirst();
    }

    private Optional<Cv> mapSection(final String sectionId, final java.util.function.UnaryOperator<CvSection> mapper) {
        if (findSection(sectionId).isEmpty()) {
            return Optional.empty();
        }
        final List<CvSection> updated = sections.stream()
                .map(section -> section.id().equals(sectionId) ? mapper.apply(section) : section)
                .toList();
        return Optional.of(new Cv(id, memberId, templateId, sourceLanguage, status, updated));
    }
}
