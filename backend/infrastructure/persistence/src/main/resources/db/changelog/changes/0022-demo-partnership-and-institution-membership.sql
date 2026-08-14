-- Same demo partnership/team roles as the frontend's institution-demo-data.ts
-- DEMO_PARTNERSHIP/DEMO_MEMBERSHIPS, reusing real demo members (0004) as the
-- institution's team -- no synthetic identity duplication.

INSERT INTO partnership (institution_id, level, verified, started_at, ends_at)
VALUES ('27af46da-8426-55c1-b2fb-aa3814e0d1bc', 'SILVER', true, '2026-01-05T09:00:00Z', NULL)
ON CONFLICT (institution_id) DO NOTHING;

-- Alice Nguyen = OWNER, Baptiste Dupont = ADMIN, Camille Moreau = AFFILIATION_VALIDATOR.
INSERT INTO institution_membership (member_id, institution_id, role, granted_at, granted_by)
VALUES ('f267e070-2fd5-5f83-a48b-9a733db64489', '27af46da-8426-55c1-b2fb-aa3814e0d1bc', 'OWNER', '2026-01-05T09:00:00Z', 'f267e070-2fd5-5f83-a48b-9a733db64489')
ON CONFLICT (member_id, institution_id) DO NOTHING;
INSERT INTO institution_membership (member_id, institution_id, role, granted_at, granted_by)
VALUES ('7ba40945-29ce-5fd0-9b85-2d8c4db75895', '27af46da-8426-55c1-b2fb-aa3814e0d1bc', 'ADMIN', '2026-01-06T09:00:00Z', 'f267e070-2fd5-5f83-a48b-9a733db64489')
ON CONFLICT (member_id, institution_id) DO NOTHING;
INSERT INTO institution_membership (member_id, institution_id, role, granted_at, granted_by)
VALUES ('e34694b7-7a44-5f45-8b74-ac3b0929a3aa', '27af46da-8426-55c1-b2fb-aa3814e0d1bc', 'AFFILIATION_VALIDATOR', '2026-01-07T09:00:00Z', 'f267e070-2fd5-5f83-a48b-9a733db64489')
ON CONFLICT (member_id, institution_id) DO NOTHING;
