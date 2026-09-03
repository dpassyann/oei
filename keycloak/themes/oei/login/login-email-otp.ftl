<#-- OEI mandatory email OTP challenge, rendered by the custom "oei-email-otp-authenticator"
     browser-login step (see keycloak/extensions/email-otp-authenticator). The code was just
     emailed to the masked address below via the "oei" email theme (email-otp.ftl). -->
<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=true; section>
    <#if section="header">
        ${msg("emailOtpTitle")}
    <#elseif section="form">
        <p>${kcSanitize(msg("emailOtpFormIntro", email!""))?no_esc}</p>
        <form id="kc-email-otp-login-form" class="${properties.kcFormClass!}" action="${url.loginAction}" method="post">
            <div class="${properties.kcFormGroupClass!}">
                <div class="${properties.kcLabelWrapperClass!}">
                    <label for="emailOtpCode" class="${properties.kcLabelClass!}">${msg("emailOtpCodeLabel")}</label>
                </div>
                <div class="${properties.kcInputWrapperClass!}">
                    <input id="emailOtpCode" name="emailOtpCode" autocomplete="one-time-code" type="text"
                           inputmode="numeric" class="${properties.kcInputClass!}" autofocus/>
                </div>
            </div>

            <div class="${properties.kcFormGroupClass!}">
                <div id="kc-form-buttons" class="${properties.kcFormButtonsClass!}">
                    <input class="${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonBlockClass!} ${properties.kcButtonLargeClass!}"
                           name="login" id="kc-login" type="submit" value="${msg("emailOtpSubmit")}"/>
                </div>
                <div id="kc-form-options" class="${properties.kcFormOptionsClass!}">
                    <div class="${properties.kcFormOptionsWrapperClass!}">
                        <button class="${properties.kcButtonClass!} ${properties.kcButtonDefaultClass!} ${properties.kcButtonBlockClass!}"
                                name="resend" id="kc-resend" type="submit" value="true">${msg("emailOtpResend")}</button>
                    </div>
                </div>
            </div>
        </form>
    </#if>
</@layout.registrationLayout>
