package global.oei.domain.shared.network;

import java.util.List;

/**
 * A network topic together with the recognized certifications attached to it.
 */
public record NetworkTopicsAndCertifications(List<NetworkTopic> topics, List<NetworkCertification> certifications) {

    public NetworkTopicsAndCertifications {
        topics = List.copyOf(topics == null ? List.of() : topics);
        certifications = List.copyOf(certifications == null ? List.of() : certifications);
    }
}
