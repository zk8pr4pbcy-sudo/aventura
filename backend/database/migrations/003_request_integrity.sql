BEGIN;

CREATE OR REPLACE FUNCTION assert_request_target_exists()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  target_exists boolean;
BEGIN
  IF NEW.request_kind = 'experience' THEN
    SELECT EXISTS(
      SELECT 1 FROM experience_requests WHERE id = NEW.request_id
    ) INTO target_exists;
  ELSIF NEW.request_kind = 'collaboration' THEN
    SELECT EXISTS(
      SELECT 1 FROM collaboration_requests WHERE id = NEW.request_id
    ) INTO target_exists;
  ELSE
    target_exists := false;
  END IF;

  IF NOT target_exists THEN
    RAISE EXCEPTION 'Request target does not exist for kind % and id %', NEW.request_kind, NEW.request_id
      USING ERRCODE = '23503';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER request_status_history_target_integrity
BEFORE INSERT OR UPDATE OF request_kind, request_id
ON request_status_history
FOR EACH ROW
EXECUTE FUNCTION assert_request_target_exists();

CREATE TRIGGER internal_notes_target_integrity
BEFORE INSERT OR UPDATE OF request_kind, request_id
ON internal_notes
FOR EACH ROW
EXECUTE FUNCTION assert_request_target_exists();

COMMIT;
