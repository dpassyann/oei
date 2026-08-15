package global.oei.infrastructure.persistence.badge;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Reference/catalog data: the badges OEI can award, not a member-specific record (see
 * {@link BadgeAwardEntity}).
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Entity
@Table(name = "badge")
public class BadgeEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false, length = 40)
    private String id;

    @Column(name = "code", nullable = false, unique = true, length = 60)
    private String code;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "icon_url")
    private String iconUrl;

    @Column(name = "category", nullable = false, length = 20)
    private String category;
}
