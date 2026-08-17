package global.oei.application.web.resource.member.mapper;

import java.math.BigDecimal;
import java.util.List;

import lombok.experimental.UtilityClass;

import global.oei.application.web.model.CompensationPeriodDTO;
import global.oei.application.web.model.CurrentCompensationDTO;
import global.oei.application.web.model.EducationDTO;
import global.oei.application.web.model.ExperienceDTO;
import global.oei.application.web.model.LanguageProficiencyDTO;
import global.oei.application.web.model.ProfessionalProfileDTO;
import global.oei.application.web.model.SkillDTO;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.profile.Availability;
import global.oei.domain.shared.profile.CurrentCompensation;
import global.oei.domain.shared.profile.Education;
import global.oei.domain.shared.profile.Experience;
import global.oei.domain.shared.profile.LanguageLevel;
import global.oei.domain.shared.profile.LanguageProficiency;
import global.oei.domain.shared.profile.ProfessionalProfile;
import global.oei.domain.shared.profile.Skill;

/**
 * Explicit hand-written mapping between the domain {@link ProfessionalProfile} and the
 * generated {@link ProfessionalProfileDTO} at the HTTP boundary.
 */
@UtilityClass
public class ProfileDtoMapper {

    public ProfessionalProfileDTO toDto(final ProfessionalProfile profile) {
        final ProfessionalProfileDTO dto = new ProfessionalProfileDTO(profile.memberId().value().toString());
        dto.setTitle(profile.title());
        dto.setSummary(profile.summary());
        dto.setLocation(profile.location());
        if (profile.availability() != null) {
            dto.setAvailability(ProfessionalProfileDTO.AvailabilityEnum.valueOf(profile.availability().name()));
        }
        dto.setExpertiseAreas(profile.expertiseAreas());
        dto.setTechnologies(profile.technologies());
        dto.setSectors(profile.sectors());
        dto.setLanguages(profile.languages().stream().map(ProfileDtoMapper::toDto).toList());
        dto.setExperiences(profile.experiences().stream().map(ProfileDtoMapper::toDto).toList());
        dto.setEducations(profile.educations().stream().map(ProfileDtoMapper::toDto).toList());
        dto.setSkills(profile.skills().stream().map(ProfileDtoMapper::toDto).toList());
        dto.setCompletenessScore(profile.completenessScore());
        if (profile.currentCompensation() != null) {
            dto.setCurrentCompensation(toDto(profile.currentCompensation()));
        }
        return dto;
    }

    public ProfessionalProfile toDomain(final MemberId memberId, final ProfessionalProfileDTO dto) {
        return new ProfessionalProfile(
                memberId,
                dto.getTitle(),
                dto.getSummary(),
                dto.getLocation(),
                dto.getAvailability() == null ? null : Availability.valueOf(dto.getAvailability().getValue()),
                dto.getExpertiseAreas(),
                dto.getTechnologies(),
                dto.getSectors(),
                dto.getLanguages() == null ? List.of() : dto.getLanguages().stream().map(ProfileDtoMapper::toDomain).toList(),
                dto.getExperiences() == null ? List.of() : dto.getExperiences().stream().map(ProfileDtoMapper::toDomain).toList(),
                dto.getEducations() == null ? List.of() : dto.getEducations().stream().map(ProfileDtoMapper::toDomain).toList(),
                dto.getSkills() == null ? List.of() : dto.getSkills().stream().map(ProfileDtoMapper::toDomain).toList(),
                dto.getCurrentCompensation() == null ? null : toDomain(dto.getCurrentCompensation()),
                0);
    }

    private LanguageProficiencyDTO toDto(final LanguageProficiency language) {
        return new LanguageProficiencyDTO(
                language.language(), LanguageProficiencyDTO.LevelEnum.valueOf(language.level().name()));
    }

    private LanguageProficiency toDomain(final LanguageProficiencyDTO dto) {
        return new LanguageProficiency(dto.getLanguage(), LanguageLevel.valueOf(dto.getLevel().getValue()));
    }

    private ExperienceDTO toDto(final Experience experience) {
        final ExperienceDTO dto =
                new ExperienceDTO(experience.id(), experience.organization(), experience.title(), experience.startDate());
        dto.setEndDate(org.openapitools.jackson.nullable.JsonNullable.of(experience.endDate()));
        dto.setCurrent(experience.current());
        dto.setDescription(experience.description());
        dto.setIsDemoData(experience.isDemoData());
        return dto;
    }

    private Experience toDomain(final ExperienceDTO dto) {
        return new Experience(
                dto.getId(),
                dto.getOrganization(),
                dto.getTitle(),
                dto.getStartDate(),
                dto.getEndDate() == null ? null : dto.getEndDate().orElse(null),
                Boolean.TRUE.equals(dto.getCurrent()),
                dto.getDescription(),
                Boolean.TRUE.equals(dto.getIsDemoData()));
    }

    private EducationDTO toDto(final Education education) {
        final EducationDTO dto =
                new EducationDTO(education.id(), education.institution(), education.program(), education.startDate());
        dto.setEndDate(org.openapitools.jackson.nullable.JsonNullable.of(education.endDate()));
        dto.setDescription(education.description());
        return dto;
    }

    private Education toDomain(final EducationDTO dto) {
        return new Education(
                dto.getId(),
                dto.getInstitution(),
                dto.getProgram(),
                dto.getStartDate(),
                dto.getEndDate() == null ? null : dto.getEndDate().orElse(null),
                dto.getDescription());
    }

    private SkillDTO toDto(final Skill skill) {
        final SkillDTO dto = new SkillDTO(skill.id(), skill.name(), skill.category());
        dto.setVerified(skill.verified());
        return dto;
    }

    private Skill toDomain(final SkillDTO dto) {
        return new Skill(dto.getId(), dto.getName(), dto.getCategory(), Boolean.TRUE.equals(dto.getVerified()));
    }

    private CurrentCompensationDTO toDto(final CurrentCompensation compensation) {
        final CurrentCompensationDTO dto = new CurrentCompensationDTO(
                BigDecimal.valueOf(compensation.amount()),
                compensation.currency(),
                CompensationPeriodDTO.valueOf(compensation.period().name()));
        dto.setCountry(compensation.country());
        return dto;
    }

    private CurrentCompensation toDomain(final CurrentCompensationDTO dto) {
        return new CurrentCompensation(
                dto.getAmount().doubleValue(),
                dto.getCurrency(),
                global.oei.domain.shared.network.CompensationPeriod.valueOf(dto.getPeriod().getValue()),
                dto.getCountry());
    }
}
