-- Demo store catalog (goodies, business card, print-cv, print-whitepaper), V1 catalog per
-- 01-catalogue-produits.md §1. Deterministic UUIDs (fixed, hand-picked -- this is reference
-- catalog data, not per-run generated demo members) so the dataset is reproducible run to run.
-- Idempotent: every INSERT is guarded by an ON CONFLICT DO NOTHING on a natural unique key
-- (code/sku). Never deleted/disabled by any later migration -- this is real catalog reference
-- data (not a fake member/account), so the usual "demo data = DEMO account, never a real
-- Keycloak account" rule does not apply here, but the "never deletable by a later migration"
-- convention still does.

INSERT INTO product_category (id, code, label, fulfillment_kind)
VALUES ('00000000-c47e-5000-8000-000000000001', 'goodies', 'Goodies OEI', 'PHYSICAL_GOODS')
ON CONFLICT (code) DO NOTHING;

INSERT INTO product_category (id, code, label, fulfillment_kind)
VALUES ('00000000-c47e-5000-8000-000000000002', 'business-card', 'Carte de visite personnalisée', 'PRINT_AND_SHIP')
ON CONFLICT (code) DO NOTHING;

INSERT INTO product_category (id, code, label, fulfillment_kind)
VALUES ('00000000-c47e-5000-8000-000000000003', 'print-cv', 'Impression + envoi CV', 'PRINT_AND_SHIP')
ON CONFLICT (code) DO NOTHING;

INSERT INTO product_category (id, code, label, fulfillment_kind)
VALUES ('00000000-c47e-5000-8000-000000000004', 'print-whitepaper', 'Impression + envoi Livre Blanc', 'PRINT_AND_SHIP')
ON CONFLICT (code) DO NOTHING;

INSERT INTO product (id, category_id, sku, name, description, unit_price_amount, unit_price_currency, active, customizable)
VALUES ('00000000-9000-5000-8000-000000000001', '00000000-c47e-5000-8000-000000000001', 'OEI-PEN-001', 'Stylo OEI',
        'Stylo officiel de l''Ordre des Experts Informatique.', 9.90, 'EUR', true, false)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product (id, category_id, sku, name, description, unit_price_amount, unit_price_currency, active, customizable)
VALUES ('00000000-9000-5000-8000-000000000002', '00000000-c47e-5000-8000-000000000002', 'OEI-BCARD-001', 'Carte de visite OEI',
        'Carte de visite personnalisée, imprimée et expédiée.', 24.90, 'EUR', true, true)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product (id, category_id, sku, name, description, unit_price_amount, unit_price_currency, active, customizable)
VALUES ('00000000-9000-5000-8000-000000000003', '00000000-c47e-5000-8000-000000000003', 'OEI-PRINT-CV-001', 'Impression + envoi CV',
        'Impression et envoi postal de votre CV OEI existant.', 14.90, 'EUR', true, false)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product (id, category_id, sku, name, description, unit_price_amount, unit_price_currency, active, customizable)
VALUES ('00000000-9000-5000-8000-000000000004', '00000000-c47e-5000-8000-000000000004', 'OEI-PRINT-WP-001', 'Impression + envoi Livre Blanc',
        'Impression et envoi postal du Livre Blanc OEI.', 19.90, 'EUR', true, false)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO business_card_template (id, name, preview_url)
VALUES ('00000000-7e57-5000-8000-000000000001', 'Classique', 'https://static.oei.global/store/business-card-templates/classic.png')
ON CONFLICT (id) DO NOTHING;

INSERT INTO business_card_template (id, name, preview_url)
VALUES ('00000000-7e57-5000-8000-000000000002', 'Moderne', 'https://static.oei.global/store/business-card-templates/modern.png')
ON CONFLICT (id) DO NOTHING;
