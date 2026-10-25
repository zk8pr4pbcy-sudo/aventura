BEGIN;

CREATE TYPE notification_status AS ENUM ('pending', 'processing', 'sent', 'failed');

CREATE TABLE notification_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  request_kind request_kind NOT NULL,
  request_id uuid NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status notification_status NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  available_at timestamptz NOT NULL DEFAULT now(),
  locked_at timestamptz,
  sent_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_type, request_kind, request_id)
);

CREATE TRIGGER notification_outbox_target_integrity
BEFORE INSERT OR UPDATE OF request_kind, request_id
ON notification_outbox
FOR EACH ROW
EXECUTE FUNCTION assert_request_target_exists();

CREATE INDEX notification_outbox_delivery_idx
  ON notification_outbox(status, available_at, created_at)
  WHERE status IN ('pending', 'failed');

COMMIT;
