BEGIN;

CREATE TABLE IF NOT EXISTS products (
  id text NOT NULL,
  company_id text NOT NULL,
  sku text NOT NULL,
  name text NOT NULL,
  presentation text NOT NULL DEFAULT '',
  barcode text NOT NULL,
  control_unit text NOT NULL,
  image_url text,
  active boolean NOT NULL DEFAULT true,
  package_conversion jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (company_id, id),
  UNIQUE (company_id, barcode)
);

CREATE TABLE IF NOT EXISTS production_needs (
  id text NOT NULL,
  company_id text NOT NULL,
  product_id text NOT NULL,
  target_quantity numeric(18,6) NOT NULL CHECK (target_quantity > 0),
  confirmed_progress_quantity numeric(18,6) NOT NULL DEFAULT 0 CHECK (confirmed_progress_quantity >= 0),
  registered_progress_quantity numeric(18,6) NOT NULL DEFAULT 0 CHECK (registered_progress_quantity >= 0),
  priority text NOT NULL CHECK (priority IN ('NORMAL','ATTENTION','URGENT')),
  status text NOT NULL CHECK (status IN ('OPEN','IN_PROGRESS','COMPLETED','CANCELLED')),
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  due_at timestamptz,
  note text,
  completed_at timestamptz,
  PRIMARY KEY (company_id, id)
);

CREATE INDEX IF NOT EXISTS production_needs_active_idx
  ON production_needs(company_id, product_id, status);

CREATE TABLE IF NOT EXISTS technical_sheets (
  id text NOT NULL,
  company_id text NOT NULL,
  product_id text NOT NULL,
  version text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (company_id, id)
);

CREATE INDEX IF NOT EXISTS technical_sheets_product_idx
  ON technical_sheets(company_id, product_id, active);

CREATE TABLE IF NOT EXISTS technical_sheet_items (
  company_id text NOT NULL,
  technical_sheet_id text NOT NULL,
  material_id text NOT NULL,
  material_name text NOT NULL,
  quantity_per_base numeric(18,6) NOT NULL CHECK (quantity_per_base >= 0),
  unit text NOT NULL,
  PRIMARY KEY (company_id, technical_sheet_id, material_id)
);

CREATE TABLE IF NOT EXISTS production_records (
  id text PRIMARY KEY,
  company_id text NOT NULL,
  user_id text NOT NULL,
  employee_id text NOT NULL,
  recorded_by_name text NOT NULL,
  product_id text NOT NULL,
  barcode text NOT NULL,
  declared_quantity numeric(18,6) NOT NULL CHECK (declared_quantity > 0),
  unit text NOT NULL,
  recorded_at timestamptz NOT NULL,
  local_recorded_at timestamptz,
  sync_status text NOT NULL CHECK (sync_status IN ('LOCAL_PENDING','SYNCED','SYNC_FAILED')),
  review_status text NOT NULL CHECK (review_status IN ('PENDING_REVIEW','CONFIRMED','DIVERGENT','CORRECTED')),
  source_device_id text,
  production_need_id text,
  idempotency_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS production_records_pending_idx
  ON production_records(company_id, product_id, review_status, recorded_at);
CREATE INDEX IF NOT EXISTS production_records_user_idx
  ON production_records(company_id, user_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS production_reviews (
  id text PRIMARY KEY,
  company_id text NOT NULL,
  product_id text NOT NULL,
  declared_total numeric(18,6) NOT NULL CHECK (declared_total >= 0),
  confirmed_quantity numeric(18,6) NOT NULL CHECK (confirmed_quantity > 0),
  difference_quantity numeric(18,6) NOT NULL,
  reviewer_user_id text NOT NULL,
  reviewed_at timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('CONFIRMED','DIVERGENT')),
  notes text,
  idempotency_key text NOT NULL,
  UNIQUE (company_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS production_review_items (
  review_id text NOT NULL,
  production_record_id text NOT NULL,
  declared_quantity numeric(18,6) NOT NULL,
  included_quantity numeric(18,6) NOT NULL,
  PRIMARY KEY (review_id, production_record_id)
);

CREATE TABLE IF NOT EXISTS stock_balances (
  company_id text NOT NULL,
  item_id text NOT NULL,
  item_kind text NOT NULL CHECK (item_kind IN ('FINISHED','MATERIAL')),
  quantity numeric(18,6) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (company_id, item_id, item_kind)
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id text PRIMARY KEY,
  company_id text NOT NULL,
  item_id text NOT NULL,
  type text NOT NULL CHECK (type IN ('FINISHED_GOODS_IN','MATERIAL_CONSUMED','MATERIAL_SHORTAGE')),
  quantity numeric(18,6) NOT NULL CHECK (quantity >= 0),
  reference_id text NOT NULL,
  created_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS stock_movements_ref_idx
  ON stock_movements(company_id, reference_id, created_at);

CREATE TABLE IF NOT EXISTS audit_events (
  id text PRIMARY KEY,
  company_id text NOT NULL,
  actor_user_id text NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  before_data jsonb,
  after_data jsonb,
  reason text,
  created_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS audit_events_entity_idx
  ON audit_events(company_id, entity_type, entity_id, created_at DESC);

COMMIT;
