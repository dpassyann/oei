package global.oei.domain.shared.profile;

/**
 * Inbound port: replace the current caller's {@link ProfessionalProfile} wholesale (see the
 * type's own Javadoc on why this is a full replace, not per-field CRUD). Recomputes
 * {@link ProfessionalProfile#completenessScore()} server-side before persisting — the
 * caller-submitted value, if any, is ignored.
 */
public interface UpdateMyProfileUseCase {

    ProfessionalProfile execute(ProfessionalProfile profile);
}
