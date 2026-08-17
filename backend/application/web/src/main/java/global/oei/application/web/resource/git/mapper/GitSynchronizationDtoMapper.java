package global.oei.application.web.resource.git.mapper;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

import org.openapitools.jackson.nullable.JsonNullable;

import lombok.experimental.UtilityClass;

import global.oei.application.web.model.GitSyncedFileDTO;
import global.oei.application.web.model.GitSynchronizationDTO;
import global.oei.application.web.model.GitSynchronizationStatusDTO;
import global.oei.domain.shared.git.GitSyncedFile;
import global.oei.domain.shared.git.GitSynchronization;

@UtilityClass
public class GitSynchronizationDtoMapper {

    public GitSynchronizationDTO toDto(final GitSynchronization synchronization) {
        final GitSynchronizationDTO dto = new GitSynchronizationDTO(
                synchronization.id(), GitSynchronizationStatusDTO.valueOf(synchronization.status().name()));
        dto.setStartedAt(synchronization.startedAt() == null ? null : LocalDateTime.ofInstant(synchronization.startedAt(), ZoneOffset.UTC));
        dto.setFinishedAt(JsonNullable.of(
                synchronization.finishedAt() == null ? null : LocalDateTime.ofInstant(synchronization.finishedAt(), ZoneOffset.UTC)));
        dto.setCommitsProcessed(synchronization.commitsProcessed());
        dto.setErrors(synchronization.errors());
        return dto;
    }

    public GitSyncedFileDTO toDto(final GitSyncedFile file) {
        return new GitSyncedFileDTO(file.path(), file.gitRef(), file.commitSha(), file.rawContent());
    }
}
