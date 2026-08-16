package global.oei.acceptance;

import static org.assertj.core.api.Assertions.assertThat;

import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import io.cucumber.java.fr.Alors;
import io.cucumber.java.fr.Et;
import io.cucumber.java.fr.Etantdonnéqu;
import io.cucumber.java.fr.Etantdonnéque;
import io.cucumber.java.fr.Quand;

/**
 * All Gherkin step definitions for this module's acceptance suite, deliberately kept in one
 * glue class: Cucumber matches step text against the union of every glue class on the
 * classpath, so splitting "Given I am authenticated..." across several classes (one per
 * feature) would register the same step text twice and fail with an ambiguous-match error.
 * Shared per-scenario state (bearer token, last HTTP response, last created ids) lives as
 * plain instance fields — cucumber-spring gives every scenario its own instance of this bean.
 */
public class AcceptanceSteps {

    @LocalServerPort
    private int port;

    private final TestRestTemplate restTemplate = new TestRestTemplate();

    private String bearerToken;
    private ResponseEntity<String> response;
    private String contentId;
    private String orderId;

    // --- authentication ---

    @Etantdonnéque("je suis authentifié en tant que membre de démonstration")
    public void authenticatedAsDemoMember() {
        bearerToken = AcceptanceTestTokens.ALICE_MEMBER;
    }

    @Etantdonnéque("je suis authentifié en tant qu'administrateur")
    public void authenticatedAsAdmin() {
        bearerToken = AcceptanceTestTokens.ADMIN;
    }

    // --- membership ---

    @Quand("je consulte mon adhésion")
    public void getMyMembership() {
        response = get("/api/member/v1/membership");
    }

    @Alors("la réponse indique le niveau d'adhésion {string}")
    public void assertsMembershipTier(final String tier) {
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).contains("\"tier\":\"" + tier + "\"");
    }

    @Alors("la réponse indique le statut d'adhésion {string}")
    public void assertsMembershipStatus(final String status) {
        assertThat(response.getBody()).contains("\"status\":\"" + status + "\"");
    }

    // --- certification ---

    @Quand("je déclare la certification {string} délivrée par {string}")
    public void declareCertification(final String name, final String issuingOrganization) {
        final String body = """
                {"name":"%s","issuingOrganization":"%s","issuedAt":"2026-01-01"}""".formatted(name, issuingOrganization);
        response = post("/api/member/v1/certifications", body);
    }

    @Alors("la certification est enregistrée avec le statut {string}")
    public void assertsCertificationStatus(final String status) {
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).contains("\"status\":\"" + status + "\"");
    }

    @Alors("je retrouve cette certification dans la liste de mes certifications")
    public void assertsCertificationInList() {
        final ResponseEntity<String> list = get("/api/member/v1/certifications");
        assertThat(list.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(list.getBody()).contains("AWS Certified Solutions Architect");
    }

    // --- wallet ---

    @Quand("je demande un pass Apple Wallet")
    public void requestAppleWalletPass() {
        response = post("/api/member/v1/wallet/apple-pass", "");
    }

    @Alors("le pass est émis avec le statut {string}")
    public void assertsWalletPassStatus(final String status) {
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).contains("\"status\":\"" + status + "\"");
    }

    @Alors("le pass est explicitement marqué comme simulé")
    public void assertsWalletPassMocked() {
        assertThat(response.getBody()).contains("\"mocked\":true");
    }

    // --- ethical charter ---

    @Quand("je signe la charte éthique en version {string}")
    public void signEthicalCharter(final String version) {
        response = post("/api/member/v1/ethical-charter/sign", """
                {"version":"%s"}""".formatted(version));
    }

    @Alors("la signature est enregistrée pour la version {string}")
    public void assertsCharterSignatureVersion(final String version) {
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).contains("\"version\":\"" + version + "\"");
    }

    // --- CMS publication workflow ---

    @Et("j'ai créé un contenu brouillon de type {string} intitulé {string}")
    public void createDraftContent(final String type, final String title) {
        final String slug = "acceptance-" + java.util.UUID.randomUUID();
        final String body = """
                {"type":"%s","slug":"%s","sourceType":"CMS","title":"%s"}""".formatted(type, slug, title);
        response = post("/api/admin/v1/content", body);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        contentId = extractJsonStringField(response.getBody(), "id");
    }

    @Et("j'ai ajouté une version en français avec le corps {string}")
    public void addContentVersion(final String contentBody) {
        final String versionRequest = """
                {"language":"fr","title":"Titre de démonstration","body":"%s"}""".formatted(contentBody);
        response = put("/api/admin/v1/content/" + contentId, versionRequest);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Quand("je soumets le contenu pour revue")
    public void submitContent() {
        response = post("/api/admin/v1/content/" + contentId + "/submit", "");
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Et("j'enregistre une approbation éditoriale")
    public void recordEditorialApproval() {
        // The workflow's first review gate (IN_REVIEW -> LEGAL_REVIEW) has no dedicated
        // ContentApprovalRole of its own (only LEGAL/GOVERNANCE exist) -- role is audit
        // metadata only, the aggregate's current status is what actually drives the
        // transition (see Content#recordApproval), so LEGAL is reused here too.
        response = post(
                "/api/admin/v1/content/" + contentId + "/approve", """
                {"role":"LEGAL","decision":"APPROVED"}""");
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Et("j'enregistre une approbation légale")
    public void recordLegalApproval() {
        response = post(
                "/api/admin/v1/content/" + contentId + "/approve", """
                {"role":"LEGAL","decision":"APPROVED"}""");
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Et("j'enregistre une approbation de gouvernance")
    public void recordGovernanceApproval() {
        response = post(
                "/api/admin/v1/content/" + contentId + "/approve", """
                {"role":"GOVERNANCE","decision":"APPROVED"}""");
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Et("je publie le contenu")
    public void publishContent() {
        response = post("/api/admin/v1/content/" + contentId + "/publish", "");
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Alors("le contenu a le statut {string}")
    public void assertsContentStatus(final String status) {
        final ResponseEntity<String> content = get("/api/admin/v1/content/" + contentId);
        assertThat(content.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(content.getBody()).contains("\"status\":\"" + status + "\"");
    }

    // --- network / salary transparency ---

    @Etantdonnéque("les déclarations de compensation de démonstration pour le domaine {string}")
    public void demoCompensationDeclarationsExistFor(final String domainId) {
        // No-op on purpose: the 0004-demo-members-and-compensation Liquibase changeset
        // already seeded >= 5 compensation_declaration rows for the "ia" domain node before
        // this test's application context even started -- there is no member-facing write
        // path for individual compensation declarations to exercise here (see this
        // feature's own file-level comment).
    }

    @Etantdonnéqu("aucune déclaration de compensation n'existe pour le domaine {string}")
    public void noCompensationDeclarationsExistFor(final String domainId) {
        // No-op: "domaine-inexistant" is simply never seeded by any changeset.
    }

    @Quand("je consulte l'insight salarial du domaine {string}")
    public void getDomainSalaryInsight(final String domainId) {
        response = restTemplate.exchange(
                url("/api/public/v1/network/domains/" + domainId + "/salary-insight"), HttpMethod.GET, HttpEntity.EMPTY, String.class);
    }

    @Alors("j'obtiens une fourchette salariale basée sur au moins 5 échantillons")
    public void assertsSalaryInsightAboveThreshold() {
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        final String sampleSize = extractJsonStringField(response.getBody(), "sampleSize");
        assertThat(Integer.parseInt(sampleSize)).isGreaterThanOrEqualTo(5);
    }

    @Alors("aucune fourchette salariale n'est retournée")
    public void assertsNoSalaryInsight() {
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
    }

    // --- verification requests ---

    @Quand("je soumets une demande de vérification de type {string}")
    public void submitVerificationRequest(final String type) {
        response = post("/api/member/v1/verification-requests", """
                {"type":"%s"}""".formatted(type));
    }

    @Alors("la demande de vérification est enregistrée avec le statut {string}")
    public void assertsVerificationRequestStatus(final String status) {
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).contains("\"status\":\"" + status + "\"");
    }

    @Alors("je retrouve cette demande dans la liste de mes demandes de vérification")
    public void assertsVerificationRequestInList() {
        final ResponseEntity<String> list = get("/api/member/v1/verification-requests");
        assertThat(list.getStatusCode()).isEqualTo(HttpStatus.OK);
        final String id = extractJsonStringField(response.getBody(), "id");
        assertThat(list.getBody()).contains(id);
    }

    // --- store ---

    @Quand("je commande {int} exemplaire du produit {string}")
    public void createStoreOrder(final int quantity, final String productName) {
        final ResponseEntity<String> catalog = get("/api/public/v1/store/products");
        assertThat(catalog.getStatusCode()).isEqualTo(HttpStatus.OK);
        final String productId = extractProductIdByName(catalog.getBody(), productName);
        final String body = """
                {"lines":[{"productId":"%s","quantity":%d}]}""".formatted(productId, quantity);
        response = post("/api/member/v1/store/orders", body);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        orderId = extractJsonStringField(response.getBody(), "id");
    }

    @Alors("la commande est créée avec le statut {string}")
    public void assertsOrderStatus(final String status) {
        assertThat(response.getBody()).contains("\"status\":\"" + status + "\"");
    }

    @Quand("je paie cette commande par carte")
    public void payOrderByCard() {
        response = post("/api/member/v1/store/orders/" + orderId + "/payments", """
                {"paymentMethod":"CARD","paymentToken":"pm_card_visa"}""");
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Alors("la commande passe au statut {string}")
    public void assertsOrderStatusAfterPayment(final String status) {
        assertThat(response.getBody()).contains("\"status\":\"" + status + "\"");
    }

    /** Minimal, dependency-free lookup of a product's {@code id} by {@code name} in a JSON array. */
    private static String extractProductIdByName(final String json, final String name) {
        final var matcher = java.util.regex.Pattern
                .compile("\\{[^{}]*\"name\":\"" + java.util.regex.Pattern.quote(name) + "\"[^{}]*}")
                .matcher(json);
        if (!matcher.find()) {
            throw new IllegalStateException("product " + name + " not found in " + json);
        }
        return extractJsonStringField(matcher.group(), "id");
    }

    // --- HTTP helpers ---

    private ResponseEntity<String> get(final String path) {
        return restTemplate.exchange(url(path), HttpMethod.GET, new HttpEntity<>(authenticatedHeaders()), String.class);
    }

    private ResponseEntity<String> post(final String path, final String jsonBody) {
        return restTemplate.exchange(url(path), HttpMethod.POST, new HttpEntity<>(jsonBody, jsonHeaders()), String.class);
    }

    private ResponseEntity<String> put(final String path, final String jsonBody) {
        return restTemplate.exchange(url(path), HttpMethod.PUT, new HttpEntity<>(jsonBody, jsonHeaders()), String.class);
    }

    private String url(final String path) {
        return "http://localhost:" + port + path;
    }

    private HttpHeaders jsonHeaders() {
        final HttpHeaders headers = authenticatedHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    private HttpHeaders authenticatedHeaders() {
        final HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(bearerToken);
        return headers;
    }

    /** Minimal, dependency-free JSON scalar-field extraction — good enough for these assertions. */
    private static String extractJsonStringField(final String json, final String field) {
        final var matcher = java.util.regex.Pattern.compile("\"" + field + "\":\"?([^\",}]+)\"?").matcher(json);
        if (!matcher.find()) {
            throw new IllegalStateException("field " + field + " not found in " + json);
        }
        return matcher.group(1);
    }
}
