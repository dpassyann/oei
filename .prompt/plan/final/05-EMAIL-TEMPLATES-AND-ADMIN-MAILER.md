# Feature — Emails transactionnels OEI

## Objectif
Tous les emails OEI doivent être HTML, responsives, professionnels et cohérents avec la marque.

## Abstraction
```text
MailPort
├── SMTPAdapter
└── future AmazonSESAdapter
```

## Templates
Bienvenue, vérification email, renouvellement, paiement confirmé/échoué, institution créée, invitation institution, article approuvé/corrections, invitation événement, reminder, annulation, badge obtenu, commande carte, support/admin.

Chaque template : subject, preheader, header OEI, contenu, CTA, footer légal, préférences, langue.

## Admin mailer
Route `/admin/emails` :
- destinataire ou groupe ;
- template ;
- langue ;
- variables ;
- preview desktop/mobile ;
- test email ;
- schedule ;
- send.

## Sécurité
Quotas, confirmation, audit, séparation transactionnel/marketing, désinscription lorsque nécessaire. Aucun envoi massif arbitraire sans rôle spécifique.

## Historique
Template/version, destinataire, statut, providerMessageId, sentAt, delivery/bounce si disponible.

## AWS future
Préparer SES : domaine vérifié, DKIM, SPF, DMARC, bounce/complaint handling. Le domaine métier ne dépend jamais de SES.
