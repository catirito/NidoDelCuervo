CREATE TABLE creation_requests (
  character_id TEXT PRIMARY KEY REFERENCES characters(id),
  request_hash TEXT NOT NULL
);
