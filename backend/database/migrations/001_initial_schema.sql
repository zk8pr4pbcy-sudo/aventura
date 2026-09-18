BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('owner','admin','operations','content','viewer');
CREATE TYPE request_status AS ENUM ('new','under_review','contacted','quoted','confirmed','not_suitable','closed','cancelled');
CREATE TYPE request_kind AS ENUM ('experience','collaboration');
CREATE TYPE content_status AS ENUM ('draft','published','archived');

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  display_name text NOT NULL,
  role user_role NOT NULL DEFAULT 'viewer',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text,
  phone text,
  preferred_language text CHECK (preferred_language IN ('ar','en','es')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE SEQUENCE public_request_reference_seq START 1;

CREATE TABLE experience_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number text NOT NULL UNIQUE,
  customer_id uuid NOT NULL REFERENCES customers(id),
  experience_key text NOT NULL,
  requested_date date,
  party_size integer CHECK (party_size IS NULL OR party_size > 0),
  request_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status request_status NOT NULL DEFAULT 'new',
  source text NOT NULL DEFAULT 'website',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE collaboration_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number text NOT NULL UNIQUE,
  customer_id uuid NOT NULL REFERENCES customers(id),
  organization_name text,
  collaboration_type text NOT NULL,
  proposal text NOT NULL,
  request_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status request_status NOT NULL DEFAULT 'new',
  source text NOT NULL DEFAULT 'website',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE request_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_kind request_kind NOT NULL,
  request_id uuid NOT NULL,
  from_status request_status,
  to_status request_status NOT NULL,
  changed_by uuid REFERENCES users(id),
  changed_at timestamptz NOT NULL DEFAULT now(),
  note text
);

CREATE TABLE internal_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_kind request_kind NOT NULL,
  request_id uuid NOT NULL,
  author_id uuid NOT NULL REFERENCES users(id),
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE website_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL,
  slug text NOT NULL UNIQUE,
  status content_status NOT NULL DEFAULT 'draft',
  title_ar text NOT NULL,
  title_en text,
  title_es text,
  body_ar text,
  body_en text,
  body_es text,
  media_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  published_at timestamptz,
  created_by uuid REFERENCES users(id),
  updated_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at > starts_at)
);

CREATE TABLE audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES users(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX experience_requests_customer_idx ON experience_requests(customer_id);
CREATE INDEX experience_requests_status_created_idx ON experience_requests(status, created_at DESC);
CREATE INDEX collaboration_requests_customer_idx ON collaboration_requests(customer_id);
CREATE INDEX collaboration_requests_status_created_idx ON collaboration_requests(status, created_at DESC);
CREATE INDEX request_status_history_request_idx ON request_status_history(request_kind, request_id, changed_at DESC);
CREATE INDEX internal_notes_request_idx ON internal_notes(request_kind, request_id, created_at DESC);
CREATE INDEX website_content_publish_idx ON website_content(status, starts_at, ends_at);
CREATE INDEX audit_log_entity_idx ON audit_log(entity_type, entity_id, created_at DESC);

COMMIT;
