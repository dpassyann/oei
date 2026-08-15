package global.oei.application.web.resource.book;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import global.oei.domain.shared.book.BookCompilation;
import global.oei.domain.shared.book.BookCompilationPort;
import global.oei.domain.shared.book.CreateBookCompilationUseCase;
import global.oei.domain.shared.book.RenderBookCompilationUseCase;
import global.oei.domain.shared.cv.PdfGenerationJob;
import global.oei.domain.shared.cv.PdfGenerationJobStatus;
import global.oei.domain.shared.cv.PdfGenerationTargetType;

class AdminBooksResourceTest {

    private CreateBookCompilationUseCase createBookCompilationUseCase;
    private RenderBookCompilationUseCase renderBookCompilationUseCase;
    private BookCompilationPort bookCompilationPort;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        createBookCompilationUseCase = mock(CreateBookCompilationUseCase.class);
        renderBookCompilationUseCase = mock(RenderBookCompilationUseCase.class);
        bookCompilationPort = mock(BookCompilationPort.class);
        mockMvc = MockMvcBuilders
                .standaloneSetup(new AdminBooksResource(createBookCompilationUseCase, renderBookCompilationUseCase, bookCompilationPort))
                .build();
    }

    @Test
    void createBookCompilation_returnsCreatedCompilation() throws Exception {
        final BookCompilation compilation =
                new BookCompilation("book-1", "Recueil 2026", List.of("content-1"), null, null, List.of("Article 1"), "1.0");
        when(createBookCompilationUseCase.execute("Recueil 2026", List.of("content-1"), null, null)).thenReturn(compilation);

        mockMvc.perform(post("/api/admin/v1/books").contentType(MediaType.APPLICATION_JSON).content("""
                {"title":"Recueil 2026","contentIds":["content-1"]}"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("book-1"));
    }

    @Test
    void renderBookCompilation_returnsAcceptedJob() throws Exception {
        final BookCompilation compilation =
                new BookCompilation("book-1", "Recueil 2026", List.of("content-1"), null, null, List.of("Article 1"), "1.0");
        when(bookCompilationPort.findById("book-1")).thenReturn(Optional.of(compilation));
        final PdfGenerationJob job = new PdfGenerationJob(
                "job-1", PdfGenerationTargetType.BOOK, "book-1", PdfGenerationJobStatus.DONE, "https://mock-book-pdf.oei.local/job-1.pdf",
                Instant.now(), Instant.now());
        when(renderBookCompilationUseCase.execute(compilation)).thenReturn(job);

        mockMvc.perform(post("/api/admin/v1/books/book-1/render"))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.status").value("DONE"));
    }
}
