<#-- OEI override of base/email/html/executeActions.ftl.
     Sent when an admin (or a required action queued at registration, e.g. Verify Email)
     requires the member to perform one or more actions before continuing.
     Variables: user, realmName, link, requiredActions (list of required action aliases,
     translated below via the base theme's own requiredAction.<ALIAS> keys — already
     localized upstream for fr/en/es/de/it/pt, left untouched/inherited), linkExpiration
     (minutes), linkExpirationFormatter. -->
<#outputformat "plainText">
<#assign requiredActionsText><#if requiredActions??><#list requiredActions><#items as reqActionItem>${msg("requiredAction.${reqActionItem}")}<#sep>, </#sep></#items></#list></#if></#assign>
</#outputformat>

<#import "template.ftl" as layout>
<@layout.emailLayout>
<#if user?? && user.firstName?? && user.firstName?has_content>
<p>${kcSanitize(msg("executeActionsGreetingName", user.firstName))?no_esc}</p>
<#else>
<p>${msg("executeActionsGreetingGeneric")}</p>
</#if>
<p>${kcSanitize(msg("executeActionsIntro", realmName, requiredActionsText))?no_esc}</p>
<@layout.ctaButton href=link label=msg("executeActionsButton")/>
<p>${kcSanitize(msg("executeActionsExpiry", linkExpirationFormatter(linkExpiration)))?no_esc}</p>
<p>${msg("executeActionsIgnore")}</p>
</@layout.emailLayout>
