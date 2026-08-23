package global.oei.application.web.resource.member.model;

import jakarta.validation.constraints.NotBlank;

/**
 * Payload sent by the frontend OAuth callback to finalize LinkedIn import.
 */
public record LinkedinOAuthCallbackRequest(
        @NotBlank String authorizationCode,
        @NotBlank String redirectUri) {
}

