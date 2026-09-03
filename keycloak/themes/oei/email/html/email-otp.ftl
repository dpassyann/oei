<#-- OEI email-based MFA one-time code, sent by the custom "oei-email-otp-authenticator"
     Keycloak authenticator (see keycloak/extensions/email-otp-authenticator) as a mandatory
     step of the browser login flow.
     Variables: user, realmName, code, ttlMinutes. -->
<#import "template.ftl" as layout>
<@layout.emailLayout>
<#if user?? && user.firstName?? && user.firstName?has_content>
<p>${kcSanitize(msg("emailOtpGreetingName", user.firstName))?no_esc}</p>
<#else>
<p>${msg("emailOtpGreetingGeneric")}</p>
</#if>
<p>${kcSanitize(msg("emailOtpIntro", realmName))?no_esc}</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0;">
  <tr>
    <td style="background-color:#eef1f6; border-radius:6px; padding:16px 24px; text-align:center;">
      <span style="font-family:'Courier New', Courier, monospace; font-size:28px; font-weight:bold; letter-spacing:6px; color:#0a1e3f;">${code}</span>
    </td>
  </tr>
</table>
<p>${kcSanitize(msg("emailOtpExpiry", ttlMinutes))?no_esc}</p>
<p>${msg("emailOtpIgnore")}</p>
</@layout.emailLayout>
