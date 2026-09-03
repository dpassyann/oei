package global.oei.domain.shared.profileimport;

import global.oei.domain.shared.member.MemberId;

/**
 * Starts a new "Smart CV Import" pipeline session for the given member from an already
 * received document, per {@code POST /api/member/v1/profile-import/cv}: the document is part
 * of the same multipart request, so the session is created and immediately advanced to
 * {@link ProfileImportStatus#DOCUMENT_UPLOADED} in one step — there is no observable moment
 * where it sits at {@link ProfileImportStatus#CREATED}.
 */
public interface InitiateProfileImportUseCase {

    ProfileImport execute(MemberId memberId, ProfileImportSource source);
}
