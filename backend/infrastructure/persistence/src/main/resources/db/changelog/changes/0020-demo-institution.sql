-- Same demo institution as the frontend's institution-demo-data.ts DEMO_INSTITUTION
-- (slug 'demo-institution', see keycloak/realm-export/oei-realm.json group
-- /institutions/demo-institution), so demo data stays coherent front/back.

INSERT INTO institution (id, legal_name, public_name, logo_url, country, sectors_json, description, public_slug, is_demo_data, status)
VALUES ('27af46da-8426-55c1-b2fb-aa3814e0d1bc', 'OEI Démonstration SA', 'OEI Démonstration — Institution',
        '/assets/institutions/demo-institution-logo.svg', 'CH', '["banking","consulting"]',
        'Institution fictive de démonstration utilisée pour illustrer l''espace membre institutionnel. Ne correspond à aucun partenaire réel de l''OEI.',
        'demo-institution', true, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

INSERT INTO institution_domain (id, institution_id, domain, verified, verified_at)
VALUES ('1612b279-bb5b-534c-a0ba-1b478000e0be', '27af46da-8426-55c1-b2fb-aa3814e0d1bc', 'oei-demo-institution.org', true, '2026-01-05T09:00:00Z')
ON CONFLICT (id) DO NOTHING;
