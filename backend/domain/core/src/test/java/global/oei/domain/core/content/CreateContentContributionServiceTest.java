package global.oei.domain.core.content;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;

import global.oei.domain.shared.content.ContentContribution;
import global.oei.domain.shared.content.ContentContributionPort;
import global.oei.domain.shared.content.ContentContributionStatus;
import global.oei.domain.shared.member.MemberId;

class CreateContentContributionServiceTest {

    private final ContentContributionPort port = mock(ContentContributionPort.class);
    private final CreateContentContributionService service = new CreateContentContributionService(port);

    @Test
    void execute_alwaysStartsProposed() {
        when(port.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        final ContentContribution contribution = service.execute(MemberId.newId(), "content-1", "diff --git ...");

        assertThat(contribution.status()).isEqualTo(ContentContributionStatus.PROPOSED);
        assertThat(contribution.contentId()).isEqualTo("content-1");
        assertThat(contribution.id()).isNotBlank();
    }
}
