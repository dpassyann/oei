package global.oei.infrastructure.wiring;

import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import global.oei.domain.core.certification.DeclareCertificationService;
import global.oei.domain.core.charter.SignEthicalCharterService;
import global.oei.domain.core.cv.CreateCvService;
import global.oei.domain.core.cv.RenderCvService;
import global.oei.domain.core.identity.GetMyIdentityService;
import global.oei.domain.core.network.GetSalaryInsightService;
import global.oei.domain.core.profile.GetMyProfileService;
import global.oei.domain.core.profile.UpdateMyProfileService;
import global.oei.domain.core.wallet.CreateWalletPassService;
import global.oei.domain.shared.badge.BadgeAwardPort;
import global.oei.domain.shared.badge.BadgeCatalogPort;
import global.oei.domain.shared.certification.CertificationGoalPort;
import global.oei.domain.shared.certification.CertificationPort;
import global.oei.domain.shared.certification.DeclareCertificationUseCase;
import global.oei.domain.shared.charter.EthicalCharterSignaturePort;
import global.oei.domain.shared.charter.SignEthicalCharterUseCase;
import global.oei.domain.shared.cv.CreateCvUseCase;
import global.oei.domain.shared.cv.CvPort;
import global.oei.domain.shared.cv.CvTemplateCatalogPort;
import global.oei.domain.shared.cv.PdfGenerationJobPort;
import global.oei.domain.shared.cv.RenderCvUseCase;
import global.oei.domain.shared.membership.MembershipLookupPort;
import global.oei.domain.shared.network.GetSalaryInsightUseCase;
import global.oei.domain.shared.network.NetworkGraphPort;
import global.oei.domain.shared.profile.GetMyProfileUseCase;
import global.oei.domain.shared.profile.ProfileLookupPort;
import global.oei.domain.shared.profile.UpdateMyProfileUseCase;
import global.oei.domain.shared.security.GetMyIdentityUseCase;
import global.oei.domain.shared.security.SecurityContextPort;
import global.oei.domain.shared.wallet.CreateWalletPassUseCase;
import global.oei.domain.shared.wallet.WalletPassPort;
import global.oei.infrastructure.persistence.badge.BadgeAwardRepository;
import global.oei.infrastructure.persistence.badge.BadgePersistenceAdapter;
import global.oei.infrastructure.persistence.badge.BadgeRepository;
import global.oei.infrastructure.persistence.certification.CertificationGoalPersistenceAdapter;
import global.oei.infrastructure.persistence.certification.CertificationPersistenceAdapter;
import global.oei.infrastructure.persistence.certification.CertificationRepository;
import global.oei.infrastructure.persistence.certification.MemberCertificationGoalRepository;
import global.oei.infrastructure.persistence.charter.EthicalCharterSignaturePersistenceAdapter;
import global.oei.infrastructure.persistence.charter.EthicalCharterSignatureRepository;
import global.oei.infrastructure.persistence.compensation.CompensationDeclarationRepository;
import global.oei.infrastructure.persistence.compensation.SalaryInsightPersistenceAdapter;
import global.oei.infrastructure.persistence.config.audit.PersistenceAuditingConfiguration;
import global.oei.infrastructure.persistence.cv.CvPersistenceAdapter;
import global.oei.infrastructure.persistence.cv.CvRepository;
import global.oei.infrastructure.persistence.cv.CvTemplateCatalogPersistenceAdapter;
import global.oei.infrastructure.persistence.cv.CvTemplateRepository;
import global.oei.infrastructure.persistence.member.MemberRepository;
import global.oei.infrastructure.persistence.membership.MembershipPersistenceAdapter;
import global.oei.infrastructure.persistence.membership.MembershipRepository;
import global.oei.infrastructure.persistence.network.NetworkCertificationRepository;
import global.oei.infrastructure.persistence.network.NetworkDomainRepository;
import global.oei.infrastructure.persistence.network.NetworkExpertRepository;
import global.oei.infrastructure.persistence.network.NetworkGraphPersistenceAdapter;
import global.oei.infrastructure.persistence.network.NetworkTopicRepository;
import global.oei.infrastructure.persistence.pdf.PdfGenerationJobPersistenceAdapter;
import global.oei.infrastructure.persistence.pdf.PdfGenerationJobRepository;
import global.oei.infrastructure.persistence.profile.ProfessionalProfilePersistenceAdapter;
import global.oei.infrastructure.persistence.profile.ProfessionalProfileRepository;
import global.oei.infrastructure.persistence.wallet.WalletPassPersistenceAdapter;
import global.oei.infrastructure.persistence.wallet.WalletPassRepository;

/**
 * Composition root of the OEI backend.
 *
 * <p>This is the sole class in the project — outside {@code domain-core} itself — allowed
 * to import concrete {@code domain-core} types. Every {@code @Bean} method here returns a
 * {@code domain-shared} interface (an inbound use case or an outbound port), constructed
 * from a concrete {@code domain-core} implementation wired with outbound port adapters
 * provided by {@code infrastructure-security}/{@code infrastructure-persistence}.
 * {@code application-web} (and any future primary adapter) therefore never needs to
 * reference {@code domain-core} directly — it consumes the interfaces exposed here.</p>
 *
 * <p><b>No classpath component scanning</b> (see the spring-boot-ddd-backend skill's
 * "Explicit wiring" rule): every adapter bean below is instantiated explicitly. The two
 * exceptions are structural requirements of the underlying mechanism, not application
 * component scanning, and are declared explicitly with a narrow {@code basePackages}:</p>
 * <ul>
 *   <li>{@link EnableJpaRepositories} — Spring Data JPA can only generate repository proxy
 *       beans for {@code interface}s it discovers under the given base package; there is no
 *       {@code @Bean}-based equivalent for repository proxy generation.</li>
 *   <li>{@link EntityScan} — the JPA persistence unit needs to know which packages contain
 *       {@code @Entity} classes; again a structural requirement, not a component scan.</li>
 * </ul>
 * {@link PersistenceAuditingConfiguration} itself is a plain {@code @Configuration} with
 * explicit {@code @Bean} methods, so it is pulled in via {@code @Import} rather than scanned.
 */
@Configuration(proxyBeanMethods = false)
@Import(PersistenceAuditingConfiguration.class)
@EnableJpaRepositories(basePackages = "global.oei.infrastructure.persistence")
@EntityScan(basePackages = "global.oei.infrastructure.persistence")
public class OeiWiringConfiguration {

    @Bean
    public GetMyIdentityUseCase getMyIdentityUseCase(final SecurityContextPort securityContextPort) {
        return new GetMyIdentityService(securityContextPort);
    }

    @Bean
    public MembershipLookupPort membershipLookupPort(final MembershipRepository membershipRepository) {
        return new MembershipPersistenceAdapter(membershipRepository);
    }

    @Bean
    public GetSalaryInsightUseCase getSalaryInsightUseCase(final CompensationDeclarationRepository repository) {
        return new GetSalaryInsightService(new SalaryInsightPersistenceAdapter(repository));
    }

    @Bean
    public ProfileLookupPort profileLookupPort(final ProfessionalProfileRepository repository) {
        return new ProfessionalProfilePersistenceAdapter(repository);
    }

    @Bean
    public GetMyProfileUseCase getMyProfileUseCase(final ProfileLookupPort profileLookupPort) {
        return new GetMyProfileService(profileLookupPort);
    }

    @Bean
    public UpdateMyProfileUseCase updateMyProfileUseCase(final ProfileLookupPort profileLookupPort) {
        return new UpdateMyProfileService(profileLookupPort);
    }

    @Bean
    public SignEthicalCharterUseCase signEthicalCharterUseCase(final EthicalCharterSignatureRepository repository) {
        return new SignEthicalCharterService(new EthicalCharterSignaturePersistenceAdapter(repository));
    }

    @Bean
    public NetworkGraphPort networkGraphPort(
            final NetworkDomainRepository domainRepository,
            final NetworkTopicRepository topicRepository,
            final NetworkCertificationRepository certificationRepository,
            final NetworkExpertRepository expertRepository,
            final MemberRepository memberRepository) {
        return new NetworkGraphPersistenceAdapter(
                domainRepository, topicRepository, certificationRepository, expertRepository, memberRepository);
    }

    @Bean
    public BadgePersistenceAdapter badgePersistenceAdapter(
            final BadgeRepository badgeRepository, final BadgeAwardRepository badgeAwardRepository) {
        return new BadgePersistenceAdapter(badgeRepository, badgeAwardRepository);
    }

    @Bean
    public BadgeCatalogPort badgeCatalogPort(final BadgePersistenceAdapter badgePersistenceAdapter) {
        return badgePersistenceAdapter;
    }

    @Bean
    public BadgeAwardPort badgeAwardPort(final BadgePersistenceAdapter badgePersistenceAdapter) {
        return badgePersistenceAdapter;
    }

    @Bean
    public CertificationPort certificationPort(final CertificationRepository repository) {
        return new CertificationPersistenceAdapter(repository);
    }

    @Bean
    public DeclareCertificationUseCase declareCertificationUseCase(final CertificationPort certificationPort) {
        return new DeclareCertificationService(certificationPort);
    }

    @Bean
    public CertificationGoalPort certificationGoalPort(final MemberCertificationGoalRepository repository) {
        return new CertificationGoalPersistenceAdapter(repository);
    }

    @Bean
    public WalletPassPort walletPassPort(
            final WalletPassRepository walletPassRepository,
            final MemberRepository memberRepository,
            final MembershipRepository membershipRepository) {
        return new WalletPassPersistenceAdapter(walletPassRepository, memberRepository, membershipRepository);
    }

    @Bean
    public CreateWalletPassUseCase createWalletPassUseCase(final WalletPassPort walletPassPort) {
        return new CreateWalletPassService(walletPassPort);
    }

    @Bean
    public CvPort cvPort(final CvRepository repository) {
        return new CvPersistenceAdapter(repository);
    }

    @Bean
    public CreateCvUseCase createCvUseCase(final CvPort cvPort) {
        return new CreateCvService(cvPort);
    }

    @Bean
    public CvTemplateCatalogPort cvTemplateCatalogPort(final CvTemplateRepository repository) {
        return new CvTemplateCatalogPersistenceAdapter(repository);
    }

    @Bean
    public PdfGenerationJobPort pdfGenerationJobPort(final PdfGenerationJobRepository repository) {
        return new PdfGenerationJobPersistenceAdapter(repository);
    }

    @Bean
    public RenderCvUseCase renderCvUseCase(final PdfGenerationJobPort pdfGenerationJobPort) {
        return new RenderCvService(pdfGenerationJobPort);
    }
}
