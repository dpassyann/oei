package global.oei.application.web.resource.git;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import global.oei.domain.shared.git.GitSyncedFile;
import global.oei.domain.shared.git.GitSyncedFilePort;
import global.oei.domain.shared.git.GitSynchronization;
import global.oei.domain.shared.git.GitSynchronizationPort;
import global.oei.domain.shared.git.GitSynchronizationStatus;
import global.oei.domain.shared.git.TriggerGitSynchronizationUseCase;

class AdminGitResourceTest {

    private TriggerGitSynchronizationUseCase triggerGitSynchronizationUseCase;
    private GitSynchronizationPort gitSynchronizationPort;
    private GitSyncedFilePort gitSyncedFilePort;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        triggerGitSynchronizationUseCase = mock(TriggerGitSynchronizationUseCase.class);
        gitSynchronizationPort = mock(GitSynchronizationPort.class);
        gitSyncedFilePort = mock(GitSyncedFilePort.class);
        mockMvc = MockMvcBuilders
                .standaloneSetup(new AdminGitResource(triggerGitSynchronizationUseCase, gitSynchronizationPort, gitSyncedFilePort))
                .build();
    }

    @Test
    void triggerGitSynchronization_returnsAcceptedSynchronization() throws Exception {
        final GitSynchronization synchronization =
                new GitSynchronization("sync-1", Instant.now(), Instant.now(), GitSynchronizationStatus.SUCCESS, 2, List.of());
        when(triggerGitSynchronizationUseCase.execute()).thenReturn(synchronization);

        mockMvc.perform(post("/api/admin/v1/git/synchronize"))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.status").value("SUCCESS"));
    }

    @Test
    void listLatestGitSyncedFiles_returnsFilesFromLatestSync() throws Exception {
        final GitSynchronization synchronization =
                new GitSynchronization("sync-1", Instant.now(), Instant.now(), GitSynchronizationStatus.SUCCESS, 1, List.of());
        when(gitSynchronizationPort.findLatest()).thenReturn(Optional.of(synchronization));
        when(gitSyncedFilePort.findBySynchronizationId("sync-1"))
                .thenReturn(List.of(new GitSyncedFile("sync-1", "statuts/statuts.md", "main", "abc123", "contenu")));

        mockMvc.perform(get("/api/admin/v1/git/synchronizations/latest/files"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].path").value("statuts/statuts.md"));
    }
}
