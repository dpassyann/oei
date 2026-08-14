-- Same 2 events (ids/slugs) as the frontend's event-mock.adapter.ts seed data
-- (colloque-ethique-ia-2026, meetup-informatique-verte-lyon), reusing real 0004 demo
-- members as attendees/authors -- no synthetic identity duplication. Fixed near-future
-- dates rather than "days from now" (SQL seed data cannot be dynamically dated).

INSERT INTO event (id, slug, title, type, description, image_url, location_country, location_city, location_venue,
                    start_at, end_at, timezone, capacity, registrations_count, visibility, organizers_json, languages_json,
                    speakers_json, status)
VALUES ('a1818689-870a-52e8-9131-99ba531a3ef1', 'colloque-ethique-ia-2026',
        '[Démonstration] Colloque annuel : Éthique et IA en entreprise', 'COLLOQUE',
        'Colloque de démonstration rassemblant experts et institutions autour des enjeux éthiques de l''intelligence artificielle en entreprise.',
        '/assets/news/appel-contribution.svg', 'FR', 'Paris', 'Maison des Associations, 12 rue de la République',
        '2026-09-15T09:00:00Z', '2026-09-15T18:00:00Z', 'Europe/Paris', 150, 2, 'PUBLIC',
        '["Ordre International des Experts de l''Informatique"]', '["fr","en"]',
        '[{"name":"Dr. Amina Traoré","role":"Présidente, comité d''éthique OEI"},{"name":"Marc Lefèvre","role":"DPO, groupe bancaire"}]',
        'REGISTRATION_OPEN')
ON CONFLICT (id) DO NOTHING;

INSERT INTO event (id, slug, title, type, description, location_country, location_city, location_venue,
                    start_at, end_at, timezone, capacity, registrations_count, visibility, organizers_json, languages_json, status)
VALUES ('c52397ce-b812-5caf-817e-42c361332857', 'meetup-informatique-verte-lyon',
        '[Démonstration] Meetup : Informatique verte à Lyon', 'MEETUP',
        'Rencontre informelle de démonstration entre membres autour de l''écoconception logicielle et des retours de terrain.',
        'FR', 'Lyon', 'Tiers-lieu La Ruche, 8 quai Rambaud', '2026-08-25T18:00:00Z', '2026-08-25T21:00:00Z', 'Europe/Paris',
        40, 1, 'MEMBERS', '["Antenne Lyon"]', '["fr"]', 'PUBLISHED')
ON CONFLICT (id) DO NOTHING;

-- Registrations: Alice + Baptiste to the colloque, David to the meetup.
INSERT INTO event_registration (id, event_id, member_id, registered_at)
VALUES ('21ac78ac-9686-5e49-a92b-6425f12c8f26', 'a1818689-870a-52e8-9131-99ba531a3ef1', 'f267e070-2fd5-5f83-a48b-9a733db64489', '2026-08-01T10:00:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO event_registration (id, event_id, member_id, registered_at)
VALUES ('0b3bdb8c-9a45-5639-9bf1-4368d2675be0', 'a1818689-870a-52e8-9131-99ba531a3ef1', '7ba40945-29ce-5fd0-9b85-2d8c4db75895', '2026-08-02T10:00:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO event_registration (id, event_id, member_id, registered_at)
VALUES ('79d7a100-c471-5224-8a9a-ed0eba678d0b', 'c52397ce-b812-5caf-817e-42c361332857', '9f11c1bd-c56a-5c93-9e02-5e00b953eec2', '2026-08-10T10:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- One live-feed post (Alice) with one comment (Baptiste), on the meetup (already started per demo clock).
INSERT INTO event_post (id, event_id, author_id, author_name, text, created_at, liked_by_json)
VALUES ('1e73b9df-9dfa-53de-ad72-e331c3c17544', 'c52397ce-b812-5caf-817e-42c361332857', 'f267e070-2fd5-5f83-a48b-9a733db64489',
        'Alice Nguyen', 'Ravie de retrouver la communauté OEI à Lyon ce soir !', '2026-08-25T18:15:00Z',
        '["7ba40945-29ce-5fd0-9b85-2d8c4db75895"]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO event_comment (id, event_id, post_id, author_id, author_name, text, created_at, status)
VALUES ('d7e18006-16f8-50e6-aea4-43aa6eb6c4b1', 'c52397ce-b812-5caf-817e-42c361332857', '1e73b9df-9dfa-53de-ad72-e331c3c17544',
        '7ba40945-29ce-5fd0-9b85-2d8c4db75895', 'Baptiste Dupont', 'Pareil, hâte d''échanger sur l''écoconception !',
        '2026-08-25T18:20:00Z', 'VISIBLE')
ON CONFLICT (id) DO NOTHING;

-- One event proposal awaiting moderation (Camille Moreau).
INSERT INTO event_proposal (id, author_id, title, description, type, start_at, end_at, timezone, country, city, venue, status,
                             submitted_at, ai_precheck_passed, ai_precheck_summary, ai_precheck_checked_at)
VALUES ('99082665-f888-5921-bd33-1bb39a41ffb8', 'e34694b7-7a44-5f45-8b74-ac3b0929a3aa',
        '[Démonstration] Atelier : Gouvernance des données de santé',
        'Atelier de démonstration proposé par un membre, en attente de modération.', 'WORKSHOP', '2026-11-10T09:00:00Z',
        '2026-11-10T12:00:00Z', 'Europe/Brussels', 'BE', 'Bruxelles', 'Espace membre OEI Belgique', 'MODERATOR_REVIEW',
        '2026-08-05T09:00:00Z', true, 'Précheck automatique non bloquant.', '2026-08-05T09:00:00Z')
ON CONFLICT (id) DO NOTHING;
