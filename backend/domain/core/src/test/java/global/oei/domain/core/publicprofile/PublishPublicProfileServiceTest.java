package global.oei.domain.core.publicprofile;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.publicprofile.PublicProfile;
import global.oei.domain.shared.publicprofile.PublicProfilePort;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class PublishPublicProfileServiceTest {

    private final PublicProfilePort port = mock(PublicProfilePort.class);
    private final PublishPublicProfileService service = new PublishPublicProfileService(port);

    @Test
    void execute_firstPublication_setsPublishedAtNow() {
        final MemberId memberId = MemberId.newId();
        when(port.findByMemberId(memberId)).thenReturn(new PublicProfile(memberId, "member-slug", List.of(), null, null, 0));
        when(port.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        final PublicProfile published = service.execute(memberId, "custom-slug", List.of("displayName", "certifications"), "SEO text");

        assertThat(published.publicSlug()).isEqualTo("custom-slug");
        assertThat(published.publishedAt()).isNotNull();
        assertThat(published.visibleFields()).containsExactly("displayName", "certifications");
    }

    @Test
    void execute_republication_preservesOriginalPublishedAtAndViewsCount() {
        final MemberId memberId = MemberId.newId();
        final Instant originalPublishedAt = Instant.parse("2025-01-01T00:00:00Z");
        when(port.findByMemberId(memberId))
                .thenReturn(new PublicProfile(memberId, "custom-slug", List.of("displayName"), "old SEO", originalPublishedAt, 42));
        when(port.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        final PublicProfile republished = service.execute(memberId, "custom-slug", List.of("displayName", "title"), "new SEO");

        assertThat(republished.publishedAt()).isEqualTo(originalPublishedAt);
        assertThat(republished.viewsCount()).isEqualTo(42);
        assertThat(republished.seoDescription()).isEqualTo("new SEO");
    }
}
