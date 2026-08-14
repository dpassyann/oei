package global.oei.domain.shared.event;

import global.oei.domain.shared.member.MemberId;

public interface RegisterToEventUseCase {

    EventRegistration execute(String eventId, MemberId memberId);
}
