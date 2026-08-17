package global.oei.infrastructure.persistence.wallet;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.membership.MembershipTier;
import global.oei.domain.shared.wallet.WalletPass;
import global.oei.domain.shared.wallet.WalletPassPort;
import global.oei.domain.shared.wallet.WalletPassProvider;
import global.oei.domain.shared.wallet.WalletPassStatus;
import global.oei.domain.shared.wallet.WalletPassVerification;
import global.oei.infrastructure.persistence.member.MemberEntity;
import global.oei.infrastructure.persistence.member.MemberRepository;
import global.oei.infrastructure.persistence.membership.MembershipEntity;
import global.oei.infrastructure.persistence.membership.MembershipRepository;

@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WalletPassPersistenceAdapter implements WalletPassPort {

    private final WalletPassRepository repository;
    private final MemberRepository memberRepository;
    private final MembershipRepository membershipRepository;

    @Override
    @Transactional
    public WalletPass save(final WalletPass pass) {
        final WalletPassEntity entity = new WalletPassEntity(
                UUID.fromString(pass.id()),
                pass.memberId().value(),
                pass.provider().name(),
                pass.status().name(),
                pass.serialNumber(),
                pass.verificationUrl(),
                pass.levelColor(),
                pass.issuedAt(),
                pass.revokedAt(),
                pass.mocked());
        repository.save(entity);
        return pass;
    }

    @Override
    public List<WalletPass> findByMemberId(final MemberId memberId) {
        return repository.findByMemberId(memberId.value()).stream().map(WalletPassPersistenceAdapter::toDomain).toList();
    }

    @Override
    public Optional<WalletPass> findById(final String id) {
        return repository.findById(UUID.fromString(id)).map(WalletPassPersistenceAdapter::toDomain);
    }

    @Override
    public Optional<WalletPassVerification> verifyBySerialNumber(final String serialNumber) {
        return repository.findBySerialNumber(serialNumber).map(entity -> {
            final MemberEntity member = memberRepository.findById(entity.getMemberId()).orElse(null);
            final MembershipEntity membership = membershipRepository.findByMemberId(entity.getMemberId()).orElse(null);
            final boolean valid = "MOCKED".equals(entity.getStatus()) || "ISSUED".equals(entity.getStatus())
                    || "RENEWED".equals(entity.getStatus());
            return new WalletPassVerification(
                    valid,
                    member == null ? null : member.getPublicSlug(),
                    WalletPassStatus.valueOf(entity.getStatus()),
                    membership == null ? null : MembershipTier.valueOf(membership.getTier()));
        });
    }

    private static WalletPass toDomain(final WalletPassEntity entity) {
        return new WalletPass(
                entity.getId().toString(),
                new MemberId(entity.getMemberId()),
                WalletPassProvider.valueOf(entity.getProvider()),
                WalletPassStatus.valueOf(entity.getStatus()),
                entity.getSerialNumber(),
                entity.getVerificationUrl(),
                entity.getLevelColor(),
                entity.getIssuedAt(),
                entity.getRevokedAt(),
                entity.isMocked());
    }
}
