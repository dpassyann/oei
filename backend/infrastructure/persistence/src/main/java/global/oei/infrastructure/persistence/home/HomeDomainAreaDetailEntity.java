package global.oei.infrastructure.persistence.home;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Entity
@Table(name = "home_domain_area_detail")
public class HomeDomainAreaDetailEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "lang", nullable = false, length = 10)
    private String lang;

    @Column(name = "slug", nullable = false)
    private String slug;

    @Column(name = "subtitle")
    private String subtitle;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "sections_json", nullable = false, columnDefinition = "jsonb")
    private String sectionsJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "related_resources_json", nullable = false, columnDefinition = "jsonb")
    private String relatedResourcesJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "related_news_json", nullable = false, columnDefinition = "jsonb")
    private String relatedNewsJson;

    @Column(name = "is_content_fallback")
    private Boolean isContentFallback;
}



