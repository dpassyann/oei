<#-- OEI override of base/email/html/identity-provider-link.ftl.
     Sent when a member requests to link an external identity provider account.
     Variables: identityProviderDisplayName, realmName, identityProviderContext.username,
     link, linkExpiration (minutes), linkExpirationFormatter. -->
<#import "template.ftl" as layout>
<@layout.emailLayout>
<p>${kcSanitize(msg("identityProviderLinkIntro", identityProviderContext.username, identityProviderDisplayName, realmName))?no_esc}</p>
<@layout.ctaButton href=link label=msg("identityProviderLinkButton")/>
<p>${kcSanitize(msg("identityProviderLinkExpiry", linkExpirationFormatter(linkExpiration)))?no_esc}</p>
<p>${kcSanitize(msg("identityProviderLinkIgnore", realmName, identityProviderDisplayName))?no_esc}</p>
</@layout.emailLayout>
