package global.oei.application.web.resource.member.model;

import jakarta.validation.constraints.NotBlank;

/**
 * Request payload for LinkedIn basic import orchestration.
 */
public record LinkedinBasicImportRequest(@NotBlank String accessToken) {
}

