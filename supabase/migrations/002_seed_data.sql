-- ============================================================================
-- 002_seed_data.sql
-- Seed data for BrokerApp — mirrors src/lib/mock-data.ts
-- ============================================================================
--
-- FK DEPENDENCY: DEMO USER_ID
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- This seed data requires a user in auth.users to satisfy the profiles FK.
-- The approach: we use a well-known fixed UUID as the demo user_id.
-- A DO block first checks if this user exists in auth.users.
-- If NOT, the seed inserts a placeholder into auth.users (only works in
-- local/dev environments where the auth schema is writable).
-- In production, create a real user first, then update DEMO_USER_ID below.
--
-- To use with a different user, change the UUID on the next line:
-- ============================================================================

DO $$
DECLARE
  DEMO_USER_ID  uuid := '00000000-0000-0000-0000-000000000099';
  DEMO_ORG_ID   uuid := '00000000-0000-0000-0000-000000000001';
  user_exists   boolean;
  seed_exists   boolean;
BEGIN
  -- Guard: skip if seed data already exists
  SELECT EXISTS(SELECT 1 FROM organizations WHERE id = DEMO_ORG_ID) INTO seed_exists;
  IF seed_exists THEN
    RAISE NOTICE 'Seed data already exists, skipping.';
    RETURN;
  END IF;

  -- Check if the demo user exists in auth.users
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = DEMO_USER_ID) INTO user_exists;

  IF NOT user_exists THEN
    -- Insert a minimal auth.users entry for the demo user.
    -- This works in migration context (superuser). In production,
    -- create the user via Supabase Auth instead.
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      DEMO_USER_ID,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'demo@brokerapp.nl',
      crypt('demo-password-123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Demo Makelaar"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
  END IF;

  -- Ensure profile exists (handle_new_user trigger may have created it,
  -- but insert with ON CONFLICT to be safe)
  INSERT INTO profiles (id, full_name, email, organization_id, role)
  VALUES (DEMO_USER_ID, 'Demo Makelaar', 'demo@brokerapp.nl', NULL, 'owner')
  ON CONFLICT (id) DO NOTHING;

  -- =========================
  -- Organization
  -- =========================
  INSERT INTO organizations (id, name, slug)
  VALUES (DEMO_ORG_ID, 'Demo Makelaardij', 'demo-makelaardij');

  -- Link demo user to the organization
  UPDATE profiles SET organization_id = DEMO_ORG_ID WHERE id = DEMO_USER_ID;

  -- =========================
  -- Properties (8 properties matching mock-data.ts)
  -- =========================
  INSERT INTO properties (id, user_id, organization_id, address, postal_code, city, price, square_meters, rooms, bedrooms, bathrooms, build_year, energy_label, status, images, created_at, updated_at) VALUES
  (
    '10000000-0000-0000-0000-000000000001', DEMO_USER_ID, DEMO_ORG_ID,
    'Keizersgracht 482', '1017 EG', 'Amsterdam',
    845000, 142, 5, 3, 2, 1890, 'A', 'published',
    ARRAY['/images/property-1a.jpg', '/images/property-1b.jpg'],
    now() - interval '14 days', now() - interval '2 days'
  ),
  (
    '10000000-0000-0000-0000-000000000002', DEMO_USER_ID, DEMO_ORG_ID,
    'Oudegracht 156', '3511 AZ', 'Utrecht',
    525000, 98, 4, 2, 1, 1920, 'B', 'generated',
    ARRAY['/images/property-2a.jpg'],
    now() - interval '7 days', now() - interval '1 day'
  ),
  (
    '10000000-0000-0000-0000-000000000003', DEMO_USER_ID, DEMO_ORG_ID,
    'Witte de Withstraat 38', '3012 BR', 'Rotterdam',
    375000, 85, 3, 2, 1, 2005, 'A+', 'published',
    ARRAY['/images/property-3a.jpg', '/images/property-3b.jpg'],
    now() - interval '21 days', now() - interval '5 days'
  ),
  (
    '10000000-0000-0000-0000-000000000004', DEMO_USER_ID, DEMO_ORG_ID,
    'Lange Voorhout 74', '2514 EH', 'Den Haag',
    695000, 120, 4, 3, 2, 1875, 'C', 'draft',
    ARRAY['/images/property-4a.jpg'],
    now() - interval '3 days', now() - interval '3 days'
  ),
  (
    '10000000-0000-0000-0000-000000000005', DEMO_USER_ID, DEMO_ORG_ID,
    'Herengracht 320', '1016 CE', 'Amsterdam',
    725000, 115, 4, 2, 2, 1910, 'B', 'generated',
    ARRAY['/images/property-5a.jpg', '/images/property-5b.jpg'],
    now() - interval '10 days', now() - interval '8 hours'
  ),
  (
    '10000000-0000-0000-0000-000000000006', DEMO_USER_ID, DEMO_ORG_ID,
    'Mariaplaats 12', '3511 LH', 'Utrecht',
    450000, 78, 3, 1, 1, 1955, 'D', 'draft',
    ARRAY[]::text[],
    now() - interval '1 day', now() - interval '1 day'
  ),
  (
    '10000000-0000-0000-0000-000000000007', DEMO_USER_ID, DEMO_ORG_ID,
    'Noordeinde 58', '2514 GL', 'Den Haag',
    550000, 95, 4, 2, 1, 1935, 'A++', 'published',
    ARRAY['/images/property-7a.jpg', '/images/property-7b.jpg'],
    now() - interval '30 days', now() - interval '10 days'
  ),
  (
    '10000000-0000-0000-0000-000000000008', DEMO_USER_ID, DEMO_ORG_ID,
    'Coolsingel 42', '3011 AD', 'Rotterdam',
    299000, 65, 3, 1, 1, 2018, 'A+++', 'generated',
    ARRAY['/images/property-8a.jpg'],
    now() - interval '5 days', now() - interval '3 hours'
  );

  -- =========================
  -- Adverts (6 adverts matching mockAdverts)
  -- =========================
  INSERT INTO adverts (id, property_id, title, description, features, platform, created_at) VALUES
  (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'Stijlvol grachtenpand aan de Keizersgracht',
    'Dit prachtige grachtenpand uit 1890 combineert authentieke details met modern comfort. De woning beschikt over originele ornamenten, hoge plafonds en grote ramen die zorgen voor een overvloed aan natuurlijk licht. De volledig gerenoveerde keuken en badkamers bieden alle hedendaagse gemakken. Gelegen aan een van de mooiste grachten van Amsterdam, met winkels, restaurants en het Rijksmuseum op loopafstand.',
    ARRAY['Originele ornamenten en schouwen', 'Volledig gerenoveerde keuken met inbouwapparatuur', 'Twee luxe badkamers met vloerverwarming', 'Uitzicht over de Keizersgracht', 'Energielabel A — uitstekend geïsoleerd'],
    'funda',
    now() - interval '5 days'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    'Karakteristiek werfkelderwoningen aan de Oudegracht',
    'Unieke woning aan de beroemde Oudegracht in het hart van Utrecht. Deze charmante woning uit 1920 biedt een bijzondere woervaring met directe toegang tot de werf. De lichte woonkamer met originele balkenplafonds en de moderne open keuken maken dit tot een droomwoning voor liefhebbers van stadswonen met karakter.',
    ARRAY['Directe toegang tot de Oudegracht-werf', 'Originele balkenplafonds', 'Moderne open keuken', 'Midden in het centrum van Utrecht'],
    'pararius',
    now() - interval '3 days'
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000003',
    'Modern appartement in het bruisende Rotterdam',
    'Licht en ruim appartement in het populaire Witte de Withkwartier. Dit moderne appartement uit 2005 is perfect voor wie wil genieten van het stadsleven. De open woonkeuken, het ruime balkon en de nabijheid van culturele hotspots zoals het Museumpark maken deze woning ideaal voor jong professionals en stellen.',
    ARRAY['Ruim balkon op het zuiden', 'Open woonkeuken met kookeiland', 'Energielabel A+ — zeer energiezuinig', 'Op loopafstand van Museumpark en Erasmusbrug', 'Eigen parkeerplaats in de garage'],
    'funda',
    now() - interval '8 days'
  ),
  (
    '20000000-0000-0000-0000-000000000004',
    '10000000-0000-0000-0000-000000000005',
    'Elegant herenhuis aan de Herengracht',
    'Sfeervol herenhuis uit 1910 aan de prestigieuze Herengracht. Deze woning straalt klasse uit met zijn hoge plafonds, sierlijke gevel en prachtige erker. De combinatie van authentieke elementen en moderne voorzieningen maakt dit een unieke kans in het hart van Amsterdam. Twee royale badkamers en een zonnige achtertuin completeren het geheel.',
    ARRAY['Monumentale gevel met erker', 'Hoge plafonds met stucwerk', 'Twee luxe badkamers', 'Zonnige achtertuin op het westen', 'Kelder met bergruimte'],
    'jaap',
    now() - interval '2 days'
  ),
  (
    '20000000-0000-0000-0000-000000000005',
    '10000000-0000-0000-0000-000000000007',
    'Gerenoveerde stadswoning nabij het Noordeinde',
    'Prachtig gerenoveerde stadswoning uit 1935 in het gewilde Noordeinde-kwartier van Den Haag. Dankzij de recente renovatie beschikt deze woning over energielabel A++ en alle moderne gemakken, terwijl het oorspronkelijke karakter behouden is gebleven. De locatie nabij het Paleis Noordeinde, de Passage en het strand van Scheveningen maakt deze woning bijzonder aantrekkelijk.',
    ARRAY['Energielabel A++ na volledige renovatie', 'Oorspronkelijke details behouden', 'Nabij Paleis Noordeinde en de Passage', '15 minuten fietsen naar Scheveningen'],
    'funda',
    now() - interval '15 days'
  ),
  (
    '20000000-0000-0000-0000-000000000006',
    '10000000-0000-0000-0000-000000000008',
    'Nieuwbouwappartement aan de Coolsingel',
    'Stijlvol nieuwbouwappartement uit 2018 aan de volledig vernieuwde Coolsingel. Dit compacte maar slim ingedeelde appartement biedt alles wat een moderne stadsbewoner nodig heeft. Met energielabel A+++ zijn de energiekosten minimaal. De centrale ligging bij Rotterdam Centraal en de Markthal maakt dit de perfecte stadswoning.',
    ARRAY['Energielabel A+++ — bijna energieneutraal', 'Slimme indeling met veel bergruimte', 'Aan de vernieuwde Coolsingel', '5 minuten lopen naar Rotterdam Centraal', 'Gemeenschappelijk dakterras'],
    'pararius',
    now() - interval '4 hours'
  );

  -- =========================
  -- Activity Log (11 entries matching mockActivityFeed)
  -- =========================
  INSERT INTO activity_log (id, user_id, type, property_id, property_address, platform, created_at) VALUES
  (
    '30000000-0000-0000-0000-000000000001', DEMO_USER_ID,
    'generated', '10000000-0000-0000-0000-000000000008',
    'Coolsingel 42, Rotterdam', NULL,
    now() - interval '3 hours'
  ),
  (
    '30000000-0000-0000-0000-000000000002', DEMO_USER_ID,
    'edited', '10000000-0000-0000-0000-000000000005',
    'Herengracht 320, Amsterdam', NULL,
    now() - interval '8 hours'
  ),
  (
    '30000000-0000-0000-0000-000000000003', DEMO_USER_ID,
    'published', '10000000-0000-0000-0000-000000000001',
    'Keizersgracht 482, Amsterdam', 'funda',
    now() - interval '2 days'
  ),
  (
    '30000000-0000-0000-0000-000000000004', DEMO_USER_ID,
    'generated', '10000000-0000-0000-0000-000000000002',
    'Oudegracht 156, Utrecht', NULL,
    now() - interval '1 day'
  ),
  (
    '30000000-0000-0000-0000-000000000005', DEMO_USER_ID,
    'published', '10000000-0000-0000-0000-000000000003',
    'Witte de Withstraat 38, Rotterdam', 'pararius',
    now() - interval '5 days'
  ),
  (
    '30000000-0000-0000-0000-000000000006', DEMO_USER_ID,
    'edited', '10000000-0000-0000-0000-000000000001',
    'Keizersgracht 482, Amsterdam', NULL,
    now() - interval '3 days'
  ),
  (
    '30000000-0000-0000-0000-000000000007', DEMO_USER_ID,
    'generated', '10000000-0000-0000-0000-000000000005',
    'Herengracht 320, Amsterdam', NULL,
    now() - interval '4 days'
  ),
  (
    '30000000-0000-0000-0000-000000000008', DEMO_USER_ID,
    'published', '10000000-0000-0000-0000-000000000007',
    'Noordeinde 58, Den Haag', 'jaap',
    now() - interval '10 days'
  ),
  (
    '30000000-0000-0000-0000-000000000009', DEMO_USER_ID,
    'generated', '10000000-0000-0000-0000-000000000003',
    'Witte de Withstraat 38, Rotterdam', NULL,
    now() - interval '6 days'
  ),
  (
    '30000000-0000-0000-0000-000000000010', DEMO_USER_ID,
    'edited', '10000000-0000-0000-0000-000000000007',
    'Noordeinde 58, Den Haag', NULL,
    now() - interval '11 days'
  ),
  (
    '30000000-0000-0000-0000-000000000011', DEMO_USER_ID,
    'generated', '10000000-0000-0000-0000-000000000007',
    'Noordeinde 58, Den Haag', NULL,
    now() - interval '12 days'
  );

END $$;
