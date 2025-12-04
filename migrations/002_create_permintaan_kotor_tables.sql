-- Migration: Create permintaan_kotor and permintaan_kotor_list tables
-- Date: 2025-11-08
-- Description: Create tables for managing dirty instruments/requests from units

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create permintaan_kotor table
CREATE TABLE IF NOT EXISTS permintaan_kotor (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kode_permintaan VARCHAR(50) NOT NULL UNIQUE,
    nama_unit VARCHAR(255) NOT NULL,
    tanggal_permintaan DATE NOT NULL,
    status_permintaan INTEGER NOT NULL DEFAULT 1,
    keterangan TEXT,
    created_by UUID,
    updated_by UUID,
    deleted_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Add constraints for status_permintaan
    CONSTRAINT chk_status_permintaan CHECK (status_permintaan IN (1, 2, 3, 4))
);

-- Create permintaan_kotor_list table
CREATE TABLE IF NOT EXISTS permintaan_kotor_list (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    permintaan_kotor_id UUID NOT NULL,
    ms_barang_id UUID NOT NULL,
    jumlah INTEGER NOT NULL DEFAULT 1,
    keterangan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Add constraints
    CONSTRAINT fk_permintaan_kotor_list_permintaan
        FOREIGN KEY (permintaan_kotor_id) REFERENCES permintaan_kotor(id) ON DELETE CASCADE,
    CONSTRAINT fk_permintaan_kotor_list_barang
        FOREIGN KEY (ms_barang_id) REFERENCES ms_barang(id) ON DELETE RESTRICT,
    CONSTRAINT chk_jumlah_positive CHECK (jumlah > 0)
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_permintaan_kotor_kode_permintaan ON permintaan_kotor(kode_permintaan);
CREATE INDEX IF NOT EXISTS idx_permintaan_kotor_nama_unit ON permintaan_kotor(nama_unit);
CREATE INDEX IF NOT EXISTS idx_permintaan_kotor_tanggal_permintaan ON permintaan_kotor(tanggal_permintaan);
CREATE INDEX IF NOT EXISTS idx_permintaan_kotor_status_permintaan ON permintaan_kotor(status_permintaan);
CREATE INDEX IF NOT EXISTS idx_permintaan_kotor_created_at ON permintaan_kotor(created_at);

CREATE INDEX IF NOT EXISTS idx_permintaan_kotor_list_permintaan_id ON permintaan_kotor_list(permintaan_kotor_id);
CREATE INDEX IF NOT EXISTS idx_permintaan_kotor_list_ms_barang_id ON permintaan_kotor_list(ms_barang_id);
CREATE INDEX IF NOT EXISTS idx_permintaan_kotor_list_created_at ON permintaan_kotor_list(created_at);

-- Create unique constraint for permintaan_kotor_list (no duplicate items in same request)
CREATE UNIQUE INDEX IF NOT EXISTS idx_permintaan_kotor_list_unique
    ON permintaan_kotor_list(permintaan_kotor_id, ms_barang_id)
    WHERE deleted_at IS NULL;

-- Add comments to tables and columns
COMMENT ON TABLE permintaan_kotor IS 'Table for managing dirty instrument requests from hospital units';
COMMENT ON TABLE permintaan_kotor_list IS 'Table for storing items in each dirty instrument request';

COMMENT ON COLUMN permintaan_kotor.id IS 'Primary key (UUID)';
COMMENT ON COLUMN permintaan_kotor.kode_permintaan IS 'Unique request code (PK-YYYYMMDD-XXX)';
COMMENT ON COLUMN permintaan_kotor.nama_unit IS 'Unit/department name making the request';
COMMENT ON COLUMN permintaan_kotor.tanggal_permintaan IS 'Date when request was made';
COMMENT ON COLUMN permintaan_kotor.status_permintaan IS '1: menunggu, 2: diambil, 3: proses sterilisasi, 4: selesai';
COMMENT ON COLUMN permintaan_kotor.keterangan IS 'Additional notes or description';

COMMENT ON COLUMN permintaan_kotor_list.id IS 'Primary key (UUID)';
COMMENT ON COLUMN permintaan_kotor_list.permintaan_kotor_id IS 'Foreign key to permintaan_kotor table';
COMMENT ON COLUMN permintaan_kotor_list.ms_barang_id IS 'Foreign key to ms_barang (master item) table';
COMMENT ON COLUMN permintaan_kotor_list.jumlah IS 'Quantity requested for each item';
COMMENT ON COLUMN permintaan_kotor_list.keterangan IS 'Additional notes for specific item';

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for both tables
CREATE TRIGGER update_permintaan_kotor_updated_at
    BEFORE UPDATE ON permintaan_kotor
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permintaan_kotor_list_updated_at
    BEFORE UPDATE ON permintaan_kotor_list
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- Migration completed successfully