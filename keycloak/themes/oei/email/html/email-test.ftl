<#-- OEI override of base/email/html/email-test.ftl.
     Sent by the admin console's "Realm settings -> Email -> Test connection" button, to
     confirm the configured SMTP settings are working (see keycloak/themes/oei/email/README.md
     for the production SMTP/Amazon SES configuration this validates). Variables: realmName. -->
<#import "template.ftl" as layout>
<@layout.emailLayout>
<p>${kcSanitize(msg("emailTestIntro", realmName))?no_esc}</p>
</@layout.emailLayout>
