# THE IT ORDER — LINKEDIN ENROLLMENT & APPROVAL GUIDE

## Purpose

Configure LinkedIn correctly for The IT Order and prepare the application for any future restricted access to richer member profile data.

Production:

```text
https://theitorder.global
```

Important: basic LinkedIn OpenID Connect is different from restricted access to richer Profile APIs. Do not promise complete work experience/history import until LinkedIn has granted the relevant access.

# 1. Create or verify the LinkedIn Developer application

Use the official organization that operates The IT Order.

Prepare:
- public organization name;
- official logo;
- production domain;
- privacy-policy URL;
- terms URL;
- support/contact email;
- clear product description.

Recommended public URLs:

```text
https://theitorder.global
https://theitorder.global/privacy
https://theitorder.global/terms
```

Do not submit placeholder legal pages.

# 2. Enable basic Sign in with LinkedIn

In the LinkedIn Developer Portal:

```text
Products
→ Sign in with LinkedIn using OpenID Connect
```

Request/enable it.

Current basic scopes:

```text
openid
profile
email
```

These are appropriate for the member's own basic identity such as name, profile picture and email, subject to granted permissions.

# 3. Configure redirect URI

Configure the exact production callback actually handled by the backend.

Example:

```text
https://api.theitorder.global/api/member/v1/linkedin/callback
```

or whatever route exists in the deployed architecture.

Add staging separately if supported:

```text
https://staging-api.theitorder.global/api/member/v1/linkedin/callback
```

Redirect URLs must be exact HTTPS URLs.

# 4. Credentials

Provider credentials:

```text
LINKEDIN_CLIENT_ID
LINKEDIN_CLIENT_SECRET
```

Local:
- ignored local secret file / environment variables.

Production:
- AWS Secrets Manager.

Never expose the Client Secret to Angular.

# 5. OAuth flow

Use Authorization Code / 3-legged OAuth.

```text
Browser
 ↓
The IT Order backend generates state/nonce
 ↓
LinkedIn authorization
 ↓
User consent
 ↓
LinkedIn callback with code
 ↓
Backend validates state
 ↓
Backend exchanges code for token
 ↓
Backend reads authorized member data
 ↓
ProfessionalIdentityDraft
```

Request only minimal scopes.

# 6. Basic identity use

V1 should use LinkedIn primarily to reduce onboarding friction.

Expected basic use:
- identity;
- name;
- photo;
- email;
- locale/basic authorized information.

Link this identity to the authenticated The IT Order account.

Keycloak remains the platform identity/authentication layer.

# 7. Richer profile access

LinkedIn's richer Profile API is restricted and subject to approval/agreements.

Do not assume that a normal developer application provides:
- full work experience;
- full education history;
- certifications;
- complete professional journey.

Keep this behind:

```text
LINKEDIN_EXTENDED_PROFILE_ENABLED=false
```

until actual approval is granted.

# 8. Suggested provider-use-case description

Use a clear description such as:

> The IT Order is a professional platform for computing professionals. Members may voluntarily connect their LinkedIn account to reduce onboarding friction and reuse professional identity information that they explicitly authorize us to access. The data is used only to create or enrich the authenticated member's own professional profile on The IT Order. We do not scrape LinkedIn, we do not access other members' private data, and we do not sell LinkedIn-derived data. Members review imported information before it is published.

If asked why richer professional information is needed:

> With the member's explicit consent, professional experience, education and certification information would be used to pre-populate the member's own career profile and professional journey. Imported information remains subject to the member's review and correction. The feature is designed to reduce repetitive manual profile entry.

If asked about data handling:

> We store only data required for the member-facing feature, apply access controls, encryption in transit and at rest, and provide deletion/revocation mechanisms. Data is associated only with the authenticated member who authorized access.

# 9. What not to claim

Avoid:
- “download any LinkedIn CV”;
- “mirror LinkedIn profiles”;
- “crawl LinkedIn experience”;
- “verify identity automatically from LinkedIn”.

Prefer:
- user-authorized import;
- authenticated member's own data;
- profile pre-population;
- explicit consent;
- user review.

# 10. Privacy requirements

The production privacy policy should explain:
- LinkedIn connection;
- data categories received;
- purpose;
- retention;
- storage;
- public/private distinction;
- deletion;
- disconnect/revocation;
- subprocessors where relevant.

Provide a clear disconnect action.

# 11. Data model

Suggested:

```text
LinkedInConnection
```

Fields:

```text
userId
linkedinSubject
connectedAt
scopes
tokenMetadata
lastSyncedAt
status
```

Do not store raw tokens unencrypted.

# 12. Provenance

Imported profile data should preserve source:

```text
LINKEDIN_IMPORTED
CV_IMPORTED
USER_EDITED
OEI_VERIFIED
```

LinkedIn import does not equal The IT Order verification.

# 13. Disconnect flow

Member settings:

```text
Connected accounts
→ LinkedIn
→ Disconnect
```

On disconnect:
- remove stored provider tokens;
- revoke where supported;
- handle previously imported data according to published privacy rules;
- explain consequences.

# 14. Security checklist

```text
[ ] HTTPS production site
[ ] Privacy Policy
[ ] Terms
[ ] Official logo
[ ] Exact redirect URI
[ ] Client secret externalized
[ ] State validation
[ ] Nonce validation for OIDC
[ ] Minimal scopes
[ ] No access token in frontend storage unless architecturally required and secured
[ ] Disconnect flow
[ ] Deletion flow
[ ] Audit logging
```

# 15. Approval package for restricted access

Before requesting richer LinkedIn access, prepare:

```text
1. Product screenshots
2. Short onboarding demo video
3. Privacy Policy
4. Terms
5. Data-flow diagram
6. User-consent explanation
7. Retention policy
8. Security overview
9. Exact fields requested
10. Why each field is necessary
11. Delete/disconnect flow
```

Never request broad permissions “just in case”.

# 16. Current fallback

Until extended access is approved:

```text
LinkedIn
→ Basic identity

CV PDF/DOCX
→ experience
→ education
→ skills
→ certifications
→ AI structured profile
```

This is the V1 onboarding path. Do not block production on LinkedIn extended approval.
