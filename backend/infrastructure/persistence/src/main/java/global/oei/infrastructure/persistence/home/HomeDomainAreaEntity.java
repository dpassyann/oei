package global.oei.infrastructure.persistence.home;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Entity
@Table(name = "home_domain_area")
public class HomeDomainAreaEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "lang", nullable = false, length = 10)
    private String lang;

    @Column(name = "slug", nullable = false)
    private String slug;

    @Column(name = "icon", nullable = false)
    private String icon;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "last_modified", nullable = false)
    private LocalDate lastModified;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;
}
