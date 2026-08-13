package global.oei.domain.shared.charter;

/**
 * Outbound port: persist an ethical charter signature. Signing is append-only (a member may
 * sign successive charter versions over time); there is no "unsign".
 */
public interface EthicalCharterSignaturePort {

    EthicalCharterSignature save(EthicalCharterSignature signature);
}
