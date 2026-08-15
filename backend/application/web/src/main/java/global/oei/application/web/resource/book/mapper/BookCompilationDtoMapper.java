package global.oei.application.web.resource.book.mapper;

import java.net.URI;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

import global.oei.application.web.model.BookCompilationDTO;
import global.oei.application.web.model.PdfGenerationJobDTO;
import global.oei.application.web.model.PdfGenerationJobStatusDTO;
import global.oei.domain.shared.book.BookCompilation;
import global.oei.domain.shared.cv.PdfGenerationJob;
import lombok.experimental.UtilityClass;
import org.openapitools.jackson.nullable.JsonNullable;

@UtilityClass
public class BookCompilationDtoMapper {

    public BookCompilationDTO toDto(final BookCompilation compilation) {
        final BookCompilationDTO dto = new BookCompilationDTO(
                compilation.title(), List.copyOf(compilation.contentIds()), compilation.id(), compilation.version());
        dto.setCoverAssetId(compilation.coverAssetId());
        dto.setIsbn(JsonNullable.of(compilation.isbn()));
        dto.setTableOfContents(List.copyOf(compilation.tableOfContents()));
        return dto;
    }

    public PdfGenerationJobDTO toDto(final PdfGenerationJob job) {
        final PdfGenerationJobDTO dto = new PdfGenerationJobDTO(
                job.id(), PdfGenerationJobDTO.TargetTypeEnum.valueOf(job.targetType().name()), job.targetId(),
                PdfGenerationJobStatusDTO.valueOf(job.status().name()));
        dto.setResultUrl(JsonNullable.of(job.resultUrl() == null ? null : URI.create(job.resultUrl())));
        dto.setRequestedAt(job.requestedAt() == null ? null : LocalDateTime.ofInstant(job.requestedAt(), ZoneOffset.UTC));
        dto.setCompletedAt(JsonNullable.of(
                job.completedAt() == null ? null : LocalDateTime.ofInstant(job.completedAt(), ZoneOffset.UTC)));
        return dto;
    }
}
