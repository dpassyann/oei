package global.oei.infrastructure.persistence.network;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * A member's expertise in one topic. Deliberately references {@link #memberId} rather than
 * duplicating {@code label}/{@code country} from {@code member} -- an OEI member is never a
 * separate synthetic "expert" identity, real (or demo) member rows are reused directly as
 * graph experts (see {@code NetworkGraphPersistenceAdapter}, which joins back to
 * {@code MemberRepository} for those fields).
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Entity
@Table(name = "network_expert")
public class NetworkExpertEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @Column(name = "topic_id", nullable = false, length = 40)
    private String topicId;

    @Column(name = "domain_id", nullable = false, length = 40)
    private String domainId;

    @Column(name = "role", nullable = false)
    private String role;

    @Column(name = "company", nullable = false)
    private String company;

    @Column(name = "level", nullable = false, length = 5)
    private String level;

    @Column(name = "score", nullable = false)
    private int score;

    @Column(name = "certification_labels")
    private String certificationLabels;

    @Column(name = "badges")
    private String badges;

    @Column(name = "journey_topic_ids")
    private String journeyTopicIds;

    @Column(name = "x", nullable = false)
    private double x;

    @Column(name = "y", nullable = false)
    private double y;
}
