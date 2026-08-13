package global.oei.domain.shared.network;

import java.util.List;
import java.util.Objects;

import global.oei.domain.shared.member.MemberId;

/**
 * A member's expertise in one topic, as shown on the Professional Neural Network canvas.
 * {@link #id()} is the underlying {@link MemberId} — an OEI member is never a synthetic
 * "expert" identity of its own, per this iteration's decision to reuse real (or demo) member
 * rows directly as graph experts.
 */
public record NetworkExpert(
        MemberId id,
        String topicId,
        String domainId,
        String label,
        String role,
        String company,
        String country,
        NetworkExpertLevel level,
        int score,
        List<String> certificationLabels,
        List<String> badges,
        List<String> journeyTopicIds,
        double x,
        double y) {

    public NetworkExpert {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(topicId, "topicId must not be null");
        Objects.requireNonNull(domainId, "domainId must not be null");
        Objects.requireNonNull(label, "label must not be null");
        Objects.requireNonNull(level, "level must not be null");
        certificationLabels = List.copyOf(certificationLabels == null ? List.of() : certificationLabels);
        badges = List.copyOf(badges == null ? List.of() : badges);
        journeyTopicIds = List.copyOf(journeyTopicIds == null ? List.of() : journeyTopicIds);
    }
}
