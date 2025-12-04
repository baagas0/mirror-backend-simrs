-- Migration: Update history_eklaim table to support complete INACBG/IDRG workflow
-- Date: 2025-11-08
-- Description: Add columns for tracking all workflow stages and metadata

-- Add new columns for workflow stages
-- Make existing fields nullable temporarily for migration safety
ALTER TABLE history_eklaim ALTER COLUMN nomor_sep DROP NOT NULL;

-- Add required field tagihan_id if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='history_eklaim' AND column_name='tagihan_id') THEN
        ALTER TABLE history_eklaim ADD COLUMN tagihan_id VARCHAR;
    END IF;
END $$;

-- Stage 1: New Claim
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='history_eklaim' AND column_name='new_claim_request') THEN
        ALTER TABLE history_eklaim ADD COLUMN new_claim_request JSONB;
        ALTER TABLE history_eklaim ADD COLUMN new_claim_response JSONB;
        ALTER TABLE history_eklaim ADD COLUMN new_claim_status BOOLEAN DEFAULT FALSE;
        ALTER TABLE history_eklaim ADD COLUMN new_claim_date TIMESTAMP;
    END IF;
END $$;

-- Stage 2: Update Patient (Optional)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='history_eklaim' AND column_name='update_patient_request') THEN
        ALTER TABLE history_eklaim ADD COLUMN update_patient_request JSONB;
        ALTER TABLE history_eklaim ADD COLUMN update_patient_response JSONB;
        ALTER TABLE history_eklaim ADD COLUMN update_patient_status BOOLEAN DEFAULT FALSE;
        ALTER TABLE history_eklaim ADD COLUMN update_patient_date TIMESTAMP;
    END IF;
END $$;

-- Stage 3: Set Claim Data
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='history_eklaim' AND column_name='set_claim_data_request') THEN
        ALTER TABLE history_eklaim ADD COLUMN set_claim_data_request JSONB;
        ALTER TABLE history_eklaim ADD COLUMN set_claim_data_response JSONB;
        ALTER TABLE history_eklaim ADD COLUMN set_claim_data_status BOOLEAN DEFAULT FALSE;
        ALTER TABLE history_eklaim ADD COLUMN set_claim_data_date TIMESTAMP;
    END IF;
END $$;

-- Stage 4: IDRG Diagnosa Set
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='history_eklaim' AND column_name='idrg_diagnosa_request') THEN
        ALTER TABLE history_eklaim ADD COLUMN idrg_diagnosa_request JSONB;
        ALTER TABLE history_eklaim ADD COLUMN idrg_diagnosa_response JSONB;
        ALTER TABLE history_eklaim ADD COLUMN idrg_diagnosa_status BOOLEAN DEFAULT FALSE;
        ALTER TABLE history_eklaim ADD COLUMN idrg_diagnosa_date TIMESTAMP;
    END IF;
END $$;

-- Stage 5: IDRG Prosedur Set
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='history_eklaim' AND column_name='idrg_prosedur_request') THEN
        ALTER TABLE history_eklaim ADD COLUMN idrg_prosedur_request JSONB;
        ALTER TABLE history_eklaim ADD COLUMN idrg_prosedur_response JSONB;
        ALTER TABLE history_eklaim ADD COLUMN idrg_prosedur_status BOOLEAN DEFAULT FALSE;
        ALTER TABLE history_eklaim ADD COLUMN idrg_prosedur_date TIMESTAMP;
    END IF;
END $$;

-- Stage 6: Grouper IDRG Stage 1
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='history_eklaim' AND column_name='grouper_idrg_stage1_request') THEN
        ALTER TABLE history_eklaim ADD COLUMN grouper_idrg_stage1_request JSONB;
        ALTER TABLE history_eklaim ADD COLUMN grouper_idrg_stage1_response JSONB;
        ALTER TABLE history_eklaim ADD COLUMN grouper_idrg_stage1_status BOOLEAN DEFAULT FALSE;
        ALTER TABLE history_eklaim ADD COLUMN grouper_idrg_stage1_date TIMESTAMP;
    END IF;
END $$;

-- Stage 7: IDRG Grouper Final
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='history_eklaim' AND column_name='idrg_grouper_final_request') THEN
        ALTER TABLE history_eklaim ADD COLUMN idrg_grouper_final_request JSONB;
        ALTER TABLE history_eklaim ADD COLUMN idrg_grouper_final_response JSONB;
        ALTER TABLE history_eklaim ADD COLUMN idrg_grouper_final_status BOOLEAN DEFAULT FALSE;
        ALTER TABLE history_eklaim ADD COLUMN idrg_grouper_final_date TIMESTAMP;
    END IF;
END $$;

-- Stage 8: IDRG to INACBG Import
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='history_eklaim' AND column_name='idrg_to_inacbg_request') THEN
        ALTER TABLE history_eklaim ADD COLUMN idrg_to_inacbg_request JSONB;
        ALTER TABLE history_eklaim ADD COLUMN idrg_to_inacbg_response JSONB;
        ALTER TABLE history_eklaim ADD COLUMN idrg_to_inacbg_status BOOLEAN DEFAULT FALSE;
        ALTER TABLE history_eklaim ADD COLUMN idrg_to_inacbg_date TIMESTAMP;
    END IF;
END $$;

-- Stage 9: INACBG Diagnosa Set (Optional)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='history_eklaim' AND column_name='inacbg_diagnosa_request') THEN
        ALTER TABLE history_eklaim ADD COLUMN inacbg_diagnosa_request JSONB;
        ALTER TABLE history_eklaim ADD COLUMN inacbg_diagnosa_response JSONB;
        ALTER TABLE history_eklaim ADD COLUMN inacbg_diagnosa_status BOOLEAN DEFAULT FALSE;
        ALTER TABLE history_eklaim ADD COLUMN inacbg_diagnosa_date TIMESTAMP;
    END IF;
END $$;

-- Stage 10: INACBG Prosedur Set (Optional)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='history_eklaim' AND column_name='inacbg_prosedur_request') THEN
        ALTER TABLE history_eklaim ADD COLUMN inacbg_prosedur_request JSONB;
        ALTER TABLE history_eklaim ADD COLUMN inacbg_prosedur_response JSONB;
        ALTER TABLE history_eklaim ADD COLUMN inacbg_prosedur_status BOOLEAN DEFAULT FALSE;
        ALTER TABLE history_eklaim ADD COLUMN inacbg_prosedur_date TIMESTAMP;
    END IF;
END $$;

-- Stage 11: Grouper INACBG Stage 1
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='history_eklaim' AND column_name='grouper_inacbg_stage1_request') THEN
        ALTER TABLE history_eklaim ADD COLUMN grouper_inacbg_stage1_request JSONB;
        ALTER TABLE history_eklaim ADD COLUMN grouper_inacbg_stage1_response JSONB;
        ALTER TABLE history_eklaim ADD COLUMN grouper_inacbg_stage1_status BOOLEAN DEFAULT FALSE;
        ALTER TABLE history_eklaim ADD COLUMN grouper_inacbg_stage1_date TIMESTAMP;
    END IF;
END $$;

-- Stage 12: Grouper INACBG Stage 2 (Optional)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='history_eklaim' AND column_name='grouper_inacbg_stage2_request') THEN
        ALTER TABLE history_eklaim ADD COLUMN grouper_inacbg_stage2_request JSONB;
        ALTER TABLE history_eklaim ADD COLUMN grouper_inacbg_stage2_response JSONB;
        ALTER TABLE history_eklaim ADD COLUMN grouper_inacbg_stage2_status BOOLEAN DEFAULT FALSE;
        ALTER TABLE history_eklaim ADD COLUMN grouper_inacbg_stage2_date TIMESTAMP;
    END IF;
END $$;

-- Stage 13: INACBG Grouper Final
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='history_eklaim' AND column_name='inacbg_grouper_final_request') THEN
        ALTER TABLE history_eklaim ADD COLUMN inacbg_grouper_final_request JSONB;
        ALTER TABLE history_eklaim ADD COLUMN inacbg_grouper_final_response JSONB;
        ALTER TABLE history_eklaim ADD COLUMN inacbg_grouper_final_status BOOLEAN DEFAULT FALSE;
        ALTER TABLE history_eklaim ADD COLUMN inacbg_grouper_final_date TIMESTAMP;
    END IF;
END $$;

-- Stage 14: Claim Final
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='history_eklaim' AND column_name='claim_final_request') THEN
        ALTER TABLE history_eklaim ADD COLUMN claim_final_request JSONB;
        ALTER TABLE history_eklaim ADD COLUMN claim_final_response JSONB;
        ALTER TABLE history_eklaim ADD COLUMN claim_final_status BOOLEAN DEFAULT FALSE;
        ALTER TABLE history_eklaim ADD COLUMN claim_final_date TIMESTAMP;
    END IF;
END $$;

-- Stage 15: Send Claim Individual
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='history_eklaim' AND column_name='send_claim_request') THEN
        ALTER TABLE history_eklaim ADD COLUMN send_claim_request JSONB;
        ALTER TABLE history_eklaim ADD COLUMN send_claim_response JSONB;
        ALTER TABLE history_eklaim ADD COLUMN send_claim_status BOOLEAN DEFAULT FALSE;
        ALTER TABLE history_eklaim ADD COLUMN send_claim_date TIMESTAMP;
    END IF;
END $$;

-- Stage 16: Get Claim Status (Optional)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='history_eklaim' AND column_name='get_claim_status_request') THEN
        ALTER TABLE history_eklaim ADD COLUMN get_claim_status_request JSONB;
        ALTER TABLE history_eklaim ADD COLUMN get_claim_status_response JSONB;
        ALTER TABLE history_eklaim ADD COLUMN get_claim_status_date TIMESTAMP;
    END IF;
END $$;

-- Summary and metadata fields
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='history_eklaim' AND column_name='current_stage') THEN
        ALTER TABLE history_eklaim ADD COLUMN current_stage INTEGER DEFAULT 0;
        ALTER TABLE history_eklaim ADD COLUMN overall_status VARCHAR(20) DEFAULT 'PENDING';
        ALTER TABLE history_eklaim ADD COLUMN error_message TEXT;
        ALTER TABLE history_eklaim ADD COLUMN kode_tarif VARCHAR(50);
        ALTER TABLE history_eklaim ADD COLUMN tarif_tarif DECIMAL(15,2);
        ALTER TABLE history_eklaim ADD COLUMN deskripsi_tarif TEXT;
        ALTER TABLE history_eklaim ADD COLUMN cbg_code VARCHAR(50);
        ALTER TABLE history_eklaim ADD COLUMN special_cmg VARCHAR(50);
        ALTER TABLE history_eklaim ADD COLUMN severity_level INTEGER;
    END IF;
END $$;

-- Create indexes for performance optimization
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes
                   WHERE tablename='history_eklaim' AND indexname='idx_history_eklaim_nomor_sep') THEN
        CREATE INDEX idx_history_eklaim_nomor_sep ON history_eklaim(nomor_sep);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes
                   WHERE tablename='history_eklaim' AND indexname='idx_history_eklaim_tagihan_id') THEN
        CREATE INDEX idx_history_eklaim_tagihan_id ON history_eklaim(tagihan_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes
                   WHERE tablename='history_eklaim' AND indexname='idx_history_eklaim_overall_status') THEN
        CREATE INDEX idx_history_eklaim_overall_status ON history_eklaim(overall_status);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes
                   WHERE tablename='history_eklaim' AND indexname='idx_history_eklaim_current_stage') THEN
        CREATE INDEX idx_history_eklaim_current_stage ON history_eklaim(current_stage);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes
                   WHERE tablename='history_eklaim' AND indexname='idx_history_eklaim_new_claim_status') THEN
        CREATE INDEX idx_history_eklaim_new_claim_status ON history_eklaim(new_claim_status);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes
                   WHERE tablename='history_eklaim' AND indexname='idx_history_eklaim_send_claim_status') THEN
        CREATE INDEX idx_history_eklaim_send_claim_status ON history_eklaim(send_claim_status);
    END IF;
END $$;

-- Add comments to new columns
COMMENT ON COLUMN history_eklaim.current_stage IS 'Current workflow stage (1-16)';
COMMENT ON COLUMN history_eklaim.overall_status IS 'PENDING, PROCESSING, COMPLETED, FAILED';
COMMENT ON COLUMN history_eklaim.error_message IS 'Error message if any stage fails';
COMMENT ON COLUMN history_eklaim.kode_tarif IS 'Final tariff code from grouper';
COMMENT ON COLUMN history_eklaim.tarif_tarif IS 'Final tariff amount';
COMMENT ON COLUMN history_eklaim.deskripsi_tarif IS 'Tariff description';
COMMENT ON COLUMN history_eklaim.cbg_code IS 'CBG/INA-CBG code';
COMMENT ON COLUMN history_eklaim.special_cmg IS 'Special CMG code';
COMMENT ON COLUMN history_eklaim.severity_level IS 'Severity level (1-3)';

-- Make nomor_sep NOT NULL after migration (set constraint)
-- Note: This will fail if there are existing NULL values, handle accordingly
ALTER TABLE history_eklaim ALTER COLUMN nomor_sep SET NOT NULL;

COMMIT;

-- Migration completed successfully