-- Expands network_topic to full front/back parity with network-graph-mock.adapter.ts's
-- TOPICS taxonomy (46 topics total: the 18 from 0008 + 28 added here across the same 9
-- domains), closing the TODO left in 0008-demo-network-graph.sql. Idempotent via
-- ON CONFLICT DO NOTHING.

INSERT INTO network_topic (id, domain_id, label, x, y, related_topic_ids) VALUES ('ia-t3', 'ia', 'Deep Learning', -256, -372, '') ON CONFLICT (id) DO NOTHING;
INSERT INTO network_topic (id, domain_id, label, x, y, related_topic_ids) VALUES ('ia-t4', 'ia', 'Traitement du Langage Naturel', -348, -618, '') ON CONFLICT (id) DO NOTHING;
INSERT INTO network_topic (id, domain_id, label, x, y, related_topic_ids) VALUES ('ia-t5', 'ia', 'MLOps', -139, -855, '') ON CONFLICT (id) DO NOTHING;
INSERT INTO network_topic (id, domain_id, label, x, y, related_topic_ids) VALUES ('ia-t6', 'ia', 'Vision par Ordinateur', 96, -668, '') ON CONFLICT (id) DO NOTHING;
INSERT INTO network_topic (id, domain_id, label, x, y, related_topic_ids) VALUES ('cyber-t3', 'cyber', 'Détection & SOC', -996, -172, '') ON CONFLICT (id) DO NOTHING;
INSERT INTO network_topic (id, domain_id, label, x, y, related_topic_ids) VALUES ('cyber-t4', 'cyber', 'Cryptographie', -1088, -418, '') ON CONFLICT (id) DO NOTHING;
INSERT INTO network_topic (id, domain_id, label, x, y, related_topic_ids) VALUES ('cyber-t5', 'cyber', 'Identité & Accès', -879, -655, '') ON CONFLICT (id) DO NOTHING;
INSERT INTO network_topic (id, domain_id, label, x, y, related_topic_ids) VALUES ('cyber-t6', 'cyber', 'Sécurité Cloud', -644, -468, '') ON CONFLICT (id) DO NOTHING;
INSERT INTO network_topic (id, domain_id, label, x, y, related_topic_ids) VALUES ('cloud-t3', 'cloud', 'AWS', 484, -172, '') ON CONFLICT (id) DO NOTHING;
INSERT INTO network_topic (id, domain_id, label, x, y, related_topic_ids) VALUES ('cloud-t4', 'cloud', 'Azure', 392, -418, '') ON CONFLICT (id) DO NOTHING;
INSERT INTO network_topic (id, domain_id, label, x, y, related_topic_ids) VALUES ('cloud-t5', 'cloud', 'GCP', 601, -655, '') ON CONFLICT (id) DO NOTHING;
INSERT INTO network_topic (id, domain_id, label, x, y, related_topic_ids) VALUES ('cloud-t6', 'cloud', 'Platform Engineering', 836, -468, '') ON CONFLICT (id) DO NOTHING;
INSERT INTO network_topic (id, domain_id, label, x, y, related_topic_ids) VALUES ('soft-t3', 'soft', 'Java', -516, 188, '') ON CONFLICT (id) DO NOTHING;
INSERT INTO network_topic (id, domain_id, label, x, y, related_topic_ids) VALUES ('soft-t4', 'soft', 'Microservices', -608, -58, '') ON CONFLICT (id) DO NOTHING;
INSERT INTO network_topic (id, domain_id, label, x, y, related_topic_ids) VALUES ('soft-t5', 'soft', 'Angular', -399, -295, '') ON CONFLICT (id) DO NOTHING;
INSERT INTO network_topic (id, domain_id, label, x, y, related_topic_ids) VALUES ('soft-t6', 'soft', 'Qualité & Tests', -164, -108, '') ON CONFLICT (id) DO NOTHING;
INSERT INTO network_topic (id, domain_id, label, x, y, related_topic_ids) VALUES ('data-t3', 'data', 'Data Science', 219, 223, '') ON CONFLICT (id) DO NOTHING;
INSERT INTO network_topic (id, domain_id, label, x, y, related_topic_ids) VALUES ('data-t4', 'data', 'BI & Analytics', 281, -76, '') ON CONFLICT (id) DO NOTHING;
INSERT INTO network_topic (id, domain_id, label, x, y, related_topic_ids) VALUES ('data-t5', 'data', 'Data Mesh', 650, -108, '') ON CONFLICT (id) DO NOTHING;
INSERT INTO network_topic (id, domain_id, label, x, y, related_topic_ids) VALUES ('archi-t3', 'archi', 'TOGAF & Cadres', -1121, 303, '') ON CONFLICT (id) DO NOTHING;
INSERT INTO network_topic (id, domain_id, label, x, y, related_topic_ids) VALUES ('archi-t4', 'archi', 'Intégration SI', -1059, 4, '') ON CONFLICT (id) DO NOTHING;
INSERT INTO network_topic (id, domain_id, label, x, y, related_topic_ids) VALUES ('archi-t5', 'archi', 'Résilience', -690, -28, '') ON CONFLICT (id) DO NOTHING;
INSERT INTO network_topic (id, domain_id, label, x, y, related_topic_ids) VALUES ('green-t3', 'green', 'Mesure Carbone', 784, -39, '') ON CONFLICT (id) DO NOTHING;
INSERT INTO network_topic (id, domain_id, label, x, y, related_topic_ids) VALUES ('green-t4', 'green', 'Achats Responsables', 1098, -228, '') ON CONFLICT (id) DO NOTHING;
INSERT INTO network_topic (id, domain_id, label, x, y, related_topic_ids) VALUES ('crit-t3', 'crit', 'Systèmes Financiers', -36, 361, '') ON CONFLICT (id) DO NOTHING;
INSERT INTO network_topic (id, domain_id, label, x, y, related_topic_ids) VALUES ('crit-t4', 'crit', 'Embarqué', 278, 172, '') ON CONFLICT (id) DO NOTHING;
INSERT INTO network_topic (id, domain_id, label, x, y, related_topic_ids) VALUES ('priv-t3', 'priv', 'Audit & Conformité', -656, 441, '') ON CONFLICT (id) DO NOTHING;
INSERT INTO network_topic (id, domain_id, label, x, y, related_topic_ids) VALUES ('priv-t4', 'priv', 'Éthique du Numérique', -342, 252, '') ON CONFLICT (id) DO NOTHING;

-- 28 new topics inserted above (46 total with the 18 from 0008).
