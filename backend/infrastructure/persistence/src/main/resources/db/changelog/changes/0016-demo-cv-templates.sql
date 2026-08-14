-- Same 2 templates as the frontend's cv-mock.adapter.ts DEMO_TEMPLATES constant, so
-- demo data stays coherent front/back.

INSERT INTO cv_template (id, code, name) VALUES ('tpl-classic', 'CLASSIC', 'Classique') ON CONFLICT (id) DO NOTHING;
INSERT INTO cv_template (id, code, name) VALUES ('tpl-modern', 'MODERN', 'Moderne') ON CONFLICT (id) DO NOTHING;
