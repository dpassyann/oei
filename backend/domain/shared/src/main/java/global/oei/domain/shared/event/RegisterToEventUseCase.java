package global.oei.domain.shared.event;

import global.oei.domain.shared.member.MemberId;

/**
 * Inbound port: register the current caller to an {@link Event} (idempotent).
 */
public interface RegisterToEventUseCase {

    EventRegistration execute(String eventId, MemberId memberId);
}
