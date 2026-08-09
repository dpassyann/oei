# Prompt Claude Code — Backend Spring Boot : emails HTML Thymeleaf

## Objectif
Mettre tous les templates email dans le backend Spring Boot avec Thymeleaf.

## Structure
`src/main/resources/templates/email/`
avec layouts, fragments, langues FR/EN puis extensions futures.

## Templates V1
### Account
ACCOUNT_CREATED, VERIFY_EMAIL, PASSWORD_RESET.

### Membership
MEMBERSHIP_WELCOME, PAYMENT_CONFIRMED, PAYMENT_FAILED, EXPIRING, EXPIRED, RENEWED.

### Resources
RESOURCE_DELIVERY, WHITEPAPER_DELIVERY.

### Articles
ARTICLE_SUBMITTED, APPROVED, CHANGES_REQUESTED, REJECTED, PUBLISHED.

### Institutions
INSTITUTION_INVITATION, ACCOUNT_ACTIVATED, ADMIN_INVITED, SUSPENDED.

### Events
EVENT_REGISTRATION_CONFIRMATION, REMINDER, UPDATED, CANCELLED, STARTING.

### Badges / certifications
BADGE_GRANTED, CERTIFICATION_VERIFIED, CERTIFICATION_REVIEW_REQUIRED.

### Orders
BUSINESS_CARD_ORDER_CONFIRMED, BUSINESS_CARD_ORDER_SHIPPED.

## Locale
Priorité :
1. langue préférée du compte ;
2. langue de consultation transmise de manière contrôlée ;
3. fallback anglais.

## Design
Bleu nuit `#0A1E3F`, doré `#E8A530`, ivoire, logo OEI, CTA clair, HTML responsive + text/plain fallback. Pas de JavaScript.

## Architecture
`MailApplicationService` -> `MailPort` -> `SmtpMailAdapter`, futur `SesMailAdapter`.

Prévoir mode dev Mailpit/MailHog ou log adapter et endpoint admin sécurisé de preview.

Sécurité : liens signés, expiration, escaping, aucun JWT brut ni secret dans les templates.
