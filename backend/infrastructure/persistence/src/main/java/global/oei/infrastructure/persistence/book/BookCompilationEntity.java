package global.oei.infrastructure.persistence.book;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Entity
@Table(name = "book_compilation")
public class BookCompilationEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "title", nullable = false)
    private String title;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "content_ids_json", columnDefinition = "jsonb")
    private String contentIdsJson;

    @Column(name = "cover_asset_id")
    private UUID coverAssetId;

    @Column(name = "isbn")
    private String isbn;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "table_of_contents_json", columnDefinition = "jsonb")
    private String tableOfContentsJson;

    @Column(name = "version", nullable = false)
    private String version;
}
