package global.oei.application.web.resource.institution;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import global.oei.application.web.PublicInstitutionsApi;
import global.oei.application.web.model.InstitutionOpportunityDTO;
import global.oei.application.web.model.InstitutionOpportunityPageDTO;
import global.oei.application.web.model.InstitutionPublicPageDTO;
import global.oei.application.web.model.InstitutionPublicationDTO;
import global.oei.application.web.model.InstitutionPublicationPageDTO;
import global.oei.application.web.model.PageMetadataDTO;
import global.oei.application.web.resource.institution.adapter.InstitutionAdapter;
import global.oei.application.web.resource.institution.mapper.InstitutionDtoMapper;

/**
 * Implements every operation of {@link PublicInstitutionsApi}: no stub left on this
 * interface. Unauthenticated, read-only.
 */
@RestController
@RequiredArgsConstructor
public class PublicInstitutionsResource implements PublicInstitutionsApi {

    private final InstitutionAdapter institutionAdapter;

    @Override
    public ResponseEntity<InstitutionPublicPageDTO> getPublicInstitution(final String slug) {
        return institutionAdapter.getPublicInstitution(slug)
                .map(institution -> InstitutionDtoMapper.toPublicPageDto(
                        institution, institutionAdapter.getPublicPartnership(slug).orElse(null),
                        institutionAdapter.listPublicInstitutionPublications(slug), institutionAdapter.listPublicInstitutionOpportunities(slug)))
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<InstitutionPublicationPageDTO> listPublicInstitutionPublications(final String slug) {
        final List<InstitutionPublicationDTO> items =
                institutionAdapter.listPublicInstitutionPublications(slug).stream().map(InstitutionDtoMapper::toDto).toList();
        return ResponseEntity.ok(new InstitutionPublicationPageDTO(items, pageMetadata(items.size())));
    }

    @Override
    public ResponseEntity<InstitutionOpportunityPageDTO> listPublicInstitutionOpportunities(final String slug) {
        final List<InstitutionOpportunityDTO> items =
                institutionAdapter.listPublicInstitutionOpportunities(slug).stream().map(InstitutionDtoMapper::toDto).toList();
        return ResponseEntity.ok(new InstitutionOpportunityPageDTO(items, pageMetadata(items.size())));
    }

    private static PageMetadataDTO pageMetadata(final int totalItems) {
        return new PageMetadataDTO(0, totalItems, totalItems);
    }
}
