# API Documentation - Laboratorium Pengambilan Sampel

## Overview
Dokumentasi ini menjelaskan API untuk pengambilan sampel laboratorium yang lebih kompleks dari sistem sebelumnya yang hanya update tanggal_ambil_sampel.

## Base URL
`/api/lab_pengambilan_sampel`

## Endpoints

### 1. Create Pengambilan Sampel
**POST** `/api/lab_pengambilan_sampel`

Membuat record baru untuk pengambilan sampel.

**Request Body:**
```json
{
  "lab_regis_id": "string (required)",
  "petugas_ambil_id": "string (required)",
  "tanggal_ambil": "date (required)",
  "volume_sampel": "string (optional)",
  "kondisi_sampel": "string (optional)",
  "lokasi_ambil": "string (optional)",
  "tipe_sampel": "string (optional)",
  "no_rak": "string (optional)",
  "suhu_penyimpanan": "string (optional)",
  "catatan_pengambilan": "text (optional)"
}
```

**Response:**
```json
{
  "status": 201,
  "message": "Pengambilan sampel berhasil dibuat",
  "data": {
    "id": "uuid",
    "lab_regis_id": "string",
    "petugas_ambil_id": "string",
    "tanggal_ambil": "date",
    "status_pengambilan": 0,
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

### 2. Start Pengambilan Sampel
**PUT** `/api/lab_pengambilan_sampel/:id/start`

Memulai proses pengambilan sampel.

**Request Body:**
```json
{
  "petugas_ambil_id": "string (required)"
}
```

**Response:**
```json
{
  "status": 200,
  "message": "Pengambilan sampel dimulai",
  "data": {
    "id": "uuid",
    "status_pengambilan": 1,
    "waktu_mulai": "timestamp",
    "petugas_ambil_id": "string"
  }
}
```

### 3. Finish Pengambilan Sampel
**PUT** `/api/lab_pengambilan_sampel/:id/finish`

Menyelesaikan proses pengambilan sampel.

**Request Body:**
```json
{
  "volume_sampel": "string (optional)",
  "kondisi_sampel": "string (optional)",
  "lokasi_ambil": "string (optional)",
  "tipe_sampel": "string (optional)",
  "no_rak": "string (optional)",
  "suhu_penyimpanan": "string (optional)",
  "catatan_pengambilan": "text (optional)",
  "keterangan": "text (optional)"
}
```

**Response:**
```json
{
  "status": 200,
  "message": "Pengambilan sampel selesai",
  "data": {
    "id": "uuid",
    "status_pengambilan": 2,
    "waktu_selesai": "timestamp",
    "volume_sampel": "string",
    "kondisi_sampel": "string",
    // ... other fields
  }
}
```

### 4. Cancel Pengambilan Sampel
**PUT** `/api/lab_pengambilan_sampel/:id/cancel`

Membatalkan proses pengambilan sampel.

**Request Body:**
```json
{
  "keterangan": "text (optional)"
}
```

**Response:**
```json
{
  "status": 200,
  "message": "Pengambilan sampel dibatalkan",
  "data": {
    "id": "uuid",
    "status_pengambilan": 3,
    "keterangan": "string"
  }
}
```

### 5. Get Pengambilan Sampel by ID
**GET** `/api/lab_pengambilan_sampel/:id`

Mendapatkan detail pengambilan sampel berdasarkan ID.

**Response:**
```json
{
  "status": 200,
  "message": "Data pengambilan sampel berhasil diambil",
  "data": {
    "id": "uuid",
    "lab_regis_id": "string",
    "petugas_ambil_id": "string",
    "tanggal_ambil": "date",
    "status_pengambilan": 0,
    "labRegis": {
      "id": "uuid",
      "keterangan_lab_regis": "string",
      "dokter": {
        "id": "uuid",
        "nama_dokter": "string"
      }
    },
    "petugasAmbil": {
      "id": "uuid",
      "nama_dokter": "string"
    }
  }
}
```

### 6. Get Pengambilan Sampel by Lab Regis ID
**GET** `/api/lab_pengambilan_sampel/lab-regis/:lab_regis_id`

Mendapatkan semua pengambilan sampel berdasarkan ID registrasi lab.

**Response:**
```json
{
  "status": 200,
  "message": "Data pengambilan sampel berhasil diambil",
  "data": [
    {
      "id": "uuid",
      "lab_regis_id": "string",
      "petugas_ambil_id": "string",
      "tanggal_ambil": "date",
      "status_pengambilan": 0,
      "petugasAmbil": {
        "id": "uuid",
        "nama_dokter": "string"
      }
    }
  ]
}
```

### 7. Get All Pengambilan Sampel
**GET** `/api/lab_pengambilan_sampel`

Mendapatkan semua data pengambilan sampel dengan pagination dan filter.

**Query Parameters:**
- `page` (number, optional): Halaman saat ini (default: 1)
- `limit` (number, optional): Jumlah data per halaman (default: 10)
- `status` (number, optional): Filter status pengambilan (0, 1, 2, 3)
- `tanggal_mulai` (date, optional): Filter tanggal mulai
- `tanggal_selesai` (date, optional): Filter tanggal selesai
- `petugas_ambil_id` (string, optional): Filter petugas pengambil

**Response:**
```json
{
  "status": 200,
  "message": "Data pengambilan sampel berhasil diambil",
  "data": {
    "data": [...],
    "total": 100,
    "page": 1,
    "totalPages": 10,
    "limit": 10
  }
}
```

### 8. Sync to Satu Sehat
**POST** `/api/lab_pengambilan_sampel/:id/sync-satu-sehat`

Sinkronisasi data pengambilan sampel ke Satu Sehat.

**Response:**
```json
{
  "status": 200,
  "message": "Data berhasil disinkronkan ke Satu Sehat",
  "data": {
    "id": "uuid",
    "is_sync_satu_sehat": true,
    "sync_satu_sehat_at": "timestamp",
    "satu_sehat_id": "string"
  }
}
```

## Status Pengambilan Sampel
- `0`: Pending - Menunggu proses pengambilan
- `1`: Sedang Diambil - Proses pengambilan sedang berlangsung
- `2`: Selesai - Sampel berhasil diambil
- `3`: Gagal - Pengambilan sampel gagal/dibatalkan

## Integration with Lab Regis Routes

### Additional Routes in `/api/lab_regis`:

1. **POST** `/:id/pengambilan-sampel` - Membuat pengambilan sampel dari lab_regis
2. **POST** `/:id/start-pengambilan-sampel` - Memulai pengambilan sampel
3. **POST** `/:id/finish-pengambilan-sampel` - Menyelesaikan pengambilan sampel
4. **GET** `/:lab_regis_id/pengambilan-sampel` - Mendapatkan pengambilan sampel berdasarkan lab_regis_id

## Database Schema

### lab_pengambilan_sampel table:
```sql
CREATE TABLE lab_pengambilan_sampel (
    id VARCHAR(255) PRIMARY KEY,
    lab_regis_id VARCHAR(255) NOT NULL,
    petugas_ambil_id VARCHAR(255) NOT NULL,
    tanggal_ambil DATE NOT NULL,
    waktu_mulai TIMESTAMP NULL,
    waktu_selesai TIMESTAMP NULL,
    status_pengambilan SMALLINT DEFAULT 0,
    keterangan TEXT NULL,
    volume_sampel VARCHAR(255) NULL,
    kondisi_sampel VARCHAR(255) NULL,
    lokasi_ambil VARCHAR(255) NULL,
    tipe_sampel VARCHAR(255) NULL,
    no_rak VARCHAR(255) NULL,
    suhu_penyimpanan VARCHAR(255) NULL,
    catatan_pengambilan TEXT NULL,
    is_sync_satu_sehat BOOLEAN DEFAULT FALSE,
    sync_satu_sehat_at TIMESTAMP NULL,
    satu_sehat_id VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);
```

## Integration dengan Satu Sehat

Sistem ini sudah disiapkan untuk integrasi dengan Satu Sehat dengan:

1. **Flag sinkronisasi**: `is_sync_satu_sehat` untuk tracking status sync
2. **Timestamp sync**: `sync_satu_sehat_at` untuk waktu sinkronisasi
3. **External ID**: `satu_sehat_id` untuk menyimpan ID dari Satu Sehat
4. **Endpoint sync**: `/sync-satu-sehat` untuk proses sinkronisasi

## Flow Proses

1. **Registrasi Lab** → Status 0 (new)
2. **Create Pengambilan Sampel** → Record dibuat dengan status_pengambilan = 0 (pending)
3. **Start Pengambilan** → Status lab_regis = 1 (proses), status_pengambilan = 1 (sedang diambil)
4. **Finish Pengambilan** → Status lab_regis = 2 (sampel), status_pengambilan = 2 (selesai)
5. **Create Lab Hasil** → Status lab_regis = 3 (hasil)

## Error Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error