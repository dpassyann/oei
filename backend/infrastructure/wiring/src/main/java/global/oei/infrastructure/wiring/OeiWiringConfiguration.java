package global.oei.infrastructure.wiring;

import java.util.List;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.mail.javamail.JavaMailSender;
import org.thymeleaf.spring6.SpringTemplateEngine;

import global.oei.domain.core.badge.AwardBadgeService;
import global.oei.domain.core.book.CreateBookCompilationService;
import global.oei.domain.core.book.RenderBookCompilationService;
import global.oei.domain.core.certification.CreateRecognizedCertificationService;
import global.oei.domain.core.certification.DeclareCertificationService;
import global.oei.domain.core.certification.RejectCertificationService;
import global.oei.domain.core.certification.ValidateCertificationService;
import global.oei.domain.core.charter.SignEthicalCharterService;
import global.oei.domain.core.content.CreateContentContributionService;
import global.oei.domain.core.content.CreateContentService;
import global.oei.domain.core.content.CreateContentVersionService;
import global.oei.domain.core.cv.CreateCvService;
import global.oei.domain.core.cv.RenderCvService;
import global.oei.domain.core.event.RegisterToEventService;
import global.oei.domain.core.event.SubmitEventProposalService;
import global.oei.domain.core.git.TriggerGitSynchronizationService;
import global.oei.domain.core.identity.GetMyIdentityService;
import global.oei.domain.core.institution.CreateInstitutionBadgeProposalService;
import global.oei.domain.core.institution.CreateInstitutionInvitationService;
import global.oei.domain.core.institution.CreateInstitutionOpportunityService;
import global.oei.domain.core.institution.CreateInstitutionPublicationService;
import global.oei.domain.core.institution.CreateInstitutionService;
import global.oei.domain.core.institution.RequestEmploymentAffiliationService;
import global.oei.domain.core.media.UploadMediaAssetService;
import global.oei.domain.core.member.RegisterAccountService;
import global.oei.domain.core.membershipfee.PayMembershipFeeService;
import global.oei.domain.core.network.GetSalaryInsightService;
import global.oei.domain.core.profile.GetMyProfileService;
import global.oei.domain.core.profile.UpdateMyProfileService;
import global.oei.domain.core.publicprofile.GenerateDigitalBusinessCardService;
import global.oei.domain.core.publicprofile.PublishPublicProfileService;
import global.oei.domain.core.store.CreateOrderService;
import global.oei.domain.core.store.GenerateBusinessCardPreviewService;
import global.oei.domain.core.store.PayOrderService;
import global.oei.domain.core.store.RefundOrderService;
import global.oei.domain.core.verification.ApproveVerificationRequestService;
import global.oei.domain.core.verification.CreateVerificationRequestService;
import global.oei.domain.core.verification.RejectVerificationRequestService;
import global.oei.domain.core.wallet.CreateWalletPassService;
import global.oei.domain.shared.badge.AwardBadgeUseCase;
import global.oei.domain.shared.badge.BadgeAwardPort;
import global.oei.domain.shared.badge.BadgeCatalogPort;
import global.oei.domain.shared.book.BookCompilationPort;
import global.oei.domain.shared.book.CreateBookCompilationUseCase;
import global.oei.domain.shared.book.RenderBookCompilationUseCase;
import global.oei.domain.shared.certification.CertificationGoalPort;
import global.oei.domain.shared.certification.CertificationPort;
import global.oei.domain.shared.certification.CreateRecognizedCertificationUseCase;
import global.oei.domain.shared.certification.DeclareCertificationUseCase;
import global.oei.domain.shared.certification.RecognizedCertificationPort;
import global.oei.domain.shared.certification.RejectCertificationUseCase;
import global.oei.domain.shared.certification.ValidateCertificationUseCase;
import global.oei.domain.shared.charter.SignEthicalCharterUseCase;
import global.oei.domain.shared.content.ContentApprovalPort;
import global.oei.domain.shared.content.ContentCommentPort;
import global.oei.domain.shared.content.ContentContributionPort;
import global.oei.domain.shared.content.ContentPort;
import global.oei.domain.shared.content.ContentPublicationPort;
import global.oei.domain.shared.content.ContentTranslationPort;
import global.oei.domain.shared.content.ContentVersionPort;
import global.oei.domain.shared.content.CreateContentContributionUseCase;
import global.oei.domain.shared.content.CreateContentUseCase;
import global.oei.domain.shared.content.CreateContentVersionUseCase;
import global.oei.domain.shared.cv.CreateCvUseCase;
import global.oei.domain.shared.cv.CvPort;
import global.oei.domain.shared.cv.CvTemplateCatalogPort;
import global.oei.domain.shared.cv.PdfGenerationJobPort;
import global.oei.domain.shared.cv.RenderCvUseCase;
import global.oei.domain.shared.event.EventCommentPort;
import global.oei.domain.shared.event.EventPhotoConsentPort;
import global.oei.domain.shared.event.EventPort;
import global.oei.domain.shared.event.EventPostPort;
import global.oei.domain.shared.event.EventProposalPort;
import global.oei.domain.shared.event.EventRegistrationPort;
import global.oei.domain.shared.event.RegisterToEventUseCase;
import global.oei.domain.shared.event.SubmitEventProposalUseCase;
import global.oei.domain.shared.git.GitSyncedFilePort;
import global.oei.domain.shared.git.GitSynchronizationPort;
import global.oei.domain.shared.git.TriggerGitSynchronizationUseCase;
import global.oei.domain.shared.home.ContactMessagePort;
import global.oei.domain.shared.home.HomeDomainAreaDetailPort;
import global.oei.domain.shared.home.HomeDomainAreaPort;
import global.oei.domain.shared.home.HomeNewsPort;
import global.oei.domain.shared.home.HomePartnerPort;
import global.oei.domain.shared.home.HomeStatPort;
import global.oei.domain.shared.home.LeadPort;
import global.oei.domain.shared.institution.CreateInstitutionBadgeProposalUseCase;
import global.oei.domain.shared.institution.CreateInstitutionInvitationUseCase;
import global.oei.domain.shared.institution.CreateInstitutionOpportunityUseCase;
import global.oei.domain.shared.institution.CreateInstitutionPublicationUseCase;
import global.oei.domain.shared.institution.CreateInstitutionUseCase;
import global.oei.domain.shared.institution.EmploymentAffiliationPort;
import global.oei.domain.shared.institution.InstitutionAuditLogPort;
import global.oei.domain.shared.institution.InstitutionBadgeProposalPort;
import global.oei.domain.shared.institution.InstitutionDashboardPort;
import global.oei.domain.shared.institution.InstitutionInvitationPort;
import global.oei.domain.shared.institution.InstitutionMembershipPort;
import global.oei.domain.shared.institution.InstitutionOpportunityPort;
import global.oei.domain.shared.institution.InstitutionPort;
import global.oei.domain.shared.institution.InstitutionPublicationPort;
import global.oei.domain.shared.institution.PartnershipPort;
import global.oei.domain.shared.institution.RequestEmploymentAffiliationUseCase;
import global.oei.domain.shared.mail.EmailNotificationPort;
import global.oei.domain.shared.media.MediaAssetPort;
import global.oei.domain.shared.media.MediaStorageUrlProvider;
import global.oei.domain.shared.media.UploadMediaAssetUseCase;
import global.oei.domain.shared.member.MemberPort;
import global.oei.domain.shared.member.RegisterAccountUseCase;
import global.oei.domain.shared.membership.MembershipLookupPort;
import global.oei.domain.shared.membershipfee.MembershipFeeAccountPort;
import global.oei.domain.shared.membershipfee.PayMembershipFeeUseCase;
import global.oei.domain.shared.network.GetSalaryInsightUseCase;
import global.oei.domain.shared.network.NetworkGraphPort;
import global.oei.domain.shared.profile.GetMyProfileUseCase;
import global.oei.domain.shared.profile.ProfileLookupPort;
import global.oei.domain.shared.profile.UpdateMyProfileUseCase;
import global.oei.domain.shared.publicprofile.GenerateDigitalBusinessCardUseCase;
import global.oei.domain.shared.publicprofile.PublicProfilePort;
import global.oei.domain.shared.publicprofile.PublishPublicProfileUseCase;
import global.oei.domain.shared.security.GetMyIdentityUseCase;
import global.oei.domain.shared.security.SecurityContextPort;
import global.oei.domain.shared.store.CreateOrderUseCase;
import global.oei.domain.shared.store.GenerateBusinessCardPreviewUseCase;
import global.oei.domain.shared.store.OrderPort;
import global.oei.domain.shared.store.PayOrderUseCase;
import global.oei.domain.shared.store.PaymentPort;
import global.oei.domain.shared.store.ProductPort;
import global.oei.domain.shared.store.RefundOrderUseCase;
import global.oei.domain.shared.verification.ApproveVerificationRequestUseCase;
import global.oei.domain.shared.verification.CreateVerificationRequestUseCase;
import global.oei.domain.shared.verification.RejectVerificationRequestUseCase;
import global.oei.domain.shared.verification.VerificationRequestPort;
import global.oei.domain.shared.wallet.CreateWalletPassUseCase;
import global.oei.domain.shared.wallet.WalletPassPort;
import global.oei.infrastructure.client.payment.PaymentProviderBinder;
import global.oei.infrastructure.client.paypal.PaypalClientConfiguration;
import global.oei.infrastructure.client.paypal.PaypalPaymentProviderAdapter;
import global.oei.infrastructure.client.paypal.generated.api.OrdersApi;
import global.oei.infrastructure.client.paypal.generated.api.PaymentsApi;
import global.oei.infrastructure.client.stripe.StripeClientConfiguration;
import global.oei.infrastructure.client.stripe.StripePaymentProviderAdapter;
import global.oei.infrastructure.client.stripe.generated.api.PaymentIntentsApi;
import global.oei.infrastructure.client.stripe.generated.api.RefundsApi;
import global.oei.infrastructure.mail.EmailAsyncConfiguration;
import global.oei.infrastructure.mail.EmailNotificationAdapter;
import global.oei.infrastructure.mail.EmailTemplateConfiguration;
import global.oei.infrastructure.persistence.badge.BadgeAwardRepository;
import global.oei.infrastructure.persistence.badge.BadgePersistenceAdapter;
import global.oei.infrastructure.persistence.badge.BadgeRepository;
import global.oei.infrastructure.persistence.book.BookCompilationPersistenceAdapter;
import global.oei.infrastructure.persistence.book.BookCompilationRepository;
import global.oei.infrastructure.persistence.certification.CertificationGoalPersistenceAdapter;
import global.oei.infrastructure.persistence.certification.CertificationPersistenceAdapter;
import global.oei.infrastructure.persistence.certification.CertificationRepository;
import global.oei.infrastructure.persistence.certification.MemberCertificationGoalRepository;
import global.oei.infrastructure.persistence.certification.RecognizedCertificationPersistenceAdapter;
import global.oei.infrastructure.persistence.certification.RecognizedCertificationRepository;
import global.oei.infrastructure.persistence.charter.EthicalCharterSignaturePersistenceAdapter;
import global.oei.infrastructure.persistence.charter.EthicalCharterSignatureRepository;
import global.oei.infrastructure.persistence.compensation.CompensationDeclarationRepository;
import global.oei.infrastructure.persistence.compensation.SalaryInsightPersistenceAdapter;
import global.oei.infrastructure.persistence.config.audit.PersistenceAuditingConfiguration;
import global.oei.infrastructure.persistence.content.ContentApprovalPersistenceAdapter;
import global.oei.infrastructure.persistence.content.ContentApprovalRepository;
import global.oei.infrastructure.persistence.content.ContentCommentPersistenceAdapter;
import global.oei.infrastructure.persistence.content.ContentCommentRepository;
import global.oei.infrastructure.persistence.content.ContentContributionPersistenceAdapter;
import global.oei.infrastructure.persistence.content.ContentContributionRepository;
import global.oei.infrastructure.persistence.content.ContentPersistenceAdapter;
import global.oei.infrastructure.persistence.content.ContentPublicationPersistenceAdapter;
import global.oei.infrastructure.persistence.content.ContentPublicationRepository;
import global.oei.infrastructure.persistence.content.ContentRepository;
import global.oei.infrastructure.persistence.content.ContentTranslationPersistenceAdapter;
import global.oei.infrastructure.persistence.content.ContentTranslationRepository;
import global.oei.infrastructure.persistence.content.ContentVersionPersistenceAdapter;
import global.oei.infrastructure.persistence.content.ContentVersionRepository;
import global.oei.infrastructure.persistence.cv.CvPersistenceAdapter;
import global.oei.infrastructure.persistence.cv.CvRepository;
import global.oei.infrastructure.persistence.cv.CvTemplateCatalogPersistenceAdapter;
import global.oei.infrastructure.persistence.cv.CvTemplateRepository;
import global.oei.infrastructure.persistence.event.EventCommentPersistenceAdapter;
import global.oei.infrastructure.persistence.event.EventCommentRepository;
import global.oei.infrastructure.persistence.event.EventPersistenceAdapter;
import global.oei.infrastructure.persistence.event.EventPhotoConsentPersistenceAdapter;
import global.oei.infrastructure.persistence.event.EventPhotoConsentRepository;
import global.oei.infrastructure.persistence.event.EventPostPersistenceAdapter;
import global.oei.infrastructure.persistence.event.EventPostRepository;
import global.oei.infrastructure.persistence.event.EventProposalPersistenceAdapter;
import global.oei.infrastructure.persistence.event.EventProposalRepository;
import global.oei.infrastructure.persistence.event.EventRegistrationPersistenceAdapter;
import global.oei.infrastructure.persistence.event.EventRegistrationRepository;
import global.oei.infrastructure.persistence.event.EventRepository;
import global.oei.infrastructure.persistence.git.GitSyncedFilePersistenceAdapter;
import global.oei.infrastructure.persistence.git.GitSyncedFileRepository;
import global.oei.infrastructure.persistence.git.GitSynchronizationPersistenceAdapter;
import global.oei.infrastructure.persistence.git.GitSynchronizationRepository;
import global.oei.infrastructure.persistence.home.ContactMessagePersistenceAdapter;
import global.oei.infrastructure.persistence.home.HomeContactMessageRepository;
import global.oei.infrastructure.persistence.home.HomeDomainAreaDetailPersistenceAdapter;
import global.oei.infrastructure.persistence.home.HomeDomainAreaDetailRepository;
import global.oei.infrastructure.persistence.home.HomeDomainAreaPersistenceAdapter;
import global.oei.infrastructure.persistence.home.HomeDomainAreaRepository;
import global.oei.infrastructure.persistence.home.HomeLeadRepository;
import global.oei.infrastructure.persistence.home.HomeNewsItemRepository;
import global.oei.infrastructure.persistence.home.HomeNewsPersistenceAdapter;
import global.oei.infrastructure.persistence.home.HomePartnerPersistenceAdapter;
import global.oei.infrastructure.persistence.home.HomePartnerRepository;
import global.oei.infrastructure.persistence.home.HomeStatPersistenceAdapter;
import global.oei.infrastructure.persistence.home.HomeStatRepository;
import global.oei.infrastructure.persistence.home.LeadPersistenceAdapter;
import global.oei.infrastructure.persistence.institution.EmploymentAffiliationPersistenceAdapter;
import global.oei.infrastructure.persistence.institution.EmploymentAffiliationRepository;
import global.oei.infrastructure.persistence.institution.InstitutionAuditLogPersistenceAdapter;
import global.oei.infrastructure.persistence.institution.InstitutionAuditLogRepository;
import global.oei.infrastructure.persistence.institution.InstitutionBadgeProposalPersistenceAdapter;
import global.oei.infrastructure.persistence.institution.InstitutionBadgeProposalRepository;
import global.oei.infrastructure.persistence.institution.InstitutionDashboardPersistenceAdapter;
import global.oei.infrastructure.persistence.institution.InstitutionDomainRepository;
import global.oei.infrastructure.persistence.institution.InstitutionInvitationPersistenceAdapter;
import global.oei.infrastructure.persistence.institution.InstitutionInvitationRepository;
import global.oei.infrastructure.persistence.institution.InstitutionMembershipPersistenceAdapter;
import global.oei.infrastructure.persistence.institution.InstitutionMembershipRepository;
import global.oei.infrastructure.persistence.institution.InstitutionOpportunityPersistenceAdapter;
import global.oei.infrastructure.persistence.institution.InstitutionOpportunityRepository;
import global.oei.infrastructure.persistence.institution.InstitutionPersistenceAdapter;
import global.oei.infrastructure.persistence.institution.InstitutionPublicationPersistenceAdapter;
import global.oei.infrastructure.persistence.institution.InstitutionPublicationRepository;
import global.oei.infrastructure.persistence.institution.InstitutionRepository;
import global.oei.infrastructure.persistence.institution.PartnershipPersistenceAdapter;
import global.oei.infrastructure.persistence.institution.PartnershipRepository;
import global.oei.infrastructure.persistence.media.MediaAssetPersistenceAdapter;
import global.oei.infrastructure.persistence.media.MediaAssetRepository;
import global.oei.infrastructure.persistence.member.MemberPersistenceAdapter;
import global.oei.infrastructure.persistence.member.MemberRepository;
import global.oei.infrastructure.persistence.membership.MembershipPersistenceAdapter;
import global.oei.infrastructure.persistence.membership.MembershipRepository;
import global.oei.infrastructure.persistence.membershipfee.MembershipFeePaymentPersistenceAdapter;
import global.oei.infrastructure.persistence.membershipfee.MembershipFeePaymentRepository;
import global.oei.infrastructure.persistence.network.NetworkCertificationRepository;
import global.oei.infrastructure.persistence.network.NetworkDomainRepository;
import global.oei.infrastructure.persistence.network.NetworkExpertRepository;
import global.oei.infrastructure.persistence.network.NetworkGraphPersistenceAdapter;
import global.oei.infrastructure.persistence.network.NetworkTopicRepository;
import global.oei.infrastructure.persistence.pdf.PdfGenerationJobPersistenceAdapter;
import global.oei.infrastructure.persistence.pdf.PdfGenerationJobRepository;
import global.oei.infrastructure.persistence.profile.ProfessionalProfilePersistenceAdapter;
import global.oei.infrastructure.persistence.profile.ProfessionalProfileRepository;
import global.oei.infrastructure.persistence.publicprofile.PublicProfilePersistenceAdapter;
import global.oei.infrastructure.persistence.publicprofile.PublicProfileRepository;
import global.oei.infrastructure.persistence.store.BusinessCardTemplateRepository;
import global.oei.infrastructure.persistence.store.OrderPersistenceAdapter;
import global.oei.infrastructure.persistence.store.PaymentPersistenceAdapter;
import global.oei.infrastructure.persistence.store.ProductCategoryRepository;
import global.oei.infrastructure.persistence.store.ProductPersistenceAdapter;
import global.oei.infrastructure.persistence.store.ProductRepository;
import global.oei.infrastructure.persistence.store.StoreOrderLineRepository;
import global.oei.infrastructure.persistence.store.StoreOrderRepository;
import global.oei.infrastructure.persistence.store.StorePaymentRepository;
import global.oei.infrastructure.persistence.verification.VerificationRequestPersistenceAdapter;
import global.oei.infrastructure.persistence.verification.VerificationRequestRepository;
import global.oei.infrastructure.persistence.wallet.WalletPassPersistenceAdapter;
import global.oei.infrastructure.persistence.wallet.WalletPassRepository;
import global.oei.infrastructure.wiring.adapter.MediaStorageUrlProviderAdapter;
import global.oei.infrastructure.wiring.config.MediaStorageProperties;

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
@EnableConfigurationProperties(MediaStorageProperties.class)
@Import({
        PersistenceAuditingConfiguration.class, StripeClientConfiguration.class, PaypalClientConfiguration.class,
        EmailAsyncConfiguration.class, EmailTemplateConfiguration.class
})
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
    public RecognizedCertificationPort recognizedCertificationPort(final RecognizedCertificationRepository repository) {
        return new RecognizedCertificationPersistenceAdapter(repository);
    }

    @Bean
    public CreateRecognizedCertificationUseCase createRecognizedCertificationUseCase(
            final RecognizedCertificationPort recognizedCertificationPort) {
        return new CreateRecognizedCertificationService(recognizedCertificationPort);
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

    @Bean
    public InstitutionPort institutionPort(final InstitutionRepository repository, final InstitutionDomainRepository domainRepository) {
        return new InstitutionPersistenceAdapter(repository, domainRepository);
    }

    @Bean
    public CreateInstitutionUseCase createInstitutionUseCase(final InstitutionPort institutionPort) {
        return new CreateInstitutionService(institutionPort);
    }

    @Bean
    public PartnershipPort partnershipPort(final PartnershipRepository repository) {
        return new PartnershipPersistenceAdapter(repository);
    }

    @Bean
    public InstitutionMembershipPort institutionMembershipPort(final InstitutionMembershipRepository repository) {
        return new InstitutionMembershipPersistenceAdapter(repository);
    }

    @Bean
    public InstitutionInvitationPort institutionInvitationPort(final InstitutionInvitationRepository repository) {
        return new InstitutionInvitationPersistenceAdapter(repository);
    }

    @Bean
    public CreateInstitutionInvitationUseCase createInstitutionInvitationUseCase(final InstitutionInvitationPort port) {
        return new CreateInstitutionInvitationService(port);
    }

    @Bean
    public EmploymentAffiliationPort employmentAffiliationPort(final EmploymentAffiliationRepository repository) {
        return new EmploymentAffiliationPersistenceAdapter(repository);
    }

    @Bean
    public RequestEmploymentAffiliationUseCase requestEmploymentAffiliationUseCase(final EmploymentAffiliationPort port) {
        return new RequestEmploymentAffiliationService(port);
    }

    @Bean
    public InstitutionPublicationPort institutionPublicationPort(final InstitutionPublicationRepository repository) {
        return new InstitutionPublicationPersistenceAdapter(repository);
    }

    @Bean
    public CreateInstitutionPublicationUseCase createInstitutionPublicationUseCase(final InstitutionPublicationPort port) {
        return new CreateInstitutionPublicationService(port);
    }

    @Bean
    public InstitutionOpportunityPort institutionOpportunityPort(final InstitutionOpportunityRepository repository) {
        return new InstitutionOpportunityPersistenceAdapter(repository);
    }

    @Bean
    public CreateInstitutionOpportunityUseCase createInstitutionOpportunityUseCase(final InstitutionOpportunityPort port) {
        return new CreateInstitutionOpportunityService(port);
    }

    @Bean
    public InstitutionBadgeProposalPort institutionBadgeProposalPort(final InstitutionBadgeProposalRepository repository) {
        return new InstitutionBadgeProposalPersistenceAdapter(repository);
    }

    @Bean
    public CreateInstitutionBadgeProposalUseCase createInstitutionBadgeProposalUseCase(final InstitutionBadgeProposalPort port) {
        return new CreateInstitutionBadgeProposalService(port);
    }

    @Bean
    public InstitutionAuditLogPort institutionAuditLogPort(final InstitutionAuditLogRepository repository) {
        return new InstitutionAuditLogPersistenceAdapter(repository);
    }

    @Bean
    public InstitutionDashboardPort institutionDashboardPort(
            final EmploymentAffiliationRepository employmentAffiliationRepository,
            final CertificationRepository certificationRepository,
            final BadgeAwardRepository badgeAwardRepository,
            final EthicalCharterSignatureRepository ethicalCharterSignatureRepository,
            final ProfessionalProfileRepository professionalProfileRepository,
            final InstitutionPublicationRepository institutionPublicationRepository,
            final InstitutionOpportunityRepository institutionOpportunityRepository,
            final InstitutionInvitationRepository institutionInvitationRepository) {
        return new InstitutionDashboardPersistenceAdapter(
                employmentAffiliationRepository, certificationRepository, badgeAwardRepository,
                ethicalCharterSignatureRepository, professionalProfileRepository, institutionPublicationRepository,
                institutionOpportunityRepository, institutionInvitationRepository);
    }

    @Bean
    public ContentPort contentPort(final ContentRepository repository, final ContentVersionRepository versionRepository) {
        return new ContentPersistenceAdapter(repository, versionRepository);
    }

    @Bean
    public CreateContentUseCase createContentUseCase(final ContentPort contentPort) {
        return new CreateContentService(contentPort);
    }

    @Bean
    public ContentVersionPort contentVersionPort(final ContentVersionRepository repository) {
        return new ContentVersionPersistenceAdapter(repository);
    }

    @Bean
    public CreateContentVersionUseCase createContentVersionUseCase(final ContentPort contentPort, final ContentVersionPort contentVersionPort) {
        return new CreateContentVersionService(contentPort, contentVersionPort);
    }

    @Bean
    public ContentApprovalPort contentApprovalPort(final ContentApprovalRepository repository) {
        return new ContentApprovalPersistenceAdapter(repository);
    }

    @Bean
    public ContentTranslationPort contentTranslationPort(final ContentTranslationRepository repository) {
        return new ContentTranslationPersistenceAdapter(repository);
    }

    @Bean
    public ContentContributionPort contentContributionPort(final ContentContributionRepository repository) {
        return new ContentContributionPersistenceAdapter(repository);
    }

    @Bean
    public CreateContentContributionUseCase createContentContributionUseCase(final ContentContributionPort contentContributionPort) {
        return new CreateContentContributionService(contentContributionPort);
    }

    @Bean
    public ContentCommentPort contentCommentPort(final ContentCommentRepository repository) {
        return new ContentCommentPersistenceAdapter(repository);
    }

    @Bean
    public ContentPublicationPort contentPublicationPort(final ContentPublicationRepository repository) {
        return new ContentPublicationPersistenceAdapter(repository);
    }

    @Bean
    public EventPort eventPort(final EventRepository repository) {
        return new EventPersistenceAdapter(repository);
    }

    @Bean
    public EventRegistrationPort eventRegistrationPort(final EventRegistrationRepository repository) {
        return new EventRegistrationPersistenceAdapter(repository);
    }

    @Bean
    public RegisterToEventUseCase registerToEventUseCase(final EventRegistrationPort port) {
        return new RegisterToEventService(port);
    }

    @Bean
    public EventPostPort eventPostPort(final EventPostRepository repository) {
        return new EventPostPersistenceAdapter(repository);
    }

    @Bean
    public EventCommentPort eventCommentPort(final EventCommentRepository repository) {
        return new EventCommentPersistenceAdapter(repository);
    }

    @Bean
    public EventPhotoConsentPort eventPhotoConsentPort(final EventPhotoConsentRepository repository) {
        return new EventPhotoConsentPersistenceAdapter(repository);
    }

    @Bean
    public EventProposalPort eventProposalPort(final EventProposalRepository repository) {
        return new EventProposalPersistenceAdapter(repository);
    }

    @Bean
    public SubmitEventProposalUseCase submitEventProposalUseCase(final EventProposalPort port) {
        return new SubmitEventProposalService(port);
    }

    @Bean
    public MembershipFeeAccountPort membershipFeeAccountPort(final MembershipFeePaymentRepository repository) {
        return new MembershipFeePaymentPersistenceAdapter(repository);
    }

    @Bean
    public PayMembershipFeeUseCase payMembershipFeeUseCase(final MembershipFeeAccountPort port) {
        return new PayMembershipFeeService(port);
    }

    @Bean
    public PublicProfilePort publicProfilePort(final PublicProfileRepository repository, final MemberRepository memberRepository) {
        return new PublicProfilePersistenceAdapter(repository, memberRepository);
    }

    @Bean
    public PublishPublicProfileUseCase publishPublicProfileUseCase(final PublicProfilePort publicProfilePort) {
        return new PublishPublicProfileService(publicProfilePort);
    }

    @Bean
    public GenerateDigitalBusinessCardUseCase generateDigitalBusinessCardUseCase() {
        return new GenerateDigitalBusinessCardService();
    }

    @Bean
    public VerificationRequestPort verificationRequestPort(final VerificationRequestRepository repository) {
        return new VerificationRequestPersistenceAdapter(repository);
    }

    @Bean
    public CreateVerificationRequestUseCase createVerificationRequestUseCase(final VerificationRequestPort port) {
        return new CreateVerificationRequestService(port);
    }

    @Bean
    public ValidateCertificationUseCase validateCertificationUseCase(final CertificationPort certificationPort) {
        return new ValidateCertificationService(certificationPort);
    }

    @Bean
    public RejectCertificationUseCase rejectCertificationUseCase(final CertificationPort certificationPort) {
        return new RejectCertificationService(certificationPort);
    }

    @Bean
    public AwardBadgeUseCase awardBadgeUseCase(final BadgeAwardPort badgeAwardPort) {
        return new AwardBadgeService(badgeAwardPort);
    }

    @Bean
    public ApproveVerificationRequestUseCase approveVerificationRequestUseCase(final VerificationRequestPort port) {
        return new ApproveVerificationRequestService(port);
    }

    @Bean
    public RejectVerificationRequestUseCase rejectVerificationRequestUseCase(final VerificationRequestPort port) {
        return new RejectVerificationRequestService(port);
    }

    @Bean
    public MemberPort memberPort(final MemberRepository repository) {
        return new MemberPersistenceAdapter(repository);
    }

    @Bean
    public RegisterAccountUseCase registerAccountUseCase(final MemberPort memberPort) {
        return new RegisterAccountService(memberPort);
    }

    @Bean
    public HomeStatPort homeStatPort(final HomeStatRepository repository) {
        return new HomeStatPersistenceAdapter(repository);
    }

    @Bean
    public HomeDomainAreaPort homeDomainAreaPort(final HomeDomainAreaRepository repository) {
        return new HomeDomainAreaPersistenceAdapter(repository);
    }

    @Bean
    public HomeDomainAreaDetailPort homeDomainAreaDetailPort(
            final HomeDomainAreaRepository areaRepository, final HomeDomainAreaDetailRepository detailRepository) {
        return new HomeDomainAreaDetailPersistenceAdapter(areaRepository, detailRepository);
    }

    @Bean
    public HomeNewsPort homeNewsPort(final HomeNewsItemRepository repository) {
        return new HomeNewsPersistenceAdapter(repository);
    }

    @Bean
    public HomePartnerPort homePartnerPort(final HomePartnerRepository repository) {
        return new HomePartnerPersistenceAdapter(repository);
    }

    @Bean
    public LeadPort leadPort(final HomeLeadRepository repository) {
        return new LeadPersistenceAdapter(repository);
    }

    @Bean
    public ContactMessagePort contactMessagePort(final HomeContactMessageRepository repository) {
        return new ContactMessagePersistenceAdapter(repository);
    }

    @Bean
    public MediaAssetPort mediaAssetPort(final MediaAssetRepository repository) {
        return new MediaAssetPersistenceAdapter(repository);
    }

    @Bean
    public MediaStorageUrlProvider mediaStorageUrlProvider(final MediaStorageProperties properties) {
        return new MediaStorageUrlProviderAdapter(properties);
    }

    @Bean
    public UploadMediaAssetUseCase uploadMediaAssetUseCase(final MediaAssetPort mediaAssetPort,
                                                            final MediaStorageUrlProvider storageUrlProvider) {
        return new UploadMediaAssetService(mediaAssetPort, storageUrlProvider);
    }

    @Bean
    public BookCompilationPort bookCompilationPort(final BookCompilationRepository repository) {
        return new BookCompilationPersistenceAdapter(repository);
    }

    @Bean
    public CreateBookCompilationUseCase createBookCompilationUseCase(
            final BookCompilationPort bookCompilationPort, final ContentPort contentPort) {
        return new CreateBookCompilationService(bookCompilationPort, contentPort);
    }

    @Bean
    public RenderBookCompilationUseCase renderBookCompilationUseCase(final PdfGenerationJobPort pdfGenerationJobPort) {
        return new RenderBookCompilationService(pdfGenerationJobPort);
    }

    @Bean
    public GitSynchronizationPort gitSynchronizationPort(final GitSynchronizationRepository repository) {
        return new GitSynchronizationPersistenceAdapter(repository);
    }

    @Bean
    public GitSyncedFilePort gitSyncedFilePort(final GitSyncedFileRepository repository) {
        return new GitSyncedFilePersistenceAdapter(repository);
    }

    @Bean
    public TriggerGitSynchronizationUseCase triggerGitSynchronizationUseCase(
            final GitSynchronizationPort gitSynchronizationPort, final GitSyncedFilePort gitSyncedFilePort) {
        return new TriggerGitSynchronizationService(gitSynchronizationPort, gitSyncedFilePort);
    }

    @Bean
    public StripePaymentProviderAdapter stripePaymentProviderAdapter(
            final PaymentIntentsApi paymentIntentsApi, final RefundsApi refundsApi) {
        return new StripePaymentProviderAdapter(paymentIntentsApi, refundsApi);
    }

    @Bean
    public PaypalPaymentProviderAdapter paypalPaymentProviderAdapter(final OrdersApi ordersApi, final PaymentsApi paymentsApi) {
        return new PaypalPaymentProviderAdapter(ordersApi, paymentsApi);
    }

    /**
     * Binds {@link global.oei.domain.shared.payment.PaymentMethod#CARD}/{@code PAYPAL} to
     * their respective {@link global.oei.domain.shared.payment.PaymentProviderPort} adapter
     * at startup (see {@code PaymentProviderBinder}'s own Javadoc for the enum-strategy
     * pattern). Built explicitly here (never via classpath component scanning, consistent
     * with every other adapter in this configuration) — Spring still calls
     * {@code InitializingBean#afterPropertiesSet()} on it because it is a registered bean.
     */
    @Bean
    public PaymentProviderBinder paymentProviderBinder(
            final StripePaymentProviderAdapter stripePaymentProviderAdapter,
            final PaypalPaymentProviderAdapter paypalPaymentProviderAdapter) {
        return new PaymentProviderBinder(List.of(stripePaymentProviderAdapter, paypalPaymentProviderAdapter));
    }

    @Bean
    public ProductPort productPort(
            final ProductCategoryRepository categoryRepository, final ProductRepository productRepository,
            final BusinessCardTemplateRepository businessCardTemplateRepository) {
        return new ProductPersistenceAdapter(categoryRepository, productRepository, businessCardTemplateRepository);
    }

    @Bean
    public OrderPort orderPort(final StoreOrderRepository orderRepository, final StoreOrderLineRepository lineRepository) {
        return new OrderPersistenceAdapter(orderRepository, lineRepository);
    }

    @Bean
    public PaymentPort paymentPort(final StorePaymentRepository repository) {
        return new PaymentPersistenceAdapter(repository);
    }

    @Bean
    public CreateOrderUseCase createOrderUseCase(final ProductPort productPort, final OrderPort orderPort) {
        return new CreateOrderService(productPort, orderPort);
    }

    @Bean
    public PayOrderUseCase payOrderUseCase(
            final OrderPort orderPort, final PaymentPort paymentPort, final MemberPort memberPort,
            final EmailNotificationPort emailNotificationPort) {
        return new PayOrderService(orderPort, paymentPort, memberPort, emailNotificationPort);
    }

    @Bean
    public RefundOrderUseCase refundOrderUseCase(final OrderPort orderPort, final PaymentPort paymentPort) {
        return new RefundOrderService(orderPort, paymentPort);
    }

    @Bean
    public GenerateBusinessCardPreviewUseCase generateBusinessCardPreviewUseCase() {
        return new GenerateBusinessCardPreviewService();
    }

    /**
     * {@link EmailNotificationAdapter} is a plain class (never {@code @Component}, consistent
     * with every other adapter in this configuration): {@code mailSender}/{@code templateEngine}
     * are supplied by Spring Boot's {@code spring-boot-starter-mail}/{@code -thymeleaf}
     * autoconfiguration (triggered by {@code infrastructure-mail}'s dependencies being on the
     * classpath), {@code emailTextTemplateResolver}/{@code messageSource} by
     * {@link EmailTemplateConfiguration} (imported above).
     */
    @Bean
    public EmailNotificationPort emailNotificationPort(
            final JavaMailSender mailSender, final SpringTemplateEngine templateEngine, final MessageSource messageSource) {
        return new EmailNotificationAdapter(mailSender, templateEngine, messageSource);
    }
}
