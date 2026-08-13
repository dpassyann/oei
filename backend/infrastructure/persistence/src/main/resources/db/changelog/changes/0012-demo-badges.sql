-- Same 5 badges as network-graph-mock.adapter.ts's BADGES constant.

INSERT INTO badge (id, code, name, description, category) VALUES ('badge-mentor', 'MENTOR_OEI', 'Mentor OEI', 'Mentor OEI', 'RECOGNITION') ON CONFLICT (id) DO NOTHING;
INSERT INTO badge (id, code, name, description, category) VALUES ('badge-conferencier', 'CONFERENCIER', 'Conférencier', 'Conférencier', 'CONTRIBUTION') ON CONFLICT (id) DO NOTHING;
INSERT INTO badge (id, code, name, description, category) VALUES ('badge-publication-2026', 'PUBLICATION_2026', 'Publication 2026', 'Publication 2026', 'CONTRIBUTION') ON CONFLICT (id) DO NOTHING;
INSERT INTO badge (id, code, name, description, category) VALUES ('badge-jury-certification', 'JURY_CERTIFICATION', 'Jury de certification', 'Jury de certification', 'CERTIFICATION') ON CONFLICT (id) DO NOTHING;
INSERT INTO badge (id, code, name, description, category) VALUES ('badge-contributeur-oss', 'CONTRIBUTEUR_OPEN_SOURCE', 'Contributeur Open Source', 'Contributeur Open Source', 'CONTRIBUTION') ON CONFLICT (id) DO NOTHING;

INSERT INTO badge_award (id, badge_id, member_id, awarded_at, source, revoked) VALUES ('c278e288-2c65-5796-b2c8-8a5b41f0fa64', 'badge-mentor', 'f267e070-2fd5-5f83-a48b-9a733db64489', now(), 'MANUAL', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO badge_award (id, badge_id, member_id, awarded_at, source, revoked) VALUES ('f92a9d5f-425d-5293-9613-27732506a832', 'badge-mentor', '9f11c1bd-c56a-5c93-9e02-5e00b953eec2', now(), 'MANUAL', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO badge_award (id, badge_id, member_id, awarded_at, source, revoked) VALUES ('97bc52f7-459a-5a8f-9b12-d1c1dcc4a370', 'badge-mentor', '40086390-4a54-5c3d-b488-e3cc499eca0c', now(), 'MANUAL', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO badge_award (id, badge_id, member_id, awarded_at, source, revoked) VALUES ('cb3dd92b-4eb1-5323-bcb4-579f84c5317c', 'badge-mentor', 'fa7ef005-7495-5032-b0b8-ef9a85d1f2fd', now(), 'MANUAL', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO badge_award (id, badge_id, member_id, awarded_at, source, revoked) VALUES ('f122a2c3-19e1-5e73-b493-3197534e7efd', 'badge-conferencier', 'fad855e3-fb3a-5e7b-b1c2-3a49e5715fd1', now(), 'MANUAL', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO badge_award (id, badge_id, member_id, awarded_at, source, revoked) VALUES ('9431cc10-bb94-5c85-bb57-80d074ac1f0d', 'badge-conferencier', '54d7151c-7446-5ca4-98fd-61e72a88cf2e', now(), 'MANUAL', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO badge_award (id, badge_id, member_id, awarded_at, source, revoked) VALUES ('5418fa29-6ddd-52e9-a53d-e5c098187b92', 'badge-conferencier', 'e49ce0b8-7c44-584d-a22e-1079429b5bca', now(), 'MANUAL', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO badge_award (id, badge_id, member_id, awarded_at, source, revoked) VALUES ('e35d0936-b3a2-58d4-8804-afe6f98187dd', 'badge-conferencier', '344f3336-c8c4-52ec-b795-8c342cc8a657', now(), 'MANUAL', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO badge_award (id, badge_id, member_id, awarded_at, source, revoked) VALUES ('c5d4318f-f53c-5a15-897c-6597e128c4d8', 'badge-publication-2026', '87434f2c-c869-51b3-b1b9-c99aea6ed019', now(), 'MANUAL', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO badge_award (id, badge_id, member_id, awarded_at, source, revoked) VALUES ('1df62664-6cfb-5a46-8cc2-fd939765e37e', 'badge-publication-2026', '8aa2b654-607b-58f4-bef8-2cce8346c738', now(), 'MANUAL', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO badge_award (id, badge_id, member_id, awarded_at, source, revoked) VALUES ('6c418a93-4886-511b-89ea-5b57ffa5c6dc', 'badge-publication-2026', 'c8799e3b-a742-5a17-9bcd-a1a976d10ee7', now(), 'MANUAL', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO badge_award (id, badge_id, member_id, awarded_at, source, revoked) VALUES ('33643be3-3f89-5dd5-b46c-d2fac13facb7', 'badge-publication-2026', '3815809b-612c-5313-b574-c7210670269c', now(), 'MANUAL', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO badge_award (id, badge_id, member_id, awarded_at, source, revoked) VALUES ('39a3583e-2baf-555d-aff9-671747510530', 'badge-jury-certification', '0fb33650-7c80-5749-bd5e-4571bef16e8d', now(), 'MANUAL', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO badge_award (id, badge_id, member_id, awarded_at, source, revoked) VALUES ('1f459c9f-533a-515a-83de-bb62451f99be', 'badge-jury-certification', 'ae6eb96a-9d64-51c7-afc4-1c76144ca413', now(), 'MANUAL', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO badge_award (id, badge_id, member_id, awarded_at, source, revoked) VALUES ('10ce0602-64fc-55f9-a37c-1040db72e912', 'badge-jury-certification', '1b859c60-768b-5133-a194-4c32a392fe01', now(), 'MANUAL', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO badge_award (id, badge_id, member_id, awarded_at, source, revoked) VALUES ('98882d0c-5855-53fc-b6e4-758a7aaa5aac', 'badge-jury-certification', 'f3b43d76-3b9a-5757-ab3a-e37fe54aca8d', now(), 'MANUAL', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO badge_award (id, badge_id, member_id, awarded_at, source, revoked) VALUES ('ca2f7da7-9af7-5f3b-9c1c-da2c35ebdd74', 'badge-contributeur-oss', '13d01512-03d0-58e7-8027-eae9ee7fda8b', now(), 'MANUAL', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO badge_award (id, badge_id, member_id, awarded_at, source, revoked) VALUES ('96bf15e9-01ee-5fb3-807c-05f56abb5cdf', 'badge-contributeur-oss', '331d19cf-d14e-5e14-bedf-61b4fa51f5ff', now(), 'MANUAL', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO badge_award (id, badge_id, member_id, awarded_at, source, revoked) VALUES ('7ac7496e-34b1-5cf9-921e-6ec268f7cba8', 'badge-contributeur-oss', '345b1966-5b07-531b-b594-c0a07705163c', now(), 'MANUAL', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO badge_award (id, badge_id, member_id, awarded_at, source, revoked) VALUES ('c97984da-9ba1-5182-9fce-09fef6d7a134', 'badge-contributeur-oss', 'f9bcb757-484f-5e45-bcef-5b4417b640ac', now(), 'MANUAL', false) ON CONFLICT (id) DO NOTHING;

-- 5 badges, 20 awards inserted above.
