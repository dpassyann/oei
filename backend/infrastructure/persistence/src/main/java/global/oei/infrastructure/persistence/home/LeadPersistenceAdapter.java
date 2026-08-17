package global.oei.infrastructure.persistence.home;

import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.domain.shared.home.Lead;
import global.oei.domain.shared.home.LeadPort;

@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LeadPersistenceAdapter implements LeadPort {

    private final HomeLeadRepository repository;

    @Override
    @Transactional
    public Lead save(final Lead lead) {
        repository.save(new HomeLeadEntity(UUID.fromString(lead.id()), lead.email(), lead.submittedAt()));
        return lead;
    }
}
