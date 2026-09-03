package global.oei.domain.core.profile;

import global.oei.domain.shared.member.AccountType;
import global.oei.domain.shared.member.Member;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.member.MemberPort;
import global.oei.domain.shared.network.CompensationDeclarationCandidate;
import global.oei.domain.shared.network.CompensationPeriod;
import global.oei.domain.shared.network.NetworkSalaryNodeType;
import global.oei.domain.shared.network.RecordCompensationDeclarationsPort;
import global.oei.domain.shared.profile.Availability;
import global.oei.domain.shared.profile.Experience;
import global.oei.domain.shared.profile.ProfessionalProfile;
import global.oei.domain.shared.profile.ProfileLookupPort;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class UpdateMyProfileServiceTest {

    private final ProfileLookupPort port = mock(ProfileLookupPort.class);
    private final MemberPort memberPort = mock(MemberPort.class);
    private final RecordCompensationDeclarationsPort recordCompensationDeclarationsPort =
            mock(RecordCompensationDeclarationsPort.class);
    private final UpdateMyProfileService service =
            new UpdateMyProfileService(port, memberPort, recordCompensationDeclarationsPort);

    @Test
    void execute_recomputesCompletenessBeforeSaving() {
        final ProfessionalProfile submitted = new ProfessionalProfile(
                MemberId.newId(), null, "Title", "Summary", "Location", Availability.AVAILABLE, List.of("Cloud"),
                List.of(), List.of(), List.of(), List.of(), List.of(), List.of(), null, 0);
        when(port.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(memberPort.findById(any())).thenReturn(Optional.empty());

        final ProfessionalProfile saved = service.execute(submitted);

        assertThat(saved.completenessScore()).isEqualTo(33);
    }

    @Test
    void execute_replacesCompensationDeclarationsFromSalariedExperiences() {
        final MemberId memberId = MemberId.newId();
        final Experience salaried = new Experience(
                "exp-1", "Acme", "Engineer", LocalDate.of(2020, 1, 1), null, true, null, false,
                BigDecimal.valueOf(90000), "CHF");
        final ProfessionalProfile submitted = new ProfessionalProfile(
                memberId, null, "Title", "Summary", "Location", Availability.AVAILABLE, List.of("cloud"),
                List.of(), List.of(), List.of(), List.of(salaried), List.of(), List.of(), null, 0);
        when(port.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(memberPort.findById(memberId)).thenReturn(Optional.of(new Member(
                memberId, "slug", "Display", "Legal", "fr", "Suisse", AccountType.REAL, Instant.now())));

        service.execute(submitted);

        verify(recordCompensationDeclarationsPort).replace(eq(memberId), eq(List.of(new CompensationDeclarationCandidate(
                NetworkSalaryNodeType.DOMAIN, "cloud", "Suisse", BigDecimal.valueOf(90000), "CHF",
                CompensationPeriod.YEAR))));
    }

    @Test
    void execute_replacesWithEmptyListWhenNoExperienceCarriesASalary() {
        final MemberId memberId = MemberId.newId();
        final ProfessionalProfile submitted = new ProfessionalProfile(
                memberId, null, "Title", "Summary", "Location", Availability.AVAILABLE, List.of("cloud"),
                List.of(), List.of(), List.of(), List.of(), List.of(), List.of(), null, 0);
        when(port.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(memberPort.findById(memberId)).thenReturn(Optional.empty());

        service.execute(submitted);

        verify(recordCompensationDeclarationsPort).replace(eq(memberId), eq(List.of()));
    }
}
