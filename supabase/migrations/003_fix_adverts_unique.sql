-- ============================================================================
-- 003_fix_adverts_unique.sql
-- BRO-11: Add UNIQUE constraint on adverts.property_id
-- Ensures one-advert-per-property data model and enables upsert via onConflict
-- ============================================================================

-- Step 1: Delete duplicate adverts, keeping only the latest per property_id
DELETE FROM adverts
WHERE id NOT IN (
  SELECT DISTINCT ON (property_id) id
  FROM adverts
  ORDER BY property_id, created_at DESC
);

-- Step 2: Add the UNIQUE constraint
ALTER TABLE adverts
  ADD CONSTRAINT adverts_property_id_unique UNIQUE (property_id);
