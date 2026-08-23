package global.oei.infrastructure.client.linkedin;

import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.service.annotation.GetExchange;
import org.springframework.web.service.annotation.HttpExchange;

/**
 * LinkedIn OpenID Connect userinfo client (identity-only scope).
 */
@HttpExchange
public interface LinkedinProfileHttpClient {

    /**
     * Calls LinkedIn userinfo endpoint using a member OAuth access token.
     */
    @GetExchange("/v2/userinfo")
    LinkedinBasicProfile getCurrentMemberProfile(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorizationHeader);
}

