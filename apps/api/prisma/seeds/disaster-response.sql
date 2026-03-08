-- Baseline disaster-response reference data seed
-- Apply manually in environments that require initial records.

INSERT INTO "RiskRegionSnapshot" (
  "id", "hazardType", "severity", "name", "latitude", "longitude", "radiusKm", "startsAt", "endsAt", "source", "createdAt"
)
VALUES
  ('seed-risk-flood-1', 'FLOOD', 'HIGH', 'Central River Flood Watch', 3.1400, 113.0400, 35.0, NOW(), NULL, 'seed', NOW()),
  ('seed-risk-typhoon-1', 'TYPHOON', 'MODERATE', 'Coastal Typhoon Exposure', 3.3000, 113.3000, 60.0, NOW(), NULL, 'seed', NOW())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "EvacuationArea" (
  "id", "name", "latitude", "longitude", "address", "region", "isActive", "createdAt", "updatedAt"
)
VALUES
  ('seed-evac-1', 'Community Hall A', 3.1500, 113.0500, 'Community Hall A', 'Kuching', true, NOW(), NOW()),
  ('seed-evac-2', 'Public School B', 3.1700, 113.0800, 'Public School B', 'Kuching', true, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "MapPinStatus" (
  "id", "title", "hazardType", "status", "priority", "latitude", "longitude", "region", "note", "reportedAt", "updatedAt"
)
VALUES
  ('seed-pin-1', 'Bridge access blocked', 'FLOOD', 'OPEN', 3, 3.1600, 113.0600, 'Kuching', 'Initial seeded operational pin', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;
