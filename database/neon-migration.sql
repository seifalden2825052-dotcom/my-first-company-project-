-- Top Quality Prospect — one-time Replit-to-Neon migration
-- Run this entire file in the Neon SQL Editor for the target database.
-- It is safe to run again: existing rows are updated by their unique keys.

BEGIN;

CREATE TABLE IF NOT EXISTS certificates (
  id SERIAL PRIMARY KEY,
  certificate_number TEXT NOT NULL UNIQUE,
  holder_name TEXT NOT NULL,
  ndt_method TEXT NOT NULL,
  level TEXT NOT NULL,
  issued_date TEXT NOT NULL,
  expiration_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'valid',
  issued_by TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_pages (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO certificates (
  id, certificate_number, holder_name, ndt_method, level,
  issued_date, expiration_date, status, issued_by, notes, created_at, updated_at
) VALUES
  (
    1, 'TQP-2024-001', 'Ahmed Al-Zahrani', 'Magnetic Particle Testing (MT)', 'Level II',
    '2024-01-15', '2027-01-15', 'valid', 'Top Quality Prospect - Saudi Arabia',
    'Annual certification renewal', '2026-08-02T19:21:19.374Z', '2026-08-02T19:21:19.374Z'
  ),
  (
    2, 'TQP-2024-002', 'Khalid Al-Otaibi', 'Ultrasonic Testing (UT)', 'Level III',
    '2024-03-20', '2027-03-20', 'valid', 'Top Quality Prospect - Saudi Arabia',
    NULL, '2026-08-02T19:21:19.500Z', '2026-08-02T19:21:19.500Z'
  ),
  (
    3, 'TQP-2023-045', 'Mohammed Al-Rashidi', 'Radiographic Testing (RT)', 'Level II',
    '2026-08-08', '2026-08-10', 'valid', 'Top Quality Prospect - Saudi Arabia',
    '', '2026-08-02T19:21:19.616Z', '2026-08-11T17:15:50.191Z'
  )
ON CONFLICT (certificate_number) DO UPDATE SET
  holder_name = EXCLUDED.holder_name,
  ndt_method = EXCLUDED.ndt_method,
  level = EXCLUDED.level,
  issued_date = EXCLUDED.issued_date,
  expiration_date = EXCLUDED.expiration_date,
  status = EXCLUDED.status,
  issued_by = EXCLUDED.issued_by,
  notes = EXCLUDED.notes,
  updated_at = EXCLUDED.updated_at;

INSERT INTO site_pages (
  id, title, slug, published, blocks, created_at, updated_at
) VALUES (
  1,
  'Events',
  'events',
  TRUE,
  '[
    {"id":"b1","type":"heading","label":"Course","content":"NDT Level II Course"},
    {"id":"b2","type":"price","label":"Price","content":"1500 SAR"}
  ]'::jsonb,
  '2026-08-10T12:39:03.638Z',
  '2026-08-10T12:39:34.959Z'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  published = EXCLUDED.published,
  blocks = EXCLUDED.blocks,
  updated_at = EXCLUDED.updated_at;

SELECT setval(
  pg_get_serial_sequence('certificates', 'id'),
  GREATEST((SELECT COALESCE(MAX(id), 1) FROM certificates), 1),
  true
);
SELECT setval(
  pg_get_serial_sequence('site_pages', 'id'),
  GREATEST((SELECT COALESCE(MAX(id), 1) FROM site_pages), 1),
  true
);

COMMIT;