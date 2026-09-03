package global.oei.domain.shared.profile;

import java.util.Objects;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.membership.MembershipStatus;
import global.oei.domain.shared.profileimport.ProfileImportStatus;

/**
 * Lightweight read-model returned by {@code GET /api/member/v1/bootstrap}: tells the
 * frontend everything it needs to decide the landing experience without additional API
 * calls.
 *
 * <p>Rules:</p>
 * <ul>
 *   <li>When {@link #profileStatus} is {@link ProfileStatus#ONBOARDING_REQUIRED}, the
 *       Smart Profile Onboarding modal is shown. The member cannot use profile-dependent
 *       features, but public/static content remains accessible.</li>
 *   <li>When {@link #profileStatus} is {@link ProfileStatus#READY} or
 *       {@link ProfileStatus#PROFILE_INCOMPLETE}, the member space loads normally.</li>
 *   <li>{@link #membershipStatus} may be {@code null} when the member has no formal OEI
 *       membership (free professional profile). This is intentionally supported — a profile
 *       may exist without membership.</li>
 * </ul>
 *
 * @param cvStatus projection of the member's most recent
 *                 {@link global.oei.domain.shared.profileimport.ProfileImport} pipeline status
 *                 ({@code null} when the member never started a CV import session). This is
 *                 informational for the frontend; {@link #profileStatus} already factors it
 *                 into {@code ONBOARDING_IN_PROGRESS}/{@code ONBOARDING_REQUIRED}.
 */
public record MemberBootstrap(
        MemberId memberId,
        ProfileStatus profileStatus,
        MembershipStatus membershipStatus,
        String profileId,
        ProfileImportStatus cvStatus) {

    public MemberBootstrap {
        Objects.requireNonNull(memberId, "memberId must not be null");
        Objects.requireNonNull(profileStatus, "profileStatus must not be null");
    }
}

