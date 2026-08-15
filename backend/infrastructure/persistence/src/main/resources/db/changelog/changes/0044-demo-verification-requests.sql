-- Demo verification requests reusing real 0004 demo members, various statuses.
INSERT INTO verification_request (id, member_id, type, reference_id, status, submitted_at, reviewed_at, reviewer_id)
VALUES ('a1b2c3d4-0000-5000-8000-000000000001', 'f267e070-2fd5-5f83-a48b-9a733db64489', 'IDENTITY', NULL, 'PENDING', now() - interval '2 days', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO verification_request (id, member_id, type, reference_id, status, submitted_at, reviewed_at, reviewer_id)
VALUES ('a1b2c3d4-0000-5000-8000-000000000002', '7ba40945-29ce-5fd0-9b85-2d8c4db75895', 'PROFILE', NULL, 'APPROVED', now() - interval '10 days', now() - interval '8 days', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO NOTHING;

INSERT INTO verification_request (id, member_id, type, reference_id, status, submitted_at, reviewed_at, reviewer_id)
VALUES ('a1b2c3d4-0000-5000-8000-000000000003', 'e34694b7-7a44-5f45-8b74-ac3b0929a3aa', 'CERTIFICATION', 'aws-csa-associate', 'REJECTED', now() - interval '20 days', now() - interval '18 days', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO NOTHING;

INSERT INTO verification_request (id, member_id, type, reference_id, status, submitted_at, reviewed_at, reviewer_id)
VALUES ('a1b2c3d4-0000-5000-8000-000000000004', '9f11c1bd-c56a-5c93-9e02-5e00b953eec2', 'IDENTITY', NULL, 'PENDING', now() - interval '1 days', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
