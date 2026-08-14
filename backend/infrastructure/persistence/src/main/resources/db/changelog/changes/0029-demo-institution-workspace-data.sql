-- Same shapes as the frontend's institution-demo-data.ts (DEMO_INVITATIONS,
-- DEMO_AFFILIATIONS, DEMO_PUBLICATIONS, DEMO_OPPORTUNITIES, DEMO_BADGE_PROPOSALS,
-- DEMO_AUDIT_LOG), reusing real 0004 demo members instead of synthetic ids.

INSERT INTO institution_invitation (id, institution_id, email, role, status, invited_by, invited_at, expires_at)
VALUES ('88cb08f6-d471-5e52-8f2d-bf43e38ba5b0', '27af46da-8426-55c1-b2fb-aa3814e0d1bc', 'nouvelle.recrue@oei-demo-institution.org',
        'CONTRIBUTOR', 'PENDING', '7ba40945-29ce-5fd0-9b85-2d8c4db75895', '2026-02-01T09:00:00Z', '2026-02-15T09:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- David Garcia: accepted affiliation. Elena Meier: pending request.
INSERT INTO employment_affiliation (id, member_id, institution_id, verification_method, status, requested_at, started_at, decided_at, decided_by)
VALUES ('aea7c404-7aa3-57bf-b7a9-501e7c45ca1b', '9f11c1bd-c56a-5c93-9e02-5e00b953eec2', '27af46da-8426-55c1-b2fb-aa3814e0d1bc',
        'INSTITUTION_VALIDATION', 'ACCEPTED', '2026-01-10T09:00:00Z', '2026-01-11T09:00:00Z', '2026-01-11T09:00:00Z', 'e34694b7-7a44-5f45-8b74-ac3b0929a3aa')
ON CONFLICT (id) DO NOTHING;
INSERT INTO employment_affiliation (id, member_id, institution_id, verification_method, status, requested_at)
VALUES ('784f4e86-fa63-59e6-84b5-b944a24cb82e', '3cc8dcc6-ee52-5463-97ec-62b1adf7dff4', '27af46da-8426-55c1-b2fb-aa3814e0d1bc',
        'INSTITUTION_VALIDATION', 'PENDING', '2026-02-01T09:00:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO institution_publication (id, institution_id, type, title, body, status, author_member_id, submitted_at, published_at)
VALUES ('a9fdc7e0-1067-5e6f-926a-b019b2812c48', '27af46da-8426-55c1-b2fb-aa3814e0d1bc', 'EXPERIENCE_REPORT',
        'Retour d''expérience : migration cloud (démonstration)', 'Contenu de démonstration décrivant un retour d''expérience fictif.',
        'PUBLISHED', '7ba40945-29ce-5fd0-9b85-2d8c4db75895', '2026-01-15T09:00:00Z', '2026-01-20T09:00:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO institution_publication (id, institution_id, type, title, body, status, author_member_id)
VALUES ('b3acc3d2-ba16-5a0f-9f9a-4943f8814df9', '27af46da-8426-55c1-b2fb-aa3814e0d1bc', 'STUDY',
        'Étude sur la gouvernance des données (démonstration)', 'Brouillon de démonstration en cours de rédaction.',
        'DRAFT', '7ba40945-29ce-5fd0-9b85-2d8c4db75895')
ON CONFLICT (id) DO NOTHING;

INSERT INTO institution_opportunity (id, institution_id, type, title, description, expires_at, status, published_at)
VALUES ('9ca3c18a-b3d6-5c9e-990b-f43ca798c055', '27af46da-8426-55c1-b2fb-aa3814e0d1bc', 'MENTORING',
        'Programme de mentorat démonstration', 'Opportunité de démonstration proposant du mentorat à des membres affiliés.',
        '2026-06-30T00:00:00Z', 'PUBLISHED', '2026-02-01T09:00:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO institution_badge_proposal (id, institution_id, member_id, proposed_badge_code, justification, status)
VALUES ('ab8bea72-ecad-5ac6-ba47-5b32c9be74a7', '27af46da-8426-55c1-b2fb-aa3814e0d1bc', '9f11c1bd-c56a-5c93-9e02-5e00b953eec2',
        'internal-mentoring-2026', 'A encadré le programme de mentorat interne (démonstration).', 'PENDING')
ON CONFLICT (id) DO NOTHING;

INSERT INTO institution_audit_log (id, institution_id, actor_id, action, target_type, target_id, occurred_at)
VALUES ('b5b6e08a-dbf1-5487-b76a-91c0c0634abc', '27af46da-8426-55c1-b2fb-aa3814e0d1bc', 'e34694b7-7a44-5f45-8b74-ac3b0929a3aa',
        'AFFILIATION_APPROVED', 'EmploymentAffiliation', 'aea7c404-7aa3-57bf-b7a9-501e7c45ca1b', '2026-01-11T09:00:00Z')
ON CONFLICT (id) DO NOTHING;
