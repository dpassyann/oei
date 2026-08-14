package global.oei.application.web.resource.institution;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import global.oei.application.web.InstitutionRecognitionApi;
import global.oei.application.web.model.InstitutionBadgeProposalCreationDTO;
import global.oei.application.web.model.InstitutionBadgeProposalDTO;
import global.oei.application.web.resource.institution.adapter.InstitutionAdapter;
import global.oei.application.web.resource.institution.mapper.InstitutionDtoMapper;
import global.oei.domain.shared.member.MemberId;
import lombok.RequiredArgsConstructor;

/**
 * Implements every operation of {@link InstitutionRecognitionApi}: no stub left on this
 * interface.
 */
@RestController
@RequiredArgsConstructor
public class InstitutionRecognitionResource implements InstitutionRecognitionApi {

    private final InstitutionAdapter institutionAdapter;

    @Override
    public ResponseEntity<List<InstitutionBadgeProposalDTO>> listInstitutionBadgeProposals() {
        return ResponseEntity.ok(institutionAdapter.listBadgeProposals().stream().map(InstitutionDtoMapper::toDto).toList());
    }

    @Override
    public ResponseEntity<InstitutionBadgeProposalDTO> createInstitutionBadgeProposal(final InstitutionBadgeProposalCreationDTO dto) {
        final var proposal = institutionAdapter.createBadgeProposal(MemberId.of(dto.getMemberId()), dto.getProposedBadgeCode(), dto.getJustification());
        return ResponseEntity.status(HttpStatus.CREATED).body(InstitutionDtoMapper.toDto(proposal));
    }
}
