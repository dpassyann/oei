# Bounded context: `wallet`

Carte professionnelle numérique et pass Apple/Google Wallet — **mockés en V1**
(aucun `.pkpass` signé réel, pas de certificat éditeur disponible ; voir ADR 0002
§Wallet). Ne jamais présenter un pass comme une pièce d'identité officielle.

Entités attendues : `DigitalBusinessCard`, `WalletPass` (`mocked: true` en V1),
`WalletPassVerification`.
