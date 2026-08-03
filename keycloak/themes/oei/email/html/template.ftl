<#-- OEI Keycloak email theme layout.
     Overrides only the shared macro imported by every base email template
     (base/email/html/template.ftl), so all message bodies keep coming from
     Keycloak's own i18n messages_*.properties (msg() calls in the untouched
     base *.ftl files) — no hardcoded text is introduced here. ${realmName}
     below is the realm's configured display name (data-driven), not a
     hardcoded brand string.

     Styling is inline on every element (tables, td, a) because most email
     clients (Outlook desktop, many mobile mail apps) strip or ignore
     <style> blocks and external stylesheets entirely. The <style> block is
     kept only as a progressive enhancement for clients that do support it
     (Gmail/Apple Mail webviews); nothing depends on it rendering. -->
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
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#eef1f6; padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff; border-radius:8px; border-top:4px solid #e8a530; box-shadow:0 4px 16px rgba(10,30,63,0.15);">
          <tr>
            <td style="background-color:#0a1e3f; padding:24px 32px; border-radius:4px 4px 0 0;">
              <span style="color:#ffffff; font-weight:bold; font-size:18px; letter-spacing:1px; font-family:Arial, Helvetica, sans-serif;">${realmName}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px; color:#0a1e3f; font-size:15px; line-height:1.6; font-family:Arial, Helvetica, sans-serif;">
              <#nested>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
</#macro>
