// File: backend/src/db.js
import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:@localhost:5432/it_asset_db?schema=public';

export const pool = new Pool({
  connectionString,
  max: 20, // Connection pool limit for high performance
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 3000,
});

export let isPostgresConnected = false;

// Native PostgreSQL DDL with Indexes for high query performance
export const DDL_SCHEMA = `
-- 1. Ekstensi UUID Generator Bawaan PostgreSQL
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Master Kategori Perangkat
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  useful_life_years INT NOT NULL DEFAULT 4,
  salvage_percentage NUMERIC(5,2) NOT NULL DEFAULT 5.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Master Lokasi Fisik / Gudang / Meja Kerja
CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  branch_name VARCHAR(100) NOT NULL,
  room_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Master Aset Teknologi Informasi
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_tag VARCHAR(50) NOT NULL UNIQUE,
  serial_number VARCHAR(100) NOT NULL UNIQUE,
  model_name VARCHAR(150) NOT NULL,
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  location_id INT REFERENCES locations(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('available', 'assigned', 'maintenance', 'retired', 'lost')),
  purchase_date DATE NOT NULL,
  purchase_price NUMERIC(15,2) NOT NULL,
  useful_life_years INT NOT NULL DEFAULT 4,
  salvage_value NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  current_holder VARCHAR(150),
  image_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for lightning fast lookups and high performance
CREATE INDEX IF NOT EXISTS idx_assets_tag ON assets(asset_tag);
CREATE INDEX IF NOT EXISTS idx_assets_serial ON assets(serial_number);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category_id);

-- 5. Riwayat Sirkulasi Penugasan (Check-out & Check-in)
CREATE TABLE IF NOT EXISTS asset_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  employee_name VARCHAR(150) NOT NULL,
  employee_id_number VARCHAR(50) NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  returned_at TIMESTAMP WITH TIME ZONE,
  condition_on_checkout TEXT NOT NULL,
  condition_on_return TEXT,
  handover_doc_path VARCHAR(255),
  assigned_by VARCHAR(100) NOT NULL,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_assignments_asset ON asset_assignments(asset_id);
CREATE INDEX IF NOT EXISTS idx_assignments_employee ON asset_assignments(employee_id_number);

-- 6. Log Pemeliharaan dan Riwayat Servis Fisik
CREATE TABLE IF NOT EXISTS maintenance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  service_date DATE NOT NULL,
  completion_date DATE,
  vendor_name VARCHAR(150) NOT NULL,
  issue_description TEXT NOT NULL,
  cost NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  invoice_path VARCHAR(255),
  logged_by VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_maintenance_asset ON maintenance_logs(asset_id);

-- 7. Audit Trail Transaksional (Memanfaatkan PostgreSQL JSONB)
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  table_name VARCHAR(50) NOT NULL,
  record_id VARCHAR(50) NOT NULL,
  action_type VARCHAR(20) NOT NULL,
  changed_by VARCHAR(100) NOT NULL,
  payload_before JSONB,
  payload_after JSONB,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_table_record ON audit_logs(table_name, record_id);
`;

export async function initDatabase() {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database: it_asset_db (Laragon)');
    isPostgresConnected = true;

    await client.query(DDL_SCHEMA);
    console.log('✅ PostgreSQL Schema and Performance Indexes ready.');

    const catCheck = await client.query('SELECT COUNT(*) FROM categories');
    if (parseInt(catCheck.rows[0].count, 10) === 0) {
      console.log('🌱 Seeding initial database...');
      const { seedDatabase } = await import('./seed.js');
      await seedDatabase(client);
    }

    client.release();
    return true;
  } catch (err) {
    console.warn('⚠️ PostgreSQL connection standby mode:', err.message);
    isPostgresConnected = false;
    initMockStore();
    return false;
  }
}

let mockStore = null;
const DATA_FILE = path.resolve('./uploads/local_backup_data.json');

export function initMockStore() {
  if (mockStore) return mockStore;
  if (fs.existsSync(DATA_FILE)) {
    try {
      mockStore = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      return mockStore;
    } catch (e) {
      console.error('Error reading local data file:', e);
    }
  }

  mockStore = {
    categories: [],
    locations: [],
    assets: [],
    asset_assignments: [],
    maintenance_logs: [],
    audit_logs: []
  };
  return mockStore;
}

export function saveMockStore() {
  try {
    if (!fs.existsSync('./uploads')) {
      fs.mkdirSync('./uploads', { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(mockStore, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving mock store:', err);
  }
}

export function getMockStore() {
  if (!mockStore) initMockStore();
  return mockStore;
}
