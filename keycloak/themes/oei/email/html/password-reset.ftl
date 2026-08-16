<#-- OEI override of base/email/html/password-reset.ftl.
     Variables: user, realmName, link, linkExpiration (minutes), linkExpirationFormatter. -->
<#import "template.ftl" as layout>
<@layout.emailLayout>
<#if user?? && user.firstName?? && user.firstName?has_content>
<p>${kcSanitize(msg("passwordResetGreetingName", user.firstName))?no_esc}</p>
<#else>
<p>${msg("passwordResetGreetingGeneric")}</p>
</#if>
<p>${kcSanitize(msg("passwordResetIntro", realmName))?no_esc}</p>
<@layout.ctaButton href=link label=msg("passwordResetButton")/>
<p>${kcSanitize(msg("passwordResetExpiry", linkExpirationFormatter(linkExpiration)))?no_esc}</p>
<p>${msg("passwordResetIgnore")}</p>
</@layout.emailLayout>
