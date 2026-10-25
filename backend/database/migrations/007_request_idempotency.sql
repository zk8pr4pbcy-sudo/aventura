ALTER TABLE experience_requests
  ADD COLUMN idempotency_key_hash char(64),
  ADD COLUMN idempotency_fingerprint char(64),
  ADD CONSTRAINT experience_requests_idempotency_pair_check
    CHECK ((idempotency_key_hash IS NULL) = (idempotency_fingerprint IS NULL));

ALTER TABLE collaboration_requests
  ADD COLUMN idempotency_key_hash char(64),
  ADD COLUMN idempotency_fingerprint char(64),
  ADD CONSTRAINT collaboration_requests_idempotency_pair_check
    CHECK ((idempotency_key_hash IS NULL) = (idempotency_fingerprint IS NULL));

CREATE UNIQUE INDEX experience_requests_idempotency_key_uq
  ON experience_requests(idempotency_key_hash)
  WHERE idempotency_key_hash IS NOT NULL;

CREATE UNIQUE INDEX collaboration_requests_idempotency_key_uq
  ON collaboration_requests(idempotency_key_hash)
  WHERE idempotency_key_hash IS NOT NULL;
