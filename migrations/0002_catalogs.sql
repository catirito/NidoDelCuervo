CREATE TABLE classes (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  name_key TEXT NOT NULL UNIQUE
);
CREATE TABLE subclasses (
  id TEXT PRIMARY KEY NOT NULL,
  class_id TEXT NOT NULL REFERENCES classes(id),
  name TEXT NOT NULL,
  name_key TEXT NOT NULL,
  UNIQUE(class_id, name_key)
);
CREATE TABLE species (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  name_key TEXT NOT NULL UNIQUE
);
