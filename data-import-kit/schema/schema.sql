-- The Village Investment — Real-Estate schema (PostgreSQL)
-- Generated 2026-07-13 · v1.0 · scalable to 100,000+ units
-- Enum-style columns are constrained with CHECK lists so bad values are rejected.

BEGIN;

-- 1. Areas — Geographic zones that projects belong to (e.g. New Cairo, North Coast).
CREATE TABLE IF NOT EXISTS areas (
  area_id                    VARCHAR(16) PRIMARY KEY,
  name_en                    VARCHAR(255) NOT NULL,
  name_ar                    VARCHAR(255) NOT NULL,
  slug                       VARCHAR(160) NOT NULL,
  region                     VARCHAR(60) NOT NULL CHECK (region IN ('New Cairo', 'Fifth Settlement', 'New Administrative Capital', 'Mostakbal City', 'Sheikh Zayed', '6th of October', 'New Zayed', 'New Heliopolis', 'North Coast (Sahel)', 'Ras El Hekma', 'New Alamein', 'Ain Sokhna', 'New Mansoura', 'Other')),
  governorate                VARCHAR(60) NOT NULL CHECK (governorate IN ('Cairo', 'Giza', 'Alexandria', 'Matrouh', 'Red Sea', 'Suez', 'Qalyubia', 'Dakahlia')),
  city_en                    VARCHAR(255),
  city_ar                    VARCHAR(255),
  latitude                   NUMERIC(10,6),
  longitude                  NUMERIC(10,6),
  description_en             TEXT,
  description_ar             TEXT,
  meta_title_en              VARCHAR(255),
  meta_title_ar              VARCHAR(255),
  meta_description_en        TEXT,
  meta_description_ar        TEXT,
  hero_image                 VARCHAR(500),
  status                     VARCHAR(60) NOT NULL CHECK (status IN ('active', 'coming_soon', 'archived')),
  sort_order                 INTEGER,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_areas_slug UNIQUE (slug)
);
CREATE INDEX IF NOT EXISTS ix_areas_slug ON areas(slug);

-- 2. Developers — Real-estate development companies whose projects you market.
CREATE TABLE IF NOT EXISTS developers (
  developer_id               VARCHAR(16) PRIMARY KEY,
  name_en                    VARCHAR(255) NOT NULL,
  name_ar                    VARCHAR(255) NOT NULL,
  slug                       VARCHAR(160) NOT NULL,
  founded_year               INTEGER,
  headquarters_en            VARCHAR(255),
  headquarters_ar            VARCHAR(255),
  website                    VARCHAR(500),
  phone                      VARCHAR(40),
  tagline_en                 VARCHAR(255),
  tagline_ar                 VARCHAR(255),
  description_en             TEXT,
  description_ar             TEXT,
  logo_image                 VARCHAR(500),
  cover_image                VARCHAR(500),
  meta_title_en              VARCHAR(255),
  meta_title_ar              VARCHAR(255),
  meta_description_en        TEXT,
  meta_description_ar        TEXT,
  status                     VARCHAR(60) NOT NULL CHECK (status IN ('active', 'archived')),
  sort_order                 INTEGER,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_developers_slug UNIQUE (slug)
);
CREATE INDEX IF NOT EXISTS ix_developers_slug ON developers(slug);

-- 3. Projects — Master developments (compounds / resorts) offered for primary sale.
CREATE TABLE IF NOT EXISTS projects (
  project_id                 VARCHAR(16) PRIMARY KEY,
  name_en                    VARCHAR(255) NOT NULL,
  name_ar                    VARCHAR(255) NOT NULL,
  slug                       VARCHAR(160) NOT NULL,
  developer_id               VARCHAR(20) NOT NULL,
  area_id                    VARCHAR(20) NOT NULL,
  project_type               VARCHAR(60) NOT NULL CHECK (project_type IN ('Residential', 'Coastal', 'Mixed-Use', 'Administrative', 'Commercial', 'Medical')),
  project_status             VARCHAR(60) NOT NULL CHECK (project_status IN ('New Launch', 'Under Construction', 'Ready to Move', 'Fully Sold')),
  sale_type                  VARCHAR(60) NOT NULL CHECK (sale_type IN ('Primary')),
  launch_date                DATE,
  delivery_date              DATE,
  min_price_egp              NUMERIC(16,2),
  max_price_egp              NUMERIC(16,2),
  currency                   VARCHAR(60) NOT NULL CHECK (currency IN ('EGP', 'USD')),
  down_payment_pct           NUMERIC(16,2),
  installment_years          INTEGER,
  min_unit_area_sqm          NUMERIC(16,2),
  max_unit_area_sqm          NUMERIC(16,2),
  finishing                  VARCHAR(60) CHECK (finishing IN ('Fully Finished', 'Finished with ACs', 'Semi-Finished', 'Core & Shell', 'Not Finished')),
  latitude                   NUMERIC(10,6),
  longitude                  NUMERIC(10,6),
  description_en             TEXT,
  description_ar             TEXT,
  highlights_en              TEXT,
  highlights_ar              TEXT,
  meta_title_en              VARCHAR(255),
  meta_title_ar              VARCHAR(255),
  meta_description_en        TEXT,
  meta_description_ar        TEXT,
  hero_image                 VARCHAR(500),
  gallery_images             TEXT,
  master_plan_image          VARCHAR(500),
  brochure_pdf               VARCHAR(500),
  is_featured                VARCHAR(60) CHECK (is_featured IN ('Yes', 'No')),
  status                     VARCHAR(60) NOT NULL CHECK (status IN ('active', 'coming_soon', 'archived')),
  sort_order                 INTEGER,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_projects_developer_id FOREIGN KEY (developer_id) REFERENCES developers(developer_id),
  CONSTRAINT fk_projects_area_id FOREIGN KEY (area_id) REFERENCES areas(area_id),
  CONSTRAINT uq_projects_slug UNIQUE (slug)
);
CREATE INDEX IF NOT EXISTS ix_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS ix_projects_developer_id ON projects(developer_id);
CREATE INDEX IF NOT EXISTS ix_projects_area_id ON projects(area_id);

-- 4. Unit Types — Repeatable unit models/typologies within a project (e.g. 'Type A – 3BR').
CREATE TABLE IF NOT EXISTS unit_types (
  unit_type_id               VARCHAR(16) PRIMARY KEY,
  project_id                 VARCHAR(20) NOT NULL,
  name_en                    VARCHAR(255) NOT NULL,
  name_ar                    VARCHAR(255) NOT NULL,
  category                   VARCHAR(60) NOT NULL CHECK (category IN ('Apartment', 'Duplex', 'Penthouse', 'Studio', 'Townhouse', 'Twinhouse', 'Standalone Villa', 'Chalet', 'Cabin', 'Serviced Apartment', 'Office', 'Clinic', 'Retail Store', 'Pharmacy')),
  bedrooms                   INTEGER NOT NULL,
  bathrooms                  INTEGER,
  min_area_sqm               NUMERIC(16,2) NOT NULL,
  max_area_sqm               NUMERIC(16,2),
  has_garden                 VARCHAR(60) CHECK (has_garden IN ('Yes', 'No')),
  has_roof                   VARCHAR(60) CHECK (has_roof IN ('Yes', 'No')),
  typical_price_from_egp     NUMERIC(16,2),
  floor_plan_image           VARCHAR(500),
  description_en             TEXT,
  description_ar             TEXT,
  status                     VARCHAR(60) NOT NULL CHECK (status IN ('active', 'coming_soon', 'archived')),
  sort_order                 INTEGER,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_unit_types_project_id FOREIGN KEY (project_id) REFERENCES projects(project_id)
);
CREATE INDEX IF NOT EXISTS ix_unit_types_project_id ON unit_types(project_id);

-- 5. Units — Individual sellable units (inventory rows) inside a project.
CREATE TABLE IF NOT EXISTS units (
  unit_id                    VARCHAR(20) PRIMARY KEY,
  project_id                 VARCHAR(20) NOT NULL,
  unit_type_id               VARCHAR(20),
  unit_code                  VARCHAR(255),
  category                   VARCHAR(60) NOT NULL CHECK (category IN ('Apartment', 'Duplex', 'Penthouse', 'Studio', 'Townhouse', 'Twinhouse', 'Standalone Villa', 'Chalet', 'Cabin', 'Serviced Apartment', 'Office', 'Clinic', 'Retail Store', 'Pharmacy')),
  bedrooms                   INTEGER NOT NULL,
  bathrooms                  INTEGER,
  built_up_area_sqm          NUMERIC(16,2) NOT NULL,
  garden_area_sqm            NUMERIC(16,2),
  roof_area_sqm              NUMERIC(16,2),
  floor_number               VARCHAR(255),
  price_egp                  NUMERIC(16,2),
  payment_plan_id            VARCHAR(20),
  availability               VARCHAR(60) NOT NULL CHECK (availability IN ('Available', 'Reserved', 'Sold')),
  finishing                  VARCHAR(60) CHECK (finishing IN ('Fully Finished', 'Finished with ACs', 'Semi-Finished', 'Core & Shell', 'Not Finished')),
  orientation                VARCHAR(60) CHECK (orientation IN ('N', 'S', 'E', 'W', 'NE', 'NW', 'SE', 'SW')),
  view                       VARCHAR(60) CHECK (view IN ('Garden', 'Lagoon', 'Sea', 'Pool', 'Landscape', 'Golf', 'Street', 'Corner')),
  delivery_date              DATE,
  floor_plan_image           VARCHAR(500),
  status                     VARCHAR(60) NOT NULL CHECK (status IN ('active', 'coming_soon', 'archived')),
  sort_order                 INTEGER,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_units_project_id FOREIGN KEY (project_id) REFERENCES projects(project_id),
  CONSTRAINT fk_units_unit_type_id FOREIGN KEY (unit_type_id) REFERENCES unit_types(unit_type_id),
  CONSTRAINT fk_units_payment_plan_id FOREIGN KEY (payment_plan_id) REFERENCES payment_plans(payment_plan_id)
);
CREATE INDEX IF NOT EXISTS ix_units_project_id ON units(project_id);
CREATE INDEX IF NOT EXISTS ix_units_unit_type_id ON units(unit_type_id);
CREATE INDEX IF NOT EXISTS ix_units_payment_plan_id ON units(payment_plan_id);

-- 6. Project Amenities — One row per amenity offered by a project (many amenities per project).
CREATE TABLE IF NOT EXISTS project_amenities (
  project_amenity_id         VARCHAR(20) PRIMARY KEY,
  project_id                 VARCHAR(20) NOT NULL,
  amenity                    VARCHAR(60) NOT NULL CHECK (amenity IN ('Clubhouse', 'Swimming Pools', 'Gym & Spa', 'Kids Area', '24/7 Security', 'Gated Community', 'Retail Strip', 'Mosque', 'Medical Center', 'International School', 'Sports Courts', 'Cycling & Jogging Tracks', 'Central Park', 'Crystal Lagoon', 'Business Hub', 'Smart Home', 'Beach Access', 'Marina')),
  category                   VARCHAR(60) NOT NULL CHECK (category IN ('Leisure & Clubhouse', 'Sports & Fitness', 'Security & Access', 'Retail & F&B', 'Health & Wellness', 'Education', 'Green & Open Spaces', 'Infrastructure & Smart')),
  notes_en                   VARCHAR(255),
  notes_ar                   VARCHAR(255),
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_project_amenities_project_id FOREIGN KEY (project_id) REFERENCES projects(project_id)
);
CREATE INDEX IF NOT EXISTS ix_project_amenities_project_id ON project_amenities(project_id);

-- 7. Payment Plans — Named payment structures offered on a project (down payment + tenor).
CREATE TABLE IF NOT EXISTS payment_plans (
  payment_plan_id            VARCHAR(16) PRIMARY KEY,
  project_id                 VARCHAR(20) NOT NULL,
  name_en                    VARCHAR(255) NOT NULL,
  name_ar                    VARCHAR(255) NOT NULL,
  down_payment_pct           NUMERIC(16,2) NOT NULL,
  installment_years          INTEGER NOT NULL,
  installment_frequency      VARCHAR(60) NOT NULL CHECK (installment_frequency IN ('Monthly', 'Quarterly', 'Semi-Annual', 'Annual')),
  delivery_payment_pct       NUMERIC(16,2),
  maintenance_pct            NUMERIC(16,2),
  cash_discount_pct          NUMERIC(16,2),
  valid_until                DATE,
  notes_en                   VARCHAR(255),
  notes_ar                   VARCHAR(255),
  status                     VARCHAR(60) NOT NULL CHECK (status IN ('active', 'coming_soon', 'archived')),
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_payment_plans_project_id FOREIGN KEY (project_id) REFERENCES projects(project_id)
);
CREATE INDEX IF NOT EXISTS ix_payment_plans_project_id ON payment_plans(project_id);

-- 8. Developers & Projects Mapping — Bridge for projects co-developed by more than one company (joint ventures).
CREATE TABLE IF NOT EXISTS developer_project_map (
  map_id                     VARCHAR(16) PRIMARY KEY,
  developer_id               VARCHAR(20) NOT NULL,
  project_id                 VARCHAR(20) NOT NULL,
  role                       VARCHAR(60) NOT NULL CHECK (role IN ('Lead Developer', 'Co-Developer', 'Master Developer', 'Main Contractor', 'Consultant')),
  ownership_pct              NUMERIC(16,2),
  notes_en                   VARCHAR(255),
  notes_ar                   VARCHAR(255),
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_developer_project_map_developer_id FOREIGN KEY (developer_id) REFERENCES developers(developer_id),
  CONSTRAINT fk_developer_project_map_project_id FOREIGN KEY (project_id) REFERENCES projects(project_id)
);
CREATE INDEX IF NOT EXISTS ix_developer_project_map_developer_id ON developer_project_map(developer_id);
CREATE INDEX IF NOT EXISTS ix_developer_project_map_project_id ON developer_project_map(project_id);

COMMIT;