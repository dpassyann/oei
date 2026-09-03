# THE IT ORDER — FINAL MEMBER SPACE & PRODUCTION IMPLEMENTATION SPEC

## Mission

Continue the production platform **The IT Order** (`https://theitorder.global`). The public website is already live and visually mature. The priority is to finish the Member Space and the backend integrations for production.

Do not redesign the public site. Reuse the existing Angular design system, layout, navigation, typography, colors, components, animations, responsive patterns, i18n and API conventions.

Reference palette:

```text
Navy  #0A1E3F
Gold  #E8A530
Ivory #F7F4EC
White #FFFFFF
```

## Core principles

- PostgreSQL only.
- Keycloak for authentication/identity.
- AWS is the production cloud.
- Real backend integrations, not mocks only.
- Local/sandbox/test modes must remain available.
- Provider credentials never live in Git or Docker images.
- Production secrets go to AWS Secrets Manager; non-secret config may go to SSM Parameter Store.
- GitHub Actions authenticates to AWS with OIDC.
- Missing member/profile/CV data is a business state, never a generic HTTP 500.
- Expensive features are governed by entitlements.
- AI assists; the user validates.
- The IT Order only verifies what it has actually verified.

# 1. Repository audit first

Before changing code, inspect frontend, backend, OpenAPI, current Keycloak integration, member categories, membership/contribution models, payment code, email templates, neural-network code, Dockerfiles, GitHub Actions and AWS deployment.

Create:

```text
docs/audit/MEMBER-SPACE-CURRENT-STATE.md
docs/deployment/CI-CD-ROOT-CAUSE.md
```

Document what works, what is mocked, what is broken, what is disabled, what should be reused and what needs migration.

# 2. Multi-agent execution

Launch specialist agents in parallel:

- Agent A: Member bootstrap / profile / onboarding.
- Agent B: LinkedIn.
- Agent C: CV + Spring AI + Bedrock + Textract.
- Agent D: Payments + membership + entitlements.
- Agent E: QR + Apple Wallet + Google Wallet.
- Agent F: Professional Neural Network.
- Agent G: AWS + CI/CD + deployment.
- Agent H: Security / privacy / QA.

Use a coordinator agent to reconcile contracts and prevent duplicated domain models.

# 3. Fix member bootstrap definitively

Create or normalize:

```http
GET /api/member/v1/bootstrap
```

Example:

```json
{
  "authenticated": true,
  "profileStatus": "ONBOARDING_REQUIRED",
  "membershipStatus": "NONE",
  "profileId": null,
  "cvStatus": "NONE",
  "walletStatus": "NOT_ISSUED"
}
```

Profile states:

```text
ONBOARDING_REQUIRED
ONBOARDING_IN_PROGRESS
PROFILE_INCOMPLETE
READY
SUSPENDED
```

CV states:

```text
NONE
UPLOADED
PROCESSING
REVIEW_REQUIRED
READY
FAILED
```

If no professional profile exists, load the premium onboarding modal. Public/static areas remain accessible, but profile-dependent member features wait for onboarding completion.

# 4. Initial onboarding flow

The initial profile must be import-first, not a giant manual form.

V1 flow:

```text
LinkedIn Basic Identity
        +
CV PDF/DOCX
        ↓
AI extraction
        ↓
ProfessionalProfileDraft
        ↓
User review
        ↓
ProfessionalProfile
```

LinkedIn currently provides only the data explicitly authorized by its current scopes. Do not assume full experience/history access until LinkedIn approves it.

# 5. LinkedIn V1

Use LinkedIn OAuth/OIDC.

Expected basic scopes:

```text
openid
profile
email
```

Expected authorized data: subject/user id, name, picture, email, locale/basic identity.

Backend owns code exchange and client secret.

Configuration:

```yaml
the-it-order:
  linkedin:
    enabled: true
    basic-profile-enabled: true
    extended-profile-enabled: false
```

Secrets:

```text
LINKEDIN_CLIENT_ID
LINKEDIN_CLIENT_SECRET
```

Create adapters:

```text
LinkedInBasicIdentityAdapter
LinkedInExtendedProfileAdapter  // disabled until approved
```

Never scrape LinkedIn.

# 6. CV import

Support in V1:

```text
PDF
DOCX
```

Pipeline:

```text
Validate file
 ↓
Local text extraction
 ↓
Enough text?
 ├─ yes → AI structured extraction
 └─ no  → Amazon Textract → AI structured extraction
```

Use PDFBox/Tika for PDF and Apache POI for DOCX when consistent with the current codebase. Use Textract only as OCR fallback.

All uploaded CVs are private. Validate MIME, magic bytes, size, page count and malware.

# 7. AI — Spring AI + Amazon Bedrock

Do not create an MCP server for this deterministic pipeline.

Use Spring AI with Amazon Bedrock and an Anthropic Claude model available through Bedrock.

Do not hard-code the model id.

Example:

```yaml
the-it-order:
  ai:
    cv:
      provider: bedrock
      model-id: ${BEDROCK_CV_MODEL_ID}
      max-retries: 2
```

Port:

```java
public interface ProfessionalProfileExtractionPort {
    ProfessionalProfileDraft extract(ExtractedProfessionalDocument document);
}
```

Adapter:

```text
SpringAiBedrockProfessionalProfileAdapter
```

Use strict JSON Schema / structured output. Never persist arbitrary LLM prose.

# 8. Structured professional profile

Extract:

- source language;
- identity;
- headline;
- professional summary;
- experience;
- education;
- skills;
- certifications;
- languages;
- projects;
- publications;
- expertise domains.

Unknown data stays null. Do not hallucinate companies, dates, degrees, skills or certifications.

# 9. IT career classification

The platform targets computing professionals, including atypical careers.

Do not reject a user because their academic degree is not in IT.

Determine whether the professional history contains meaningful IT responsibility such as software, infrastructure, networks, architecture, cloud, cybersecurity, data, AI, operations, quality, technical leadership, critical systems or related digital responsibility.

Return a structured result:

```json
{
  "itCareer": true,
  "confidence": 0.91,
  "matchedDomains": ["SOFTWARE_ENGINEERING", "ARCHITECTURE"],
  "evidence": ["..."]
}
```

If uncertain, use `REVIEW_REQUIRED`.

AI classification does not grant `OEI_VERIFIED_EXPERT`.

# 10. Expertise provenance

Keep separate:

```text
PROFILE_IMPORTED
EXPERTISE_SUGGESTED
EXPERTISE_REVIEWED
EXPERTISE_VERIFIED
```

Certifications also keep provenance:

```text
CV_IMPORTED
LINKEDIN_IMPORTED
DECLARED
DOCUMENT_PROVIDED
VERIFICATION_PENDING
VERIFIED
OEI_RECOGNIZED
```

# 11. User review

Never publish AI extraction directly.

Flow:

```text
AI result
 → draft
 → preview
 → user validation
 → persistence
```

Show a clear responsibility statement before validation.

# 12. Languages / translation

Detect source language. Preserve original-language content and generate English using Bedrock/Spring AI. Support additional languages later.

States:

```text
ORIGINAL
AI_TRANSLATED
USER_VALIDATED
OUTDATED
```

Do not translate company names, URLs, dates, identifiers, technical product names or certifications unless an official localized name exists.

# 13. Profile and CV are distinct

A professional profile may exist independently from an uploaded CV object.

After onboarding, `/profile` loads normally.

`/cv` must always be accessible once the profile exists. If no CV exists, show a premium empty state:

```text
No CV imported yet.

[Import my CV]
[Connect LinkedIn]
```

Do not create a giant manual CV builder. The CV experience is primarily:

```text
Import
Replace
Re-import
Review
Translate
Generate PDF
Export
```

Individual imported sections may be corrected afterward.

# 14. Smart CV Import pricing

For non-members, AI-assisted CV transformation is a paid one-time service.

Launch price:

```text
2.90 EUR
```

Make configurable.

Capability:

```text
AI_CV_IMPORT
```

An active OEI/The IT Order membership includes this capability according to the current membership formula model.

# 15. Entitlements

Do not write business logic like `if member then free`.

Create a generic entitlement model:

```text
AI_CV_IMPORT
AI_CV_REIMPORT
AI_PROFILE_TRANSLATION
CV_PDF_EXPORT
PREMIUM_CV_TEMPLATE
APPLE_WALLET
GOOGLE_WALLET
BUSINESS_CARD_ORDER
ARTICLE_SUBMIT
```

Sources:

```text
MEMBERSHIP
ONE_TIME_PURCHASE
FOUNDING_STATUS
PROMOTION
INSTITUTIONAL_BENEFIT
ADMIN_GRANT
```

Application code asks:

```text
canUse(userId, capability)
```

# 16. Membership / contributions

Reuse the membership categories/formulas already in the repository.

The Member Space must display:

- current category/formula;
- annual contribution;
- payment status;
- next renewal;
- contribution calls;
- payment history;
- included benefits;
- payment CTA;
- invoice/receipt where available.

Do not delete the profile when contribution expires.

# 17. Real payments

Implement a real payment abstraction.

Primary provider for V1:

```text
Stripe
```

Optional future/secondary:

```text
PayPal
```

Port:

```java
public interface PaymentPort {
    CheckoutSession createCheckout(Purchase purchase);
    PaymentStatus getStatus(PaymentReference reference);
}
```

Adapters:

```text
StripePaymentAdapter
PayPalPaymentAdapter
```

Local/staging: Stripe test mode.
Production: Stripe live mode.

Secrets:

```text
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

Webhook confirmation is authoritative.

# 18. One-time CV import flow

```text
CV upload
 ↓
technical validation
 ↓
AI_CV_IMPORT entitlement?
 ├─ yes → process
 └─ no
     ↓
  checkout €2.90
     ↓
  provider
     ↓
  webhook
     ↓
  grant entitlement
     ↓
  AI processing
```

Payment and entitlement granting must be idempotent.

# 19. QR identity

Generate an opaque verification token.

Example:

```text
https://theitorder.global/verify/member/{opaqueToken}
```

Do not encode personal data directly in the QR.

Use the same identity source for CV, business card, Apple Wallet, Google Wallet and future NFC card.

# 20. Apple Wallet — real implementation

Required manual enrollment:

1. Apple Developer account/membership.
2. Create Pass Type ID.
3. Create Pass Type ID Certificate.
4. Export/store signing certificate/private key securely.
5. Configure pass identifier.
6. Generate and sign `.pkpass`.
7. Expose a backend issue/download endpoint.
8. Implement Apple update web service if dynamic updates are enabled.

Suggested identifier:

```text
pass.global.theitorder.membership
```

Create `AppleWalletAdapter`.

Potential pass fields: logo, display name, title, member number, tier, validity, QR verification URL, public profile.

Store Apple signing material only in local ignored secrets or AWS Secrets Manager.

# 21. Apple Wallet updates

Prepare events:

```text
MembershipActivatedEvent
MembershipRenewedEvent
MembershipExpiredEvent
MembershipSuspendedEvent
BadgeGrantedEvent
```

If update service is enabled, store pass serial, authentication token, update metadata and device registrations according to Apple's model.

# 22. Google Wallet — real implementation

Required manual enrollment:

1. Create Google Wallet API Issuer account.
2. Work initially in demo mode.
3. Enable Google Wallet API in Google Cloud.
4. Create/authorize service account.
5. Create GenericClass.
6. Create GenericObject per member.
7. Generate signed JWT.
8. Generate `Add to Google Wallet` URL.
9. Test with authorized test accounts.
10. Request publishing access.

Config:

```text
GOOGLE_WALLET_ISSUER_ID
GOOGLE_WALLET_CLASS_ID
GOOGLE_WALLET_SERVICE_ACCOUNT
```

Create `GoogleWalletAdapter`.

# 23. Environments and secrets

Profiles:

```text
local
sandbox
staging
prod
```

Recommended matrix:

```text
LinkedIn    dev app        staging app       prod app
Stripe      test           test              live
Apple       mock/dev       test pass         prod cert
Google      demo           demo/test         publishing
Bedrock     dev role       staging role      prod role
Textract    dev            staging           prod
Storage     MinIO          S3 staging        S3 prod
Postgres    Docker         staging           prod
```

Local:
- `.env.local` ignored;
- `.env.example` committed with placeholders.

Production:
- AWS Secrets Manager for secrets;
- SSM Parameter Store for non-secret config if useful;
- IAM roles for Bedrock/Textract/S3.

If Bedrock is used, do not add an Anthropic API key unless a separate direct-provider adapter is intentionally implemented.

# 24. Social links

After profile creation, allow member to add public professional links:

```text
LinkedIn
GitHub
Website
X
YouTube
```

Render branded icons only when configured. Respect privacy visibility settings.

# 25. Professional Neural Network evolution

The existing futuristic neural network becomes a multi-dimensional career exploration engine.

Navigation dimensions:

1. Career path.
2. Education/certifications.
3. Country/geography.
4. Companies/industries.
5. Compensation bands.
6. Experts.

A clicked expert triggers the existing scan/activation animation, then opens a side panel with avatar, headline, country, expertise, certifications, public profile, journey and configured social links.

Certification nodes open certification detail and related experts/paths.

# 26. Compensation / salary privacy

Allow optional contribution of compensation data, but never display an individual's exact salary publicly.

Store in a separate concept such as:

```text
CompensationContribution
```

Fields may include country, currency, role, seniority, industry, compensation range, year and employment type.

Only show aggregate salary insight when a minimum anonymity threshold is satisfied.

Never create a visible graph edge between a person and their exact salary.

# 27. Neural network persistence

Do not introduce a graph database just for visual effect.

Prefer PostgreSQL initially with concepts/relations unless measured requirements justify Neo4j or another graph store.

Visualization may use D3, Cytoscape or Sigma.

# 28. Keycloak MFA — secondary priority

Plan branded MFA and recovery, but do not block Member Space completion on it.

Priorities:
- profile bootstrap;
- LinkedIn Basic;
- CV;
- AI;
- payments;
- membership;
- wallet.

Create a follow-up security task for MFA/TOTP/email OTP according to supported Keycloak architecture.

# 29. Email templates

Use backend Thymeleaf templates, localized FR/EN.

Required templates:

```text
ACCOUNT_WELCOME
PROFILE_READY
CV_IMPORT_PAYMENT_CONFIRMATION
CV_IMPORT_READY
CV_IMPORT_FAILED
MEMBERSHIP_CONTRIBUTION_DUE
MEMBERSHIP_PAYMENT_CONFIRMED
MEMBERSHIP_RENEWED
WALLET_READY
```

Frontend never sends SMTP directly.

# 30. Security / privacy

Implement:
- TLS;
- least-privilege IAM;
- private CV storage;
- encrypted storage;
- object-level authorization;
- audit;
- consent;
- retention;
- deletion/export;
- malware scanning;
- rate limits;
- no sensitive logs.

Track explicit consent for CV AI processing, LinkedIn connection, public profile, compensation contribution and social links.

# 31. AI cost protection

Track:
- provider;
- model;
- input/output tokens;
- estimated cost;
- OCR pages;
- processing duration;
- entitlement/purchase source.

Add configurable caps for file size, CV pages, retries, translations and rate limits.

# 32. AWS target

Preferred initial target:

```text
Route53
 → CloudFront + WAF
 → EC2 / k3s
 → Traefik
 → frontend / backend / Keycloak / PostgreSQL / storage
```

Use ECR, S3, Secrets Manager, CloudWatch, Bedrock and Textract.

Future migration remains possible to RDS PostgreSQL, native S3 and ECS/EKS.

# 33. Fix CI/CD

Current GitHub CI/CD is unreliable and manual deployment has been required.

Investigate actual failure instead of guessing.

Check:
- Java version;
- Node/Angular version;
- Docker version;
- image architecture;
- target server architecture;
- k3s;
- Helm/Kustomize;
- ECR auth;
- environment variables;
- health checks;
- deployment scripts.

Create root-cause documentation.

# 34. Target GitHub Actions pipeline

```text
PR
 → lint
 → unit tests
 → integration tests
 → frontend build
 → backend build
 → security scan
 → Docker build
 → ECR push
 → staging deploy
 → smoke tests
 → controlled prod promotion
 → production deploy
 → smoke tests
 → rollback on failure
```

Use immutable tags:

```text
sha-<git-sha>
vX.Y.Z
```

No production `latest`.

Use GitHub OIDC to AWS rather than long-lived AWS keys.

# 35. Health checks

Backend:

```text
/actuator/health/liveness
/actuator/health/readiness
```

Frontend `/health`.

Add probes for Keycloak/PostgreSQL.

Fail or rollback deployment if production smoke tests fail.

# 36. Testing

Required E2E scenario:

```text
new account
 → bootstrap
 → onboarding
 → LinkedIn Basic
 → CV upload
 → checkout if non-member
 → AI import
 → review
 → save
 → CV
 → membership
 → digital card
```

And:

```text
active member
 → CV upload
 → entitlement skips checkout
 → AI import
```

Test provider callbacks, webhook signatures, state/nonce, file validation, OCR fallback and wallet issuance.

# 37. Business errors

Use explicit errors:

```text
PROFILE_ONBOARDING_REQUIRED
CV_NOT_FOUND
CV_UNSUPPORTED_FORMAT
CV_NOT_IT_RELATED
CV_CLASSIFICATION_UNCERTAIN
PAYMENT_REQUIRED
PAYMENT_FAILED
AI_PROCESSING_FAILED
LINKEDIN_NOT_AVAILABLE
LINKEDIN_EXTENDED_ACCESS_NOT_ENABLED
WALLET_PROVIDER_NOT_CONFIGURED
```

Never expose stack traces.

# 38. Required documentation

Create:

```text
docs/member-space/
  ARCHITECTURE.md
  BOOTSTRAP.md
  ONBOARDING.md
  LINKEDIN.md
  CV-IMPORT.md
  AI-BEDROCK.md
  PAYMENTS.md
  MEMBERSHIP-ENTITLEMENTS.md
  WALLET.md
  NEURAL-NETWORK.md
  SECURITY-PRIVACY.md
  GO-LIVE-CHECKLIST.md

docs/deployment/
  CI-CD-ROOT-CAUSE.md
  CI-CD.md
  AWS-SECRETS.md
  LOCAL-SANDBOX-PROD.md
  ROLLBACK.md
```

# 39. Manual credential / enrollment checklist

At the end of implementation, produce a checklist for the owner. Do not request secrets in source code, chat logs, issues or commits.

```text
[ ] LinkedIn Client ID
[ ] LinkedIn Client Secret
[ ] LinkedIn redirect URI
[ ] Stripe test secret
[ ] Stripe test webhook secret
[ ] Stripe live secret
[ ] Stripe live webhook secret
[ ] Apple Pass Type ID
[ ] Apple signing certificate/private key
[ ] Google Wallet Issuer ID
[ ] Google service account
[ ] Google Wallet publishing access
[ ] AWS Bedrock model access
[ ] AWS region
```

# 40. Implementation order

1. Repository + CI/CD audit.
2. Fix bootstrap semantics and member routing.
3. Activate member-space onboarding modal.
4. Real LinkedIn Basic OAuth.
5. Real PDF/DOCX upload + private storage.
6. Real local extraction + Textract fallback.
7. Spring AI + Bedrock structured extraction/classification/translation.
8. Real Stripe test checkout/webhook.
9. Entitlements + membership inclusion.
10. Production Stripe configuration.
11. QR verification.
12. Apple Wallet enrollment/integration.
13. Google Wallet enrollment/integration.
14. Neural Network evolution.
15. Security hardening.
16. Automated staging/prod deployment.
17. Smoke tests + rollback + go-live.

# 41. Production definition of done

The Member Space is production-ready when:

- login produces deterministic bootstrap;
- missing profile no longer creates accidental 500;
- onboarding modal works;
- LinkedIn Basic works with real OAuth;
- PDF/DOCX import works;
- scanned PDF fallback works;
- Bedrock structured extraction works;
- IT-career classification works without excluding atypical backgrounds solely due to education;
- user review is mandatory;
- PostgreSQL persistence works;
- profile translation works;
- €2.90 non-member checkout works;
- active membership entitlement skips one-time checkout;
- contribution flow works;
- QR verification works;
- Apple Wallet works after enrollment;
- Google Wallet works after enrollment;
- Neural Network opens profile/social links and supports requested dimensions;
- salary data is anonymized/aggregated;
- secrets are externalized;
- GitHub CI/CD deploys frontend/backend automatically;
- staging and production smoke tests pass;
- rollback is documented;
- monitoring is active.

## Final product principle

The user experience should be:

> I create my account. I connect LinkedIn. I upload my CV. The IT Order understands my career. I review it. My profile is ready. I can remain a profile-only user or join The IT Order. My CV, QR, Wallet, membership and professional neural-network identity all rely on the same professional profile.

Do not solve this with dozens of manual forms. Fix the lifecycle and implement real provider integrations.
