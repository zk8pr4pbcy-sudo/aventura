BEGIN;

CREATE OR REPLACE FUNCTION next_aventura_reference(prefix text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  seq_value bigint;
  safe_prefix text;
BEGIN
  safe_prefix := upper(trim(prefix));
  IF safe_prefix NOT IN ('EXP','COL') THEN
    RAISE EXCEPTION 'Unsupported Aventura reference prefix: %', prefix;
  END IF;

  seq_value := nextval('public_request_reference_seq');
  RETURN 'AV-' || safe_prefix || '-' || to_char(CURRENT_DATE, 'YYYY') || '-' || lpad(seq_value::text, 6, '0');
END;
$$;

ALTER TABLE experience_requests
  ALTER COLUMN reference_number SET DEFAULT next_aventura_reference('EXP');

ALTER TABLE collaboration_requests
  ALTER COLUMN reference_number SET DEFAULT next_aventura_reference('COL');

COMMIT;
