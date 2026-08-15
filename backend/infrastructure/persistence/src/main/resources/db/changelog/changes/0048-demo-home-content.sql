-- Demo/seed content for the public home page (legacy, unversioned surface -- home-legacy tag).
-- Stats stay at 0 per the getHomeStats operation's OpenAPI summary.
INSERT INTO home_stat (id, lang, label, value, display_order)
VALUES ('b1000000-0000-5000-8000-000000000001', 'fr', 'Membres', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO home_stat (id, lang, label, value, display_order)
VALUES ('b1000000-0000-5000-8000-000000000002', 'fr', 'Certifications reconnues', 0, 2)
ON CONFLICT (id) DO NOTHING;
INSERT INTO home_stat (id, lang, label, value, display_order)
VALUES ('b1000000-0000-5000-8000-000000000003', 'fr', 'Institutions partenaires', 0, 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO home_stat (id, lang, label, value, display_order)
VALUES ('b1000000-0000-5000-8000-000000000004', 'en', 'Members', 0, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO home_stat (id, lang, label, value, display_order)
VALUES ('b1000000-0000-5000-8000-000000000005', 'en', 'Recognized certifications', 0, 2)
ON CONFLICT (id) DO NOTHING;
INSERT INTO home_stat (id, lang, label, value, display_order)
VALUES ('b1000000-0000-5000-8000-000000000006', 'en', 'Partner institutions', 0, 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO home_domain_area (id, lang, icon, title, description, display_order)
VALUES ('b2000000-0000-5000-8000-000000000001', 'fr', 'shield-check', 'Ethique et gouvernance',
        'Cadre deontologique et bonnes pratiques de gouvernance pour les professionnels de l''IA.', 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO home_domain_area (id, lang, icon, title, description, display_order)
VALUES ('b2000000-0000-5000-8000-000000000002', 'fr', 'certificate', 'Certification professionnelle',
        'Reconnaissance des competences et certifications des experts en IA.', 2)
ON CONFLICT (id) DO NOTHING;
INSERT INTO home_domain_area (id, lang, icon, title, description, display_order)
VALUES ('b2000000-0000-5000-8000-000000000003', 'en', 'shield-check', 'Ethics and governance',
        'Ethical framework and governance best practices for AI professionals.', 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO home_domain_area (id, lang, icon, title, description, display_order)
VALUES ('b2000000-0000-5000-8000-000000000004', 'en', 'certificate', 'Professional certification',
        'Recognition of skills and certifications for AI experts.', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO home_news_item (id, lang, title, excerpt, image_url, path, category, published_at)
VALUES ('b3000000-0000-5000-8000-000000000001', 'fr', 'Lancement de l''OEI',
        'L''Observatoire de l''Ethique en Intelligence Artificielle ouvre ses portes.',
        'https://mock-media.oei.local/news/launch.jpg', '/actualites/lancement-oei', 'communique', CURRENT_DATE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO home_news_item (id, lang, title, excerpt, image_url, path, category, published_at)
VALUES ('b3000000-0000-5000-8000-000000000002', 'en', 'OEI launch',
        'The Observatory of Ethics in Artificial Intelligence opens its doors.',
        'https://mock-media.oei.local/news/launch.jpg', '/en/news/oei-launch', 'communique', CURRENT_DATE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO home_partner (id, lang, name, logo_url, description, website_url, category)
VALUES ('b4000000-0000-5000-8000-000000000001', 'fr', 'Partenaire demonstration',
        'https://mock-media.oei.local/partners/demo-logo.png',
        'Partenariat de demonstration en attente de confirmation reelle.', 'https://example.org', 'academique')
ON CONFLICT (id) DO NOTHING;
INSERT INTO home_partner (id, lang, name, logo_url, description, website_url, category)
VALUES ('b4000000-0000-5000-8000-000000000002', 'en', 'Demo partner',
        'https://mock-media.oei.local/partners/demo-logo.png',
        'Demonstration partnership pending real confirmation.', 'https://example.org', 'academic')
ON CONFLICT (id) DO NOTHING;
