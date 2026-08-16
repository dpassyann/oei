<#-- OEI Keycloak email theme layout.
     Overrides the shared macro imported by every email template (base/email/html/template.ftl:
     `<#import "template.ftl" as layout>` then `<@layout.emailLayout>...</@layout.emailLayout>`).
     Because Keycloak's theme resolution looks up "template.ftl" through the current theme with
     parent fallback, this override applies even to base *.ftl templates we do NOT copy into this
     theme (e.g. org-invite.ftl, email-update-confirmation.ftl) — they automatically get the OEI
     branded header/footer wrapper below, with their own (Keycloak-translated) body content
     untouched.

     Visual parity with the Spring-side transactional emails (see
     backend/infrastructure/mail/src/main/resources/templates/email/fragments/shell.html):
     midnight-blue header/footer (#0a1e3f), gold accent (#e8a530), same nav links
     (accueil/espace membre/contact), same legal/unsubscribe copy — reused verbatim via the
     emailFooter* keys below so a member cannot tell a Keycloak account email apart from an OEI
     transactional email.

     Styling is inline on every element (tables, td, a) because most email clients (Outlook
     desktop, many mobile mail apps) strip or ignore <style> blocks and external stylesheets
     entirely — table layout, no flex/grid, matching the Spring shell's own constraints.
     ${realmName} is the realm's configured display name (data-driven), not a hardcoded brand
     string. All other visible text below comes from msg() calls resolved against this theme's
     messages/messages_*.properties (fr/en/es/de/it/pt) — no hardcoded copy. -->
<#macro emailLayout>
<!DOCTYPE html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${realmName}</title>
<style>
  a { color: #0a1e3f; }
  a:hover { color: #e8a530; }
</style>
</head>
<body style="margin:0; padding:0; background-color:#eef1f6; font-family:Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#eef1f6; padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 16px rgba(10,30,63,0.15);">
          <tr>
            <td style="background-color:#0a1e3f; padding:24px 32px; text-align:center;">
              <span style="color:#e8a530; font-weight:bold; font-size:18px; letter-spacing:0.5px; font-family:Arial, Helvetica, sans-serif;">${realmName}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px; color:#0a1e3f; font-size:15px; line-height:1.6; font-family:Arial, Helvetica, sans-serif;">
              <#nested>
            </td>
          </tr>
          <tr>
            <td style="background-color:#0a1e3f; padding:20px 32px; text-align:center; font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#c9d3e0;">
              <p style="margin:0 0 10px;">
                <a href="https://oei.global" style="color:#e8a530; text-decoration:none; margin:0 6px;">${msg("emailFooterNavHome")}</a>
                <span style="color:#3a4d6e;">&middot;</span>
                <a href="https://oei.global/espace-membre" style="color:#e8a530; text-decoration:none; margin:0 6px;">${msg("emailFooterNavMemberSpace")}</a>
                <span style="color:#3a4d6e;">&middot;</span>
                <a href="https://oei.global/contact" style="color:#e8a530; text-decoration:none; margin:0 6px;">${msg("emailFooterNavContact")}</a>
              </p>
              <p style="margin:0 0 6px;">${msg("emailFooterLegal")}</p>
              <p style="margin:0 0 6px;">${msg("emailFooterUnsubscribe")}</p>
              <p style="margin:8px 0 0; color:#7488a8;">&copy; ${.now?string("yyyy")} OEI</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
</#macro>

<#-- Shared gold call-to-action button, same markup/colors as the Spring shell's
     `email/fragments/shell.html :: ctaButton` fragment. -->
<#macro ctaButton href label>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0;">
  <tr>
    <td style="background-color:#e8a530; border:1px solid #e8a530; border-radius:6px;">
      <a href="${href}" style="display:inline-block; padding:11px 24px; color:#0a1e3f; font-weight:600; font-family:Arial, Helvetica, sans-serif; font-size:14px; text-decoration:none; border-radius:6px;">${label}</a>
    </td>
  </tr>
</table>
</#macro>
