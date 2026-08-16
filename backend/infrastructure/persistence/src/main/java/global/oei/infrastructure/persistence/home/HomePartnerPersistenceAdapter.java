package global.oei.infrastructure.persistence.home;

import java.util.List;
import java.util.Optional;

import org.springframework.transaction.annotation.Transactional;

import global.oei.domain.shared.home.HomePartner;
import global.oei.domain.shared.home.HomePartnerPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HomePartnerPersistenceAdapter implements HomePartnerPort {

    private final HomePartnerRepository repository;

    @Override
    public List<HomePartner> findByLang(final String lang) {
        return repository.findByLang(lang).stream().map(HomePartnerPersistenceAdapter::toDomain).toList();
    }

    @Override
    public Optional<HomePartner> findByLangAndId(final String lang, final String id) {
        return repository.findByLangAndExternalId(lang, id).map(HomePartnerPersistenceAdapter::toDomain);
    }

    private static HomePartner toDomain(final HomePartnerEntity entity) {
        return new HomePartner(
                entity.getExternalId(), entity.getLang(), entity.getName(), entity.getLogoUrl(), entity.getDescription(),
                entity.getWebsiteUrl(), entity.getCategory());
    }
}
