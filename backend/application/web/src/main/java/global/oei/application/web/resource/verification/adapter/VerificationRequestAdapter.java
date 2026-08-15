package global.oei.application.web.resource.verification.adapter;

import java.util.List;

import global.oei.domain.shared.verification.VerificationRequest;
import global.oei.domain.shared.verification.VerificationType;

public interface VerificationRequestAdapter {

    List<VerificationRequest> listMyRequests();

    VerificationRequest create(VerificationType type, String referenceId);
}
