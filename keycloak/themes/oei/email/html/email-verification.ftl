<#-- OEI override of base/email/html/email-verification.ftl.
     Sent when a member registers or when "Verify Email" is a pending required action
     (see requiredActions/verifyEmail in keycloak/realm-export/oei-realm.json).
     Variables available in this context (standard Keycloak email context): user, realmName,
     link, linkExpiration (minutes), linkExpirationFormatter(linkExpiration). No text is
     hardcoded here — every visible string comes from this theme's
     messages/messages_*.properties via msg(). -->
<#import "template.ftl" as layout>
<@layout.emailLayout>
<#if user?? && user.firstName?? && user.firstName?has_content>
<p>${kcSanitize(msg("emailVerificationGreetingName", user.firstName))?no_esc}</p>
<#else>
<p>${msg("emailVerificationGreetingGeneric")}</p>
</#if>
<p>${kcSanitize(msg("emailVerificationIntro", realmName))?no_esc}</p>
<@layout.ctaButton href=link label=msg("emailVerificationButton")/>
<p>${kcSanitize(msg("emailVerificationExpiry", linkExpirationFormatter(linkExpiration)))?no_esc}</p>
<p>${msg("emailVerificationIgnore")}</p>
</@layout.emailLayout>
