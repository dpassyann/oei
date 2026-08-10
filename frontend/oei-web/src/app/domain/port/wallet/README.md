# Bounded context: `wallet` (ports)

Ports pour générer la carte numérique et les pass Wallet mockés, et pour la
vérification publique d'un pass.

Endpoints OpenAPI correspondants : `POST /api/member/v1/digital-card`,
`POST /api/member/v1/wallet/apple-pass`, `POST /api/member/v1/wallet/google-pass`,
`GET /api/public/v1/wallet/passes/{serialNumber}/verify`,
`GET /api/public/v1/members/{publicSlug}/digital-card` (carte publique, page `/card/{slug}`).
