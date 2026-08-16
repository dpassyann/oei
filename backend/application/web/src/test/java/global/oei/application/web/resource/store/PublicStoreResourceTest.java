package global.oei.application.web.resource.store;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import global.oei.domain.shared.store.BusinessCardTemplate;
import global.oei.domain.shared.store.Product;
import global.oei.domain.shared.store.ProductPort;

/**
 * Standalone {@code MockMvc} test for {@link PublicStoreResource}, following the same pattern
 * as {@code MemberMembershipFeeResourceTest}: no Spring context, a mocked {@link ProductPort}.
 */
class PublicStoreResourceTest {

    private ProductPort productPort;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        productPort = mock(ProductPort.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new PublicStoreResource(productPort)).build();
    }

    private Product pen() {
        return new Product("prod-1", "cat-1", "OEI-PEN", "Stylo OEI", "Stylo gravé OEI",
                BigDecimal.valueOf(9.90), "EUR", true, false);
    }

    @Test
    void listStoreProducts_returnsActiveCatalog() throws Exception {
        when(productPort.findAllProducts(null)).thenReturn(List.of(pen()));

        mockMvc.perform(get("/api/public/v1/store/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].sku").value("OEI-PEN"));
    }

    @Test
    void listStoreProducts_filtersByCategory() throws Exception {
        when(productPort.findAllProducts("goodies")).thenReturn(List.of(pen()));

        mockMvc.perform(get("/api/public/v1/store/products").param("categoryCode", "goodies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].sku").value("OEI-PEN"));
    }

    @Test
    void getStoreProduct_returnsNotFoundWhenMissing() throws Exception {
        when(productPort.findProductById("missing")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/public/v1/store/products/missing")).andExpect(status().isNotFound());
    }

    @Test
    void getStoreProduct_returnsProductWhenFound() throws Exception {
        when(productPort.findProductById("prod-1")).thenReturn(Optional.of(pen()));

        mockMvc.perform(get("/api/public/v1/store/products/prod-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Stylo OEI"));
    }

    @Test
    void listBusinessCardTemplates_returnsTemplates() throws Exception {
        when(productPort.findAllBusinessCardTemplates())
                .thenReturn(List.of(new BusinessCardTemplate("tpl-1", "Classique", "https://example.org/tpl-1.png")));

        mockMvc.perform(get("/api/public/v1/store/business-card-templates"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("tpl-1"));
    }
}
