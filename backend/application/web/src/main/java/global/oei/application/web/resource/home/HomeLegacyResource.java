package global.oei.application.web.resource.home;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import global.oei.application.web.HomeLegacyApi;
import global.oei.application.web.model.DomainAreaDTO;
import global.oei.application.web.model.NewsItemDTO;
import global.oei.application.web.model.PartnerDTO;
import global.oei.application.web.model.StatDTO;
import global.oei.application.web.model.SubmitContactMessageRequestDTO;
import global.oei.application.web.model.SubmitLeadRequestDTO;
import global.oei.application.web.resource.home.mapper.HomeDtoMapper;
import global.oei.domain.shared.home.ContactMessage;
import global.oei.domain.shared.home.ContactMessagePort;
import global.oei.domain.shared.home.HomeDomainAreaPort;
import global.oei.domain.shared.home.HomeNewsPort;
import global.oei.domain.shared.home.HomePartnerPort;
import global.oei.domain.shared.home.HomeStatPort;
import global.oei.domain.shared.home.Lead;
import global.oei.domain.shared.home.LeadPort;
import lombok.RequiredArgsConstructor;

/**
 * Implements every operation of {@link HomeLegacyApi}: no stub left on this interface. Every
 * read is a direct, real query against its own small port (see each port's Javadoc for the
 * "always 0"/"demo data" simplifications the OpenAPI summaries themselves document);
 * {@code submitLead}/{@code submitContactMessage} genuinely persist the submission (see
 * {@link Lead}/{@link ContactMessage}'s Javadoc for what remains simulated: no real
 * mailing-list/email integration).
 */
@RestController
@RequiredArgsConstructor
public class HomeLegacyResource implements HomeLegacyApi {

    private final HomeStatPort homeStatPort;
    private final HomeDomainAreaPort homeDomainAreaPort;
    private final HomeNewsPort homeNewsPort;
    private final HomePartnerPort homePartnerPort;
    private final LeadPort leadPort;
    private final ContactMessagePort contactMessagePort;

    @Override
    public ResponseEntity<List<StatDTO>> getHomeStats(final String lang) {
        return ResponseEntity.ok(homeStatPort.findByLang(lang).stream().map(HomeDtoMapper::toDto).toList());
    }

    @Override
    public ResponseEntity<List<DomainAreaDTO>> getDomainAreas(final String lang) {
        return ResponseEntity.ok(homeDomainAreaPort.findByLang(lang).stream().map(HomeDtoMapper::toDto).toList());
    }

    @Override
    public ResponseEntity<List<NewsItemDTO>> getLatestNews(final String lang, final Integer limit) {
        return ResponseEntity.ok(homeNewsPort.findByLang(lang, limit).stream().map(HomeDtoMapper::toDto).toList());
    }

    @Override
    public ResponseEntity<List<PartnerDTO>> getPartners(final String lang) {
        return ResponseEntity.ok(homePartnerPort.findByLang(lang).stream().map(HomeDtoMapper::toDto).toList());
    }

    @Override
    public ResponseEntity<PartnerDTO> getPartner(final String lang, final String id) {
        return homePartnerPort.findByLangAndId(lang, id).map(HomeDtoMapper::toDto).map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<Void> submitLead(final SubmitLeadRequestDTO request) {
        leadPort.save(new Lead(UUID.randomUUID().toString(), request.getEmail(), Instant.now()));
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<Void> submitContactMessage(final SubmitContactMessageRequestDTO request) {
        contactMessagePort.save(new ContactMessage(
                UUID.randomUUID().toString(), request.getName(), request.getEmail(), request.getSubject(), request.getMessage(),
                Instant.now()));
        return ResponseEntity.noContent().build();
    }
}
