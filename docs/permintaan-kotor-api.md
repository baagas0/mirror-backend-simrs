# Permintaan Kotor API Documentation

## Overview

This document describes the API for managing permintaan kotor (dirty instrument requests) in the hospital sterilization workflow system. The module handles requests from various hospital units for instrument sterilization.

## Base Endpoints

All endpoints are available at: `/api/permintaan_kotor/`

## Data Models

### PermintaanKotor
```json
{
  "id": "uuid",
  "kode_permintaan": "PK-20251108-001",
  "nama_unit": "Ruang Operasi 1",
  "tanggal_permintaan": "2025-11-08",
  "status_permintaan": 1,
  "keterangan": "Instrumen untuk operasi sesar",
  "created_by": "uuid",
  "updated_by": "uuid",
  "created_at": "2025-11-08T10:30:00Z",
  "updated_at": "2025-11-08T10:30:00Z",
  "deleted_at": null
}
```

### PermintaanKotorList
```json
{
  "id": "uuid",
  "permintaan_kotor_id": "uuid",
  "ms_barang_id": "uuid",
  "jumlah": 5,
  "keterangan": "Set instrumen bedah",
  "created_at": "2025-11-08T10:30:00Z",
  "updated_at": "2025-11-08T10:30:00Z",
  "deleted_at": null
}
```

## Status Values

- **1**: Menunggu (Waiting)
- **2**: Diambil (Collected)
- **3**: Proses Sterilisasi (Sterilization Process)
- **4**: Selesai (Completed)

## API Endpoints

### 1. Create New Request
```http
POST /api/permintaan_kotor/register
```

**Request Body:**
```json
{
  "nama_unit": "Ruang Operasi 1",
  "tanggal_permintaan": "2025-11-08",
  "keterangan": "Instrumen untuk operasi sesar",
  "items": [
    {
      "ms_barang_id": "uuid_barang_1",
      "jumlah": 3,
      "keterangan": "Set instrumen bedah mayor"
    },
    {
      "ms_barang_id": "uuid_barang_2",
      "jumlah": 2,
      "keterangan": "Set instrumen minor"
    }
  ]
}
```

**Response:**
```json
{
  "status": 200,
  "message": "sukses",
  "data": {
    "id": "uuid",
    "kode_permintaan": "PK-20251108-001",
    "nama_unit": "Ruang Operasi 1",
    "tanggal_permintaan": "2025-11-08",
    "status_permintaan": 1,
    "keterangan": "Instrumen untuk operasi sesar",
    "items": [...]
  }
}
```

### 2. Update Request
```http
POST /api/permintaan_kotor/update
```

**Request Body:**
```json
{
  "id": "uuid",
  "nama_unit": "Ruang Operasi 2",
  "tanggal_permintaan": "2025-11-08",
  "status_permintaan": 2,
  "keterangan": "Updated keterangan",
  "items": [
    {
      "ms_barang_id": "uuid_barang_1",
      "jumlah": 5,
      "keterangan": "Updated jumlah"
    }
  ]
}
```

**Response:**
```json
{
  "status": 200,
  "message": "sukses"
}
```

### 3. Delete Request (Soft Delete)
```http
POST /api/permintaan_kotor/delete
```

**Request Body:**
```json
{
  "id": "uuid"
}
```

**Response:**
```json
{
  "status": 200,
  "message": "sukses"
}
```

### 4. Get Requests List
```http
POST /api/permintaan_kotor/list
```

**Request Body (Optional filters):**
```json
{
  "halaman": 1,
  "jumlah": 10,
  "nama_unit": "Ruang Operasi",
  "status_permintaan": 1,
  "tanggal_permintaan": "2025-11-08",
  "search": "operasi"
}
```

**Response:**
```json
{
  "status": 200,
  "message": "sukses",
  "data": [
    {
      "id": "uuid",
      "kode_permintaan": "PK-20251108-001",
      "nama_unit": "Ruang Operasi 1",
      "tanggal_permintaan": "2025-11-08",
      "status_permintaan": 1,
      "status_permintaan_text": "Menunggu",
      "keterangan": "Instrumen untuk operasi sesar",
      "created_by_name": "Admin User",
      "updated_by_name": "Admin User"
    }
  ],
  "count": 25,
  "jumlah": 10,
  "halaman": 1
}
```

### 5. Get Request Details by ID
```http
POST /api/permintaan_kotor/detailsById
```

**Request Body:**
```json
{
  "id": "uuid"
}
```

**Response:**
```json
{
  "status": 200,
  "message": "sukses",
  "data": {
    "id": "uuid",
    "kode_permintaan": "PK-20251108-001",
    "nama_unit": "Ruang Operasi 1",
    "tanggal_permintaan": "2025-11-08",
    "status_permintaan": 1,
    "status_permintaan_text": "Menunggu",
    "keterangan": "Instrumen untuk operasi sesar",
    "created_by_name": "Admin User",
    "updated_by_name": "Admin User",
    "items": [
      {
        "id": "uuid_item",
        "ms_barang_id": "uuid_barang",
        "nama_barang": "Set Instrumen Bedah Mayor",
        "kode_produk": "IBM-001",
        "jumlah": 3,
        "keterangan": "Set lengkap untuk operasi mayor"
      }
    ]
  }
}
```

### 6. Update Request Status
```http
POST /api/permintaan_kotor/updateStatus
```

**Request Body:**
```json
{
  "id": "uuid",
  "status_permintaan": 2
}
```

**Response:**
```json
{
  "status": 200,
  "message": "sukses"
}
```

### 7. Get Request Items
```http
POST /api/permintaan_kotor/getItems
```

**Request Body:**
```json
{
  "permintaan_kotor_id": "uuid"
}
```

**Response:**
```json
{
  "status": 200,
  "message": "sukses",
  "data": [
    {
      "id": "uuid_item",
      "ms_barang_id": "uuid_barang",
      "nama_barang": "Set Instrumen Bedah Mayor",
      "kode_produk": "IBM-001",
      "jumlah": 3,
      "keterangan": "Set lengkap untuk operasi mayor"
    }
  ]
}
```

### 8. Get Dashboard Statistics
```http
POST /api/permintaan_kotor/dashboard
```

**Request Body:** Empty

**Response:**
```json
{
  "status": 200,
  "message": "sukses",
  "data": {
    "total": 150,
    "menunggu": 12,
    "diambil": 25,
    "proses_sterilisasi": 8,
    "selesai": 105,
    "total_today": 15,
    "total_month": 87
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

1. **Data Not Found:**
   ```json
   {
     "status": 404,
     "message": "data tidak ditemukan"
   }
   ```

2. **Validation Error:**
   ```json
   {
     "status": 400,
     "message": "validation error"
   }
   ```

3. **Duplicate Data:**
   ```json
   {
     "status": 204,
     "message": "data sudah ada"
   }
   ```

## Request Code Generation

The system automatically generates unique request codes in the format:
`PK-YYYYMMDD-XXX`

- `PK`: Permintaan Kotor prefix
- `YYYYMMDD`: Current date
- `XXX`: Sequential number (001, 002, etc.)

## Workflow Process

1. **Create Request**: Unit creates new request with instrument list
2. **Status 1 (Menunggu)**: Request is waiting for collection
3. **Status 2 (Diambil)**: Instruments collected from unit
4. **Status 3 (Proses Sterilisasi)**: Instruments in sterilization process
5. **Status 4 (Selesai)**: Sterilization completed, instruments ready

## Security

All endpoints require authentication via JWT token in the `Authorization` header.

## Performance Considerations

- Indexes are created on frequently queried columns
- Pagination is supported for list endpoints
- Soft delete is implemented (data is not permanently removed)

## Database Schema

### permintaan_kotor table:
- Primary key: `id` (UUID)
- Unique constraint: `kode_permintaan`
- Foreign keys: `created_by`, `updated_by`, `deleted_by` (to users table)

### permintaan_kotor_list table:
- Primary key: `id` (UUID)
- Foreign keys: `permintaan_kotor_id`, `ms_barang_id`
- Unique constraint: (`permintaan_kotor_id`, `ms_barang_id`) for non-deleted records

## Migration

Run the migration script to create the tables:
```sql
-- File: migrations/002_create_permintaan_kotor_tables.sql
```

This script will:
- Create both tables with proper constraints
- Add indexes for performance
- Set up triggers for timestamp management
- Add comments for documentation

## Usage Examples

### Complete Workflow Example

1. **Create new request:**
```bash
curl -X POST http://localhost:3000/api/permintaan_kotor/register \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nama_unit": "Ruang Operasi 1",
    "tanggal_permintaan": "2025-11-08",
    "keterangan": "Instrumen untuk operasi sesar",
    "items": [
      {
        "ms_barang_id": "uuid_barang_1",
        "jumlah": 3,
        "keterangan": "Set instrumen bedah mayor"
      }
    ]
  }'
```

2. **Update status:**
```bash
curl -X POST http://localhost:3000/api/permintaan_kotor/updateStatus \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "uuid_permintaan",
    "status_permintaan": 2
  }'
```

3. **Get dashboard stats:**
```bash
curl -X POST http://localhost:3000/api/permintaan_kotor/dashboard \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

## Integration Notes

- This module integrates with the `ms_barang` table for item information
- Users are tracked for create, update, and delete operations
- All timestamps are stored in UTC
- The system supports filtering and searching on multiple fields