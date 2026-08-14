package global.oei.domain.shared.event;

import java.util.Optional;

import global.oei.domain.shared.member.MemberId;

public interface EventPhotoConsentPort {

    EventPhotoConsent save(EventPhotoConsent consent);

    Optional<EventPhotoConsent> findByEventIdAndMemberId(String eventId, MemberId memberId);
}
