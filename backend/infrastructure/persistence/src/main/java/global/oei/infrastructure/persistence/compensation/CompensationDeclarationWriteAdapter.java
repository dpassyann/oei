package global.oei.infrastructure.persistence.compensation;

import java.util.List;

import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.network.CompensationDeclarationCandidate;
import global.oei.domain.shared.network.RecordCompensationDeclarationsPort;

/**
 * Reconciles one member's {@code compensation_declaration} rows with the candidates derived
 * from their profile: delete-then-insert, scoped strictly to {@code memberId} — never touches
 * any other member's rows (including demo-seeded ones), see {@link RecordCompensationDeclarationsPort}'s
 * Javadoc.
 */
@Slf4j
@RequiredArgsConstructor
@Transactional
public class CompensationDeclarationWriteAdapter implements RecordCompensationDeclarationsPort {

    private final CompensationDeclarationRepository repository;

    @Override
    public void replace(final MemberId memberId, final List<CompensationDeclarationCandidate> declarations) {
        log.debug("CompensationDeclarationWriteAdapter: replacing {} declaration(s) for memberId={}",
                declarations.size(), memberId);
        repository.deleteByMemberId(memberId.value());
        if (declarations.isEmpty()) {
            return;
        }
        repository.saveAll(declarations.stream().map(candidate -> toEntity(memberId, candidate)).toList());
    }

    private static CompensationDeclarationEntity toEntity(
            final MemberId memberId, final CompensationDeclarationCandidate candidate) {
        return new CompensationDeclarationEntity(
                null,
                memberId.value(),
                candidate.nodeType().name(),
                candidate.nodeId(),
                candidate.country(),
                candidate.amount(),
                candidate.currency(),
                candidate.period().name());
    }
}
