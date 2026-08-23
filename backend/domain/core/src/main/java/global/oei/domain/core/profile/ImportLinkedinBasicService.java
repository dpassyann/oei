package global.oei.domain.core.profile;

import java.time.Instant;
import java.util.List;
import java.util.Locale;

import lombok.RequiredArgsConstructor;

import global.oei.domain.shared.member.AccountType;
import global.oei.domain.shared.member.Member;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.member.MemberPort;
import global.oei.domain.shared.profile.Availability;
import global.oei.domain.shared.profile.ImportLinkedinBasicUseCase;
import global.oei.domain.shared.profile.LinkedinBasicIdentity;
import global.oei.domain.shared.profile.LinkedinIdentityPort;
import global.oei.domain.shared.profile.ProfessionalProfile;
import global.oei.domain.shared.profile.ProfileLookupPort;
import global.oei.domain.shared.profile.ProfileSource;

/**
 * Orchestrates LinkedIn basic identity import and profile-source bootstrap.
 */
@RequiredArgsConstructor
public class ImportLinkedinBasicService implements ImportLinkedinBasicUseCase {

    private final MemberPort memberPort;
    private final ProfileLookupPort profileLookupPort;
    private final LinkedinIdentityPort linkedinIdentityPort;

    @Override
    public ProfessionalProfile execute(final MemberId memberId, final String accessToken) {
        final LinkedinBasicIdentity identity = linkedinIdentityPort.fetchBasicIdentity(accessToken);

        final Member existingMember = memberPort.findById(memberId).orElseGet(() -> defaultMember(memberId));
        final Member updatedMember = new Member(
                memberId,
                existingMember.publicSlug(),
                nonBlankOrFallback(identity.displayName(), existingMember.displayName()),
                nonBlankOrFallback(identity.legalName(), existingMember.legalName()),
                normalizeLocale(identity.locale(), existingMember.locale()),
                normalizeCountry(identity.country(), existingMember.country()),
                existingMember.accountType(),
                existingMember.createdAt());
        memberPort.save(updatedMember);

        final ProfessionalProfile currentProfile = profileLookupPort.findByMemberId(memberId)
                .orElseGet(() -> blankProfile(memberId));
        final ProfileSource source = mergeSource(currentProfile.source());
        final ProfessionalProfile updatedProfile = currentProfile.withSource(source).withRecomputedCompleteness();
        return profileLookupPort.save(updatedProfile);
    }

    private static Member defaultMember(final MemberId memberId) {
        final String slug = memberId.value().toString().toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        return new Member(memberId, slug, "Membre OEI", "Membre OEI", "fr", "FR", AccountType.REAL, Instant.now());
    }

    private static ProfessionalProfile blankProfile(final MemberId memberId) {
        return new ProfessionalProfile(
                memberId,
                null,
                null,
                null,
                null,
                Availability.NOT_AVAILABLE,
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                null,
                0);
    }

    private static ProfileSource mergeSource(final ProfileSource currentSource) {
        if (currentSource == ProfileSource.CV_IMPORTED || currentSource == ProfileSource.LINKEDIN_AND_CV) {
            return ProfileSource.LINKEDIN_AND_CV;
        }
        return ProfileSource.LINKEDIN_BASIC;
    }

    private static String nonBlankOrFallback(final String value, final String fallback) {
        if (value != null && !value.isBlank()) {
            return value;
        }
        return fallback;
    }

    private static String normalizeLocale(final String value, final String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        final String normalized = value.replace('_', '-').trim();
        final String language = normalized.contains("-") ? normalized.substring(0, normalized.indexOf('-')) : normalized;
        return language.isBlank() ? fallback : language.toLowerCase(Locale.ROOT);
    }

    private static String normalizeCountry(final String value, final String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        final String normalized = value.replace('_', '-').trim();
        if (!normalized.contains("-")) {
            return fallback;
        }
        final String country = normalized.substring(normalized.indexOf('-') + 1);
        return country.isBlank() ? fallback : country.toUpperCase(Locale.ROOT);
    }
}

