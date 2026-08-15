-- ============================================
-- Seed data — Données de démo réalistes
-- ============================================
DO $$
DECLARE
  agent1_id UUID;
  agent2_id UUID;
  agent3_id UUID;
  prop1_id UUID;
  prop2_id UUID;
  prop3_id UUID;
  prop4_id UUID;
  prop5_id UUID;
  prop6_id UUID;
  prop7_id UUID;
  prop8_id UUID;
  prop9_id UUID;
  prop10_id UUID;
BEGIN

-- Agents
INSERT INTO agents (first_name, last_name, email, phone, bio, is_active)
VALUES ('Sophie', 'Martin', 'sophie.martin@agence-demo.fr', '06 12 34 56 78', 'Spécialiste du marché parisien depuis 12 ans. Sophie accompagne ses clients avec rigueur et bienveillance dans tous leurs projets immobiliers.', true)
RETURNING id INTO agent1_id;

INSERT INTO agents (first_name, last_name, email, phone, bio, is_active)
VALUES ('Thomas', 'Dubois', 'thomas.dubois@agence-demo.fr', '06 98 76 54 32', 'Expert en immobilier de prestige, Thomas met son expérience de 8 ans au service de ses clients pour dénicher les biens d''exception.', true)
RETURNING id INTO agent2_id;

INSERT INTO agents (first_name, last_name, email, phone, bio, is_active)
VALUES ('Claire', 'Lefèvre', 'claire.lefevre@agence-demo.fr', '06 55 44 33 22', 'Passionnée par l''architecture et l''urbanisme, Claire conseille ses clients avec expertise sur les quartiers en développement.', true)
RETURNING id INTO agent3_id;

-- Properties
INSERT INTO properties (title, slug, description, type, transaction_type, price, surface, rooms, bedrooms, bathrooms, address, city, postal_code, latitude, longitude, energy_rating, ghg_rating, is_featured, is_published, agent_id)
VALUES ('Appartement lumineux avec balcon - Bastille', 'appartement-lumineux-balcon-bastille', 'Magnifique appartement de 65m² situé au 4ème étage avec ascenseur, au cœur du quartier Bastille. Il se compose d''une entrée, d''un séjour lumineux de 25m² donnant sur un balcon filant, d''une cuisine équipée séparée, de deux chambres, d''une salle de bains et de toilettes séparées. Parquet massif, moulures, double vitrage. Cave incluse. Proche métro Bastille (lignes 1, 5, 8) et marché d''Aligre.', 'appartement', 'vente', 520000, 65, 3, 2, 1, '15 rue de la Roquette', 'Paris 11e', '75011', 48.8534, 2.3716, 'C', 'B', true, true, agent1_id)
RETURNING id INTO prop1_id;

INSERT INTO properties (title, slug, description, type, transaction_type, price, surface, rooms, bedrooms, bathrooms, address, city, postal_code, latitude, longitude, energy_rating, ghg_rating, is_featured, is_published, agent_id)
VALUES ('Maison familiale avec jardin - Vincennes', 'maison-familiale-jardin-vincennes', 'Belle maison de ville de 140m² sur 3 niveaux avec jardin privatif de 80m². Au rez-de-chaussée : entrée, vaste séjour double de 40m², cuisine ouverte aménagée et équipée. Au 1er étage : 3 chambres dont une suite parentale avec salle d''eau. Au 2ème : bureau et salle de jeux. Sous-sol aménagé avec buanderie et rangements. Garage. Quartier calme à 5 minutes du RER A et du château de Vincennes.', 'maison', 'vente', 890000, 140, 6, 3, 2, '8 rue de Fontenay', 'Vincennes', '94300', 48.8474, 2.4392, 'D', 'C', true, true, agent2_id)
RETURNING id INTO prop2_id;

INSERT INTO properties (title, slug, description, type, transaction_type, price, surface, rooms, bedrooms, bathrooms, address, city, postal_code, latitude, longitude, energy_rating, ghg_rating, is_featured, is_published, agent_id)
VALUES ('Studio rénové - Quartier Latin', 'studio-renove-quartier-latin', 'Charmant studio entièrement rénové de 28m² au 3ème étage sans ascenseur. Pièce principale lumineuse avec coin cuisine équipée (plaques, frigo, micro-ondes), salle d''eau avec douche à l''italienne. Idéal premier achat ou investissement locatif. Rentabilité estimée à 4,2%. Quartier vivant, proche Panthéon et jardin du Luxembourg. Métro Cardinal Lemoine à 2 minutes.', 'appartement', 'vente', 245000, 28, 1, 0, 1, '22 rue Mouffetard', 'Paris 5e', '75005', 48.8442, 2.3499, 'B', 'A', false, true, agent1_id)
RETURNING id INTO prop3_id;

INSERT INTO properties (title, slug, description, type, transaction_type, price, surface, rooms, bedrooms, bathrooms, address, city, postal_code, latitude, longitude, energy_rating, ghg_rating, is_featured, is_published, agent_id)
VALUES ('T3 avec terrasse panoramique - Boulogne', 't3-terrasse-panoramique-boulogne', 'Superbe T3 de 72m² au dernier étage d''une résidence récente (2019) avec terrasse de 15m² offrant une vue dégagée sur les toits. Séjour de 30m² avec baies vitrées, cuisine américaine haut de gamme, 2 chambres avec placards, salle de bains avec baignoire, WC séparé. Place de parking en sous-sol et cave. Résidence avec gardien, local vélos et espaces verts. Proche métro Marcel Sembat.', 'appartement', 'vente', 615000, 72, 3, 2, 1, '45 avenue du Général Leclerc', 'Boulogne-Billancourt', '92100', 48.8356, 2.2414, 'A', 'A', true, true, agent3_id)
RETURNING id INTO prop4_id;

INSERT INTO properties (title, slug, description, type, transaction_type, price, surface, rooms, bedrooms, bathrooms, address, city, postal_code, latitude, longitude, energy_rating, ghg_rating, is_featured, is_published, agent_id)
VALUES ('Local commercial - Rue de Rivoli', 'local-commercial-rue-rivoli', 'Local commercial de 95m² en rez-de-chaussée avec grande vitrine sur rue. Emplacement premium sur la rue de Rivoli, fort passage piéton. Le local se compose d''une surface de vente de 70m², d''une réserve de 15m² et d''un bureau de 10m². Tous commerces autorisés sauf restauration avec extraction. Bail neuf. Disponible immédiatement.', 'commerce', 'location', 4500, 95, 3, 0, 0, '112 rue de Rivoli', 'Paris 1er', '75001', 48.8606, 2.3376, null, null, false, true, agent2_id)
RETURNING id INTO prop5_id;

INSERT INTO properties (title, slug, description, type, transaction_type, price, surface, rooms, bedrooms, bathrooms, address, city, postal_code, latitude, longitude, energy_rating, ghg_rating, is_featured, is_published, agent_id)
VALUES ('Appartement haussmannien - Saint-Germain', 'appartement-haussmannien-saint-germain', 'Exceptionnel appartement haussmannien de 120m² au 2ème étage avec ascenseur d''un bel immeuble en pierre de taille. Hauts plafonds de 3,20m, parquet en point de Hongrie, cheminées en marbre dans le séjour et la chambre principale. Double séjour de 45m², cuisine séparée aménageable, 3 chambres, salle de bains, salle d''eau. Vue sur cour arborée. Gardien. Cave voûtée.', 'appartement', 'vente', 1450000, 120, 5, 3, 2, '35 rue de Seine', 'Paris 6e', '75006', 48.8555, 2.3375, 'E', 'D', true, true, agent2_id)
RETURNING id INTO prop6_id;

INSERT INTO properties (title, slug, description, type, transaction_type, price, surface, rooms, bedrooms, bathrooms, address, city, postal_code, latitude, longitude, energy_rating, ghg_rating, is_featured, is_published, agent_id)
VALUES ('T2 meublé - Location Levallois', 't2-meuble-location-levallois', 'Appartement T2 meublé de 45m² au 5ème étage avec ascenseur. Séjour lumineux, chambre séparée avec grand placard, cuisine équipée ouverte, salle de bains avec machine à laver. Meublé avec goût : canapé convertible, lit queen size, bureau. Charges comprises : eau froide, chauffage collectif, ordures ménagères. Idéal jeune actif ou couple. Proche métro Louise Michel.', 'appartement', 'location', 1350, 45, 2, 1, 1, '18 rue Aristide Briand', 'Levallois-Perret', '92300', 48.8917, 2.2883, 'C', 'B', false, true, agent3_id)
RETURNING id INTO prop7_id;

INSERT INTO properties (title, slug, description, type, transaction_type, price, surface, rooms, bedrooms, bathrooms, address, city, postal_code, latitude, longitude, energy_rating, ghg_rating, is_featured, is_published, agent_id)
VALUES ('Terrain constructible viabilisé - Meudon', 'terrain-constructible-viabilise-meudon', 'Terrain constructible de 450m² dans un quartier résidentiel prisé de Meudon. Terrain plat, entièrement viabilisé (eau, électricité, gaz, tout-à-l''égout, fibre optique). COS favorable permettant une construction de 180m² de surface de plancher. Environnement calme et verdoyant, vue dégagée. Proximité commerces, écoles et tramway T6. Idéal pour construction d''une maison individuelle.', 'terrain', 'vente', 380000, 450, 0, 0, 0, 'Chemin des Vignes', 'Meudon', '92190', 48.8094, 2.2356, null, null, false, true, agent1_id)
RETURNING id INTO prop8_id;

INSERT INTO properties (title, slug, description, type, transaction_type, price, surface, rooms, bedrooms, bathrooms, address, city, postal_code, latitude, longitude, energy_rating, ghg_rating, is_featured, is_published, agent_id)
VALUES ('Bureaux modernes open space - La Défense', 'bureaux-modernes-open-space-la-defense', 'Plateaux de bureaux de 200m² en open space dans une tour récente de La Défense. Climatisation réversible, faux plancher câblé, éclairage LED. Espace modulable avec possibilité de cloisonnement. Accès 24/7 avec badge, parking souterrain disponible. Charges locatives incluant ménage des parties communes, sécurité et maintenance technique. Disponible dès le 1er du mois prochain.', 'bureau', 'location', 6800, 200, 1, 0, 0, 'Tour Initiale, 1 Terrasse Bellini', 'Puteaux', '92800', 48.8922, 2.2375, 'A', 'A', false, true, agent2_id)
RETURNING id INTO prop9_id;

INSERT INTO properties (title, slug, description, type, transaction_type, price, surface, rooms, bedrooms, bathrooms, address, city, postal_code, latitude, longitude, energy_rating, ghg_rating, is_featured, is_published, agent_id)
VALUES ('Duplex avec rooftop - Montreuil', 'duplex-rooftop-montreuil', 'Magnifique duplex de 95m² au dernier étage d''une ancienne manufacture réhabilitée. Au niveau inférieur : vaste séjour cathédrale de 35m² avec verrière industrielle, cuisine ouverte design, WC. Au niveau supérieur : 2 chambres mansardées pleines de charme, salle de bains. Accès privatif à un rooftop de 25m² avec vue sur Paris. Cachet unique, matériaux bruts (brique, métal, béton ciré). Proche métro Robespierre.', 'appartement', 'vente', 485000, 95, 4, 2, 1, '5 rue de la Fraternité', 'Montreuil', '93100', 48.8566, 2.4411, 'C', 'C', true, true, agent3_id)
RETURNING id INTO prop10_id;

-- Property Media (photos via picsum.photos — images placeholder réalistes)
INSERT INTO property_media (property_id, url, position, alt_text) VALUES
  (prop1_id, 'https://picsum.photos/seed/bastille1/800/600', 0, 'Séjour lumineux avec balcon'),
  (prop1_id, 'https://picsum.photos/seed/bastille2/800/600', 1, 'Cuisine équipée'),
  (prop1_id, 'https://picsum.photos/seed/bastille3/800/600', 2, 'Chambre principale'),
  (prop2_id, 'https://picsum.photos/seed/vincennes1/800/600', 0, 'Façade de la maison avec jardin'),
  (prop2_id, 'https://picsum.photos/seed/vincennes2/800/600', 1, 'Séjour double'),
  (prop2_id, 'https://picsum.photos/seed/vincennes3/800/600', 2, 'Jardin privatif'),
  (prop3_id, 'https://picsum.photos/seed/latin1/800/600', 0, 'Pièce principale rénovée'),
  (prop4_id, 'https://picsum.photos/seed/boulogne1/800/600', 0, 'Terrasse panoramique'),
  (prop4_id, 'https://picsum.photos/seed/boulogne2/800/600', 1, 'Séjour avec baies vitrées'),
  (prop5_id, 'https://picsum.photos/seed/rivoli1/800/600', 0, 'Vitrine sur rue'),
  (prop6_id, 'https://picsum.photos/seed/germain1/800/600', 0, 'Double séjour haussmannien'),
  (prop6_id, 'https://picsum.photos/seed/germain2/800/600', 1, 'Cheminée en marbre'),
  (prop6_id, 'https://picsum.photos/seed/germain3/800/600', 2, 'Parquet point de Hongrie'),
  (prop7_id, 'https://picsum.photos/seed/levallois1/800/600', 0, 'Séjour meublé'),
  (prop8_id, 'https://picsum.photos/seed/meudon1/800/600', 0, 'Vue du terrain'),
  (prop9_id, 'https://picsum.photos/seed/defense1/800/600', 0, 'Open space moderne'),
  (prop10_id, 'https://picsum.photos/seed/montreuil1/800/600', 0, 'Séjour cathédrale avec verrière'),
  (prop10_id, 'https://picsum.photos/seed/montreuil2/800/600', 1, 'Rooftop avec vue sur Paris');

-- Contacts (leads de démo)
INSERT INTO contacts (first_name, last_name, email, phone, message, property_id, status) VALUES
  ('Jean', 'Dupont', 'jean.dupont@email.fr', '06 11 22 33 44', 'Bonjour, je suis intéressé par cet appartement. Serait-il possible d''organiser une visite ce week-end ? Merci.', prop1_id, 'nouveau'),
  ('Marie', 'Bernard', 'marie.bernard@email.fr', '06 77 88 99 00', 'Nous recherchons une maison familiale dans le secteur de Vincennes. Ce bien correspond à nos critères. Pouvez-vous nous recontacter ? Cordialement.', prop2_id, 'lu'),
  ('Pierre', 'Moreau', 'pierre.moreau@email.fr', null, 'Je souhaite obtenir des informations sur vos biens disponibles en location dans le 92. Budget max 1500€/mois pour un T2.', null, 'traité'),
  ('Isabelle', 'Garcia', 'isabelle.garcia@email.fr', '06 33 44 55 66', 'Bonjour, le duplex à Montreuil est-il encore disponible ? Je suis acheteuse en résidence principale avec un apport de 100k€. Merci de me rappeler.', prop10_id, 'nouveau');

-- Settings
INSERT INTO settings (key, value) VALUES
  ('agency_name', 'Immobilier Parisien'),
  ('agency_description', 'Votre agence immobilière de confiance en Île-de-France depuis 2005. Nous vous accompagnons dans tous vos projets immobiliers : achat, vente, location et estimation.'),
  ('agency_email', 'contact@immobilier-parisien.fr'),
  ('agency_phone', '01 42 36 78 90'),
  ('agency_address', '24 rue du Faubourg Saint-Honoré, 75008 Paris'),
  ('about_title', 'Une agence à taille humaine au service de vos projets'),
  ('about_description', 'Fondée en 2005, notre agence réunit une équipe de professionnels passionnés par l''immobilier parisien. Notre connaissance approfondie du marché et notre réseau nous permettent de vous proposer les meilleurs biens et de vous accompagner à chaque étape de votre projet.')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Blog posts
INSERT INTO posts (title, slug, excerpt, content, is_published, author_id) VALUES
  ('Les clés pour réussir votre premier achat immobilier', 'cles-reussir-premier-achat-immobilier', 'Découvrez nos conseils essentiels pour réussir votre premier achat immobilier en Île-de-France.', E'## Préparez votre projet en amont\n\nL''achat d''un premier bien immobilier est une étape importante. Avant de vous lancer, prenez le temps de bien définir votre projet : budget, localisation, type de bien, surface souhaitée.\n\n## Estimez votre capacité d''emprunt\n\nContactez votre banque ou un courtier pour connaître votre capacité d''emprunt. Le taux d''endettement ne doit pas dépasser 35% de vos revenus nets.\n\n## Visitez méthodiquement\n\nLors des visites, soyez attentif à l''état général du bien, à la copropriété, aux charges, et au quartier. N''hésitez pas à revenir à différents moments de la journée.\n\n## L''offre d''achat et le compromis\n\nUne fois le bien trouvé, formulez une offre d''achat par écrit. Si elle est acceptée, vous signerez un compromis de vente avec un délai de rétractation de 10 jours.', true, agent1_id),
  ('Marché immobilier 2025 : tendances et perspectives', 'marche-immobilier-2025-tendances', 'Analyse des tendances du marché immobilier en Île-de-France pour 2025.', E'## Un marché en reprise\n\nAprès une période d''ajustement, le marché immobilier francilien montre des signes de reprise encourageants. Les taux d''intérêt se stabilisent et la demande reste soutenue.\n\n## Les secteurs porteurs\n\nLes communes desservies par le Grand Paris Express continuent d''attirer les acheteurs. Montreuil, Vincennes et Boulogne-Billancourt restent des valeurs sûres.\n\n## Investissement locatif\n\nLa demande locative reste très forte en Île-de-France, portée par les étudiants et les jeunes actifs. Les petites surfaces offrent les meilleurs rendements.', true, agent2_id),
  ('Comment bien estimer la valeur de son bien ?', 'comment-estimer-valeur-bien', 'Les méthodes et critères pour estimer correctement la valeur de votre bien immobilier.', E'## Les critères déterminants\n\nPlusieurs facteurs influencent la valeur d''un bien : la localisation, la surface, l''état général, l''étage, l''exposition, les prestations et le marché local.\n\n## Méthode par comparaison\n\nLa méthode la plus fiable consiste à comparer votre bien avec des ventes récentes de biens similaires dans le même quartier. Les bases de données notariales sont une source précieuse.\n\n## Faire appel à un professionnel\n\nUn agent immobilier connaît le marché local et peut affiner l''estimation. Notre service d''estimation gratuit vous permet d''obtenir une évaluation précise de votre bien.', true, agent3_id);

-- Testimonials
INSERT INTO testimonials (name, role, content, rating, is_published) VALUES
  ('Laurent et Sophie D.', 'Achat appartement Paris 11e', 'Un accompagnement remarquable du début à la fin. Sophie a su comprendre nos besoins et nous trouver l''appartement idéal en moins de 3 semaines. Un grand merci !', 5, true),
  ('Catherine M.', 'Vente maison Vincennes', 'Thomas a vendu notre maison en 6 semaines au prix souhaité. Sa connaissance du marché local et son professionnalisme ont fait toute la différence. Je recommande vivement.', 5, true),
  ('Alexandre P.', 'Investissement locatif', 'Très bon conseil pour mon premier investissement locatif. L''équipe m''a guidé vers un bien rentable et a géré toutes les démarches administratives. Service impeccable.', 4, true),
  ('Nadia et Karim B.', 'Achat duplex Montreuil', 'Nous avons trouvé notre coup de cœur grâce à Claire. Elle a été à l''écoute, réactive et de très bon conseil tout au long du processus. L''agence est vraiment professionnelle.', 5, true),
  ('François R.', 'Location bureau La Défense', 'Recherche de bureaux rapide et efficace. Le bien proposé correspondait parfaitement à nos critères. Un interlocuteur unique du début à la fin, c''est appréciable.', 4, true);

-- Property documents (quelques diagnostics de démo)
INSERT INTO property_documents (property_id, name, url, type, position) VALUES
  (prop1_id, 'Diagnostic de performance énergétique', 'https://picsum.photos/seed/dpe1/800/1100', 'diagnostic', 0),
  (prop1_id, 'Plan de l''appartement', 'https://picsum.photos/seed/plan1/800/600', 'plan', 1),
  (prop2_id, 'Diagnostic de performance énergétique', 'https://picsum.photos/seed/dpe2/800/1100', 'diagnostic', 0),
  (prop6_id, 'Plan des 120m²', 'https://picsum.photos/seed/plan6/800/600', 'plan', 0),
  (prop6_id, 'Diagnostic amiante', 'https://picsum.photos/seed/diag6/800/1100', 'diagnostic', 1);

-- Notification preferences (all agents receive all notifications by default)
INSERT INTO notification_preferences (agent_id, event_type, enabled) VALUES
  (agent1_id, 'contact', true),
  (agent1_id, 'estimation', true),
  (agent2_id, 'contact', true),
  (agent2_id, 'estimation', true),
  (agent3_id, 'contact', true),
  (agent3_id, 'estimation', false);

END $$;
