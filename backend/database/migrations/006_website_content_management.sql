BEGIN;

ALTER TABLE website_content
  ADD COLUMN content_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN sort_order integer NOT NULL DEFAULT 0;

ALTER TABLE website_content
  ADD CONSTRAINT website_content_type_check
  CHECK (content_type IN ('event', 'offer', 'announcement', 'experience'));

CREATE INDEX website_content_public_delivery_idx
  ON website_content(content_type, status, sort_order DESC, starts_at, ends_at);

COMMIT;
