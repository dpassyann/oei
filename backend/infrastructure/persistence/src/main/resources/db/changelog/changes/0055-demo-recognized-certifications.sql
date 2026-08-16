INSERT INTO recognized_certification (id, name, issuing_organization, catalog_reference, auto_validate, domain, level, language, oei_status, competencies_json, validity_months, associated_path_route, description, catalog_status)
VALUES ('00000000-0000-0000-0000-0000000000c1', 'AWS Certified Solutions Architect', 'Amazon Web Services', 'AWS-SAA-C03', true, 'Cloud & infrastructure', 'ARCHITECT', 'en', 'OEI_RECOGNIZED', '["Architecture cloud","Résilience et haute disponibilité","Sécurité des workloads cloud"]', 36, NULL, 'Certification cloud de référence pour la conception d''architectures résilientes sur AWS.', 'PUBLISHED')
ON CONFLICT (id) DO NOTHING;

INSERT INTO recognized_certification (id, name, issuing_organization, catalog_reference, auto_validate, domain, level, language, oei_status, competencies_json, validity_months, associated_path_route, description, catalog_status)
VALUES ('00000000-0000-0000-0000-0000000000c2', 'Microsoft Certified: Azure Administrator Associate', 'Microsoft', 'AZ-104', true, 'Cloud & infrastructure', 'ENGINEER', 'en', 'OEI_RECOGNIZED', '["Cloud","Administration"]', 24, NULL, 'Administration des ressources Azure (identités, stockage, réseau, calcul).', 'PUBLISHED')
ON CONFLICT (id) DO NOTHING;

INSERT INTO recognized_certification (id, name, issuing_organization, catalog_reference, auto_validate, domain, level, language, oei_status, competencies_json, validity_months, associated_path_route, description, catalog_status)
VALUES ('00000000-0000-0000-0000-0000000000c3', 'Certified Kubernetes Administrator (CKA)', 'Linux Foundation', 'CKA', false, 'Cloud & infrastructure', 'ENGINEER', 'en', 'OEI_RECOGNIZED', '["Kubernetes","Orchestration"]', 36, NULL, 'Administration d''un cluster Kubernetes en conditions réelles (examen pratique).', 'PUBLISHED')
ON CONFLICT (id) DO NOTHING;

INSERT INTO recognized_certification (id, name, issuing_organization, catalog_reference, auto_validate, domain, level, language, oei_status, competencies_json, validity_months, associated_path_route, description, catalog_status)
VALUES ('00000000-0000-0000-0000-0000000000c4', 'Certified Information Systems Security Professional (CISSP)', 'ISC2', 'CISSP', false, 'Cybersécurité', 'EXPERT', 'en', 'OEI_RECOGNIZED', '["Sécurité des systèmes d''information","Gestion des risques cyber","Cryptographie"]', 36, NULL, 'Référence en gouvernance et gestion des risques de sécurité de l''information.', 'PUBLISHED')
ON CONFLICT (id) DO NOTHING;

INSERT INTO recognized_certification (id, name, issuing_organization, catalog_reference, auto_validate, domain, level, language, oei_status, competencies_json, validity_months, associated_path_route, description, catalog_status)
VALUES ('00000000-0000-0000-0000-0000000000c5', 'PMP', 'PMI', 'PMP', false, 'Gouvernance & management de projet', 'ENGINEER', 'en', 'PARTNER_RECOGNIZED', '["Pilotage de projet","Gestion des risques","Gouvernance de portefeuille"]', 36, NULL, 'Certification de référence en gestion de projet, reconnue par un partenaire OEI.', 'PUBLISHED')
ON CONFLICT (id) DO NOTHING;

INSERT INTO recognized_certification (id, name, issuing_organization, catalog_reference, auto_validate, domain, level, language, oei_status, competencies_json, validity_months, associated_path_route, description, catalog_status)
VALUES ('00000000-0000-0000-0000-0000000000c6', 'TensorFlow Developer Certificate', 'Google', NULL, false, 'Intelligence artificielle', 'PRACTITIONER', 'en', 'UNDER_REVIEW', '["Apprentissage automatique","Réseaux de neurones","Déploiement de modèles"]', NULL, NULL, 'Compétences pratiques en développement de modèles TensorFlow, en cours de revue par OEI.', 'PUBLISHED')
ON CONFLICT (id) DO NOTHING;

INSERT INTO recognized_certification (id, name, issuing_organization, catalog_reference, auto_validate, domain, level, language, oei_status, competencies_json, validity_months, associated_path_route, description, catalog_status)
VALUES ('00000000-0000-0000-0000-0000000000c7', 'Certification Data Protection Officer (DPO)', 'CNIL', NULL, false, 'Protection des données', 'ENGINEER', 'fr', 'OEI_RECOGNIZED', '["RGPD","Analyse d''impact","Conformité réglementaire"]', 24, NULL, 'Compétences de délégué à la protection des données au sens du RGPD.', 'PUBLISHED')
ON CONFLICT (id) DO NOTHING;
