package global.oei.domain.shared.cv;

import global.oei.domain.shared.member.MemberId;

/**
 * Inbound port: create a brand-new {@link Cv} for {@code memberId}, always starting
 * {@link CvStatus#DRAFT} with no sections.
 */
public interface CreateCvUseCase {

    Cv execute(MemberId memberId, String templateId, String sourceLanguage);
}
