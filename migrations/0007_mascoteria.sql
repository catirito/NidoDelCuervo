CREATE TABLE pets (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL CHECK(length(trim(name)) > 0),
  animal TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  version INTEGER NOT NULL DEFAULT 0 CHECK(version >= 0),
  is_deleted INTEGER NOT NULL DEFAULT 0 CHECK(is_deleted IN (0, 1)),
  source_cell TEXT UNIQUE,
  creation_payload TEXT
);

CREATE TABLE pet_owners (
  pet_id TEXT NOT NULL REFERENCES pets(id),
  character_id TEXT NOT NULL REFERENCES characters(id),
  PRIMARY KEY (pet_id, character_id)
);

CREATE INDEX pet_owners_character ON pet_owners(character_id);

CREATE TABLE pet_write_guard (
  current_versions INTEGER NOT NULL CONSTRAINT pet_stale CHECK(current_versions = 1),
  valid_owners INTEGER NOT NULL CONSTRAINT pet_invalid_owner CHECK(valid_owners = 1)
);

CREATE TABLE pet_imports (
  id TEXT PRIMARY KEY NOT NULL
);
