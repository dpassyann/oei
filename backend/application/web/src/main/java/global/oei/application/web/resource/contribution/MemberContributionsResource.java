package global.oei.application.web.resource.contribution;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import global.oei.application.web.MemberContributionsApi;
import global.oei.application.web.model.AddContributionCommentRequestDTO;
import global.oei.application.web.model.ContentCommentDTO;
import global.oei.application.web.model.ContentContributionCreationDTO;
import global.oei.application.web.model.ContentContributionDTO;
import global.oei.application.web.resource.contribution.adapter.ContributionAdapter;
import global.oei.application.web.resource.contribution.mapper.ContributionDtoMapper;
import lombok.RequiredArgsConstructor;

/**
 * Implements every operation of {@link MemberContributionsApi}.
 */
@RestController
@RequiredArgsConstructor
public class MemberContributionsResource implements MemberContributionsApi {

    private final ContributionAdapter contributionAdapter;

    @Override
    public ResponseEntity<List<ContentContributionDTO>> listMyContributions() {
        return ResponseEntity.ok(contributionAdapter.listMyContributions().stream().map(ContributionDtoMapper::toDto).toList());
    }

    @Override
    public ResponseEntity<ContentContributionDTO> createContribution(final ContentContributionCreationDTO request) {
        final var created = contributionAdapter.create(request.getContentId(), request.getPatch());
        return ResponseEntity.status(HttpStatus.CREATED).body(ContributionDtoMapper.toDto(created));
    }

    @Override
    public ResponseEntity<List<ContentCommentDTO>> listContributionComments(final String id) {
        return contributionAdapter.listComments(id)
                .map(comments -> ResponseEntity.ok(comments.stream().map(ContributionDtoMapper::toDto).toList()))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<ContentCommentDTO> addContributionComment(final String id, final AddContributionCommentRequestDTO request) {
        return contributionAdapter.addComment(id, request.getBody())
                .map(ContributionDtoMapper::toDto)
                .map(dto -> ResponseEntity.status(HttpStatus.CREATED).body(dto))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
