# INACBG Workflow API Documentation

## Overview

This document describes the INACBG workflow management API that provides complete tracking of eklaim/INACBG integration process. The system tracks all 16 workflow stages from new claim to claim status checking.

## Workflow Stages

The INACBG integration follows these 16 stages:

1. **new_claim** - Create new claim
2. **update_patient** (Optional) - Update patient data
3. **set_claim_data** - Set claim data
4. **idrg_diagnosa_set** - Set IDRG diagnosis
5. **idrg_prosedur_set** - Set IDRG procedures
6. **grouper_idrg_stage_1** - IDRG grouper stage 1
7. **idrg_grouper_final** - IDRG final grouper
8. **idrg_to_inacbg_import** - Import IDRG to INACBG
9. **inacbg_diagnosa_set** (Optional) - Set INACBG diagnosis
10. **inacbg_prosedur_set** (Optional) - Set INACBG procedures
11. **grouper_inacbg_stage_1** - INACBG grouper stage 1
12. **grouper_inacbg_stage_2** (Optional) - INACBG grouper stage 2
13. **inacbg_grouper_final** - INACBG final grouper
14. **claim_final** - Final claim
15. **send_claim_individual** - Send individual claim
16. **get_claim_status** (Optional) - Check claim status

## Base Endpoints

All endpoints are available at: `/api/inacbg/`

### Core Workflow Endpoints

#### 1. New Claim
```http
POST /api/inacbg/new_claim
```

**Request Body:**
```json
{
  "registrasi_id": "string"
}
```

**Response:**
```json
{
  "status": 200,
  "message": "sukses",
  "data": [...],
  "count": 0,
  "history_id": "uuid"
}
```

#### 2. Set Claim Data
```http
POST /api/inacbg/set_claim_data
```

**Request Body:**
```json
{
  "nomor_sep": "string",
  "nomor_kartu": "string",
  "tgl_masuk": "YYYY-MM-DD HH:mm:ss",
  "tgl_pulang": "YYYY-MM-DD HH:mm:ss",
  "cara_masuk": "number",
  "jenis_rawat": "number",
  "kelas_rawat": "number",
  // ... other claim data fields
}
```

#### 3. IDRG Diagnosis Set
```http
POST /api/inacbg/idrg_diagnosa_set
```

**Request Body:**
```json
{
  "nomor_sep": "string",
  "diagnosa": [
    {
      "kode_diagnosa": "string",
      "level_diagnosa": "number"
    }
  ]
}
```

#### 4. IDRG Procedure Set
```http
POST /api/inacbg/idrg_prosedur_set
```

**Request Body:**
```json
{
  "nomor_sep": "string",
  "procedure": [
    {
      "kode_prosedur": "string",
      "sub_klas": "string"
    }
  ]
}
```

#### 5. Grouper IDRG Stage 1
```http
POST /api/inacbg/grouper_idrg_stage_1
```

**Request Body:**
```json
{
  "nomor_sep": "string"
}
```

### Workflow Management Endpoints

#### Get Workflow History
```http
POST /api/inacbg/workflow/history
```

**Request Body:**
```json
{
  "nomor_sep": "string"
}
```

**Response:**
```json
{
  "status": 200,
  "message": "sukses",
  "data": {
    "nomor_sep": "string",
    "tagihan_id": "string",
    "current_stage": 5,
    "overall_status": "PROCESSING",
    "error_message": null,
    "kode_tarif": "R123",
    "tarif_tarif": 15000000,
    "cbg_code": "C123",
    "stages": [
      {
        "stage": 1,
        "name": "new_claim",
        "status": true,
        "date": "2025-11-08T10:30:00Z",
        "hasRequest": true,
        "hasResponse": true
      },
      // ... other stages
    ],
    "completed_at": "2025-11-08T14:45:00Z"
  }
}
```

#### Get Workflow Status
```http
POST /api/inacbg/workflow/status
```

**Request Body:**
```json
{
  "nomor_sep": "string"
}
```

**Response:**
```json
{
  "status": 200,
  "message": "sukses",
  "data": {
    "current_stage": 3,
    "overall_status": "PROCESSING",
    "error_message": null,
    "next_available_stages": [
      {
        "stage": 4,
        "name": "idrg_diagnosa_set",
        "description": "Set Diagnosa IDRG"
      },
      {
        "stage": 5,
        "name": "idrg_prosedur_set",
        "description": "Set Prosedur IDRG"
      }
    ],
    "is_completed": false,
    "final_tarif": {
      "kode_tarif": null,
      "tarif_tarif": null,
      "cbg_code": null,
      "special_cmg": null,
      "severity_level": null
    }
  }
}
```

#### Reset Workflow
```http
POST /api/inacbg/workflow/reset
```

**Request Body:**
```json
{
  "nomor_sep": "string",
  "reset_to_stage": 0
}
```

**Response:**
```json
{
  "status": 200,
  "message": "Workflow berhasil direset",
  "data": {
    // Updated history object
  }
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "status": 500,
  "message": "gagal",
  "data": "Error message details"
}
```

### Common Error Scenarios

1. **Workflow Stage Not Executable:**
   ```json
   {
     "status": 400,
     "message": "Workflow stage tidak dapat dieksekusi. Pastikan stage sebelumnya sudah selesai."
   }
   ```

2. **History Not Found:**
   ```json
   {
     "status": 404,
     "message": "History eklaim tidak ditemukan"
   }
   ```

3. **Registrasi Not Found:**
   ```json
   {
     "status": 404,
     "message": "Registrasi tidak ditemukan"
   }
   ```

## Workflow Status Values

- **PENDING**: Workflow has not started
- **PROCESSING**: Workflow is in progress
- **COMPLETED**: All required stages completed successfully
- **FAILED**: Workflow failed due to error

## Tariff Information

The system tracks tariff information from grouper responses:

- **kode_tarif**: Final tariff code from grouper
- **tarif_tarif**: Final tariff amount
- **deskripsi_tarif**: Tariff description
- **cbg_code**: CBG/INA-CBG code
- **special_cmg**: Special CMG code
- **severity_level**: Severity level (1-3)

## Usage Examples

### Complete Workflow Example

1. **Start new claim:**
```bash
curl -X POST http://localhost:3000/api/inacbg/new_claim \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"registrasi_id": "uuid"}'
```

2. **Set claim data:**
```bash
curl -X POST http://localhost:3000/api/inacbg/set_claim_data \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"nomor_sep": "1234567890", ...}'
```

3. **Check workflow status:**
```bash
curl -X POST http://localhost:3000/api/inacbg/workflow/status \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"nomor_sep": "1234567890"}'
```

4. **Get complete history:**
```bash
curl -X POST http://localhost:3000/api/inacbg/workflow/history \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"nomor_sep": "1234567890"}'
```

## Database Schema

The `history_eklaim` table contains:
- All 16 stage-specific request/response columns
- Workflow status tracking fields
- Tariff information fields
- Timestamps for each stage
- Proper indexing for performance

## Security

All endpoints require authentication via JWT token in the `Authorization` header.

## Performance Considerations

- Indexes are created on frequently queried columns
- JSONB type is used for efficient JSON storage
- Batch operations are recommended for multiple claims

## Migration

Run the migration script to update the database schema:
```sql
-- File: migrations/001_update_history_eklaim_table.sql
```

This script will:
- Add all new columns for workflow stages
- Create indexes for performance
- Add comments for documentation
- Maintain backward compatibility