Berikut **dokumen API** untuk modul **Financial** sesuai kebutuhan kamu — format konsisten dengan docs sebelumnya dan siap dipakai di Notion/Swagger.

---

# 📘 **Financial API Documentation**

## Base URL

```
/api/v1/financial
```

---

# 1. **GET /financial/revenue-vs-operational**

Mendapatkan perbandingan **pendapatan** vs **biaya operasional** untuk bulan berjalan (running month), termasuk tren pendapatan harian/mingguan/bulanan.

> **Catatan:** biaya operasional tidak tersedia → response tetap disediakan tetapi bernilai null.

---

### **Endpoint**

```
GET /api/v1/financial/revenue-vs-operational?trend={daily|weekly|monthly}
```

### **Query Parameters**

| Parameter | Tipe   | Wajib | Default | Contoh    |
| --------- | ------ | ----- | ------- | --------- |
| `trend`   | string | no    | `daily` | `monthly` |

### **Response (200)**

```json
{
  "success": true,
  "month": "2025-12",
  "total_revenue": 480000000,
  "total_operational_cost": null,
  "trend_type": "daily",
  "trend": [
    { "date": "2025-12-01", "revenue": 18000000 },
    { "date": "2025-12-02", "revenue": 15000000 },
    { "date": "2025-12-03", "revenue": 20000000 }
  ],
  "generated_at": "2025-12-10T12:01:23Z"
}
```

### **Data Source**

* Table: `penjualan`, `penjualan_barang`
* Biaya operasional: **tidak tersedia**, selalu `null`

---

# 2. **GET /financial/revenue-per-service**

Menampilkan pendapatan per jenis layanan rumah sakit:

* Rawat Jalan (RJ)
* Rawat Inap (Ranap)
* IGD
* Laboratorium
* Radiologi
* OK (Operasi)

---

### **Endpoint**

```
GET /api/v1/financial/revenue-per-service?range={monthly|yearly}
```

### **Query Parameters**

| Parameter | Tipe   | Wajib | Default   | Contoh   |
| --------- | ------ | ----- | --------- | -------- |
| `range`   | string | no    | `monthly` | `yearly` |

### **Response (200)**

```json
{
  "success": true,
  "range": "monthly",
  "services": [
    { "service": "RJ", "revenue": 120000000 },
    { "service": "Ranap", "revenue": 180000000 },
    { "service": "IGD", "revenue": 65000000 },
    { "service": "Lab", "revenue": 30000000 },
    { "service": "Radiologi", "revenue": 20000000 },
    { "service": "OK", "revenue": 55000000 }
  ],
  "generated_at": "2025-12-10T12:12:00Z"
}
```

### **Data Source**

* Table: `penjualan`
* Table: `penjualan_barang`
* Mapping layanan berdasarkan kode unit/poli

---

# 3. **GET /financial/bpjs-claim-status**

Menampilkan status klaim BPJS:

* **Outstanding**
* **In Progress**
* **Potensi Reject** → *tidak bisa dihitung (bridging tidak sampai grouping)* → nilai default `null`

---

### **Endpoint**

```
GET /api/v1/financial/bpjs-claim-status
```

### **Response (200)**

```json
{
  "success": true,
  "bpjs_claims": {
    "outstanding": 82,
    "in_progress": 47,
    "potential_reject": null
  },
  "note": "Potensi reject tidak tersedia karena data bridging tidak mencapai proses grouping.",
  "generated_at": "2025-12-10T12:20:33Z"
}
```

### **Data Source**

* Table klaim BPJS (tergantung sistem RS)
* Catatan: `potential_reject` **selalu null**

---

# 4. **GET /financial/cost-per-patient**

Menampilkan biaya rata-rata per pasien dan trend biaya.

> **Data diambil dari transaksi penjualan.**

---

### **Endpoint**

```
GET /api/v1/financial/cost-per-patient?trend={daily|monthly}
```

### **Query Parameters**

| Parameter | Tipe   | Wajib | Default | Contoh    |
| --------- | ------ | ----- | ------- | --------- |
| `trend`   | string | no    | `daily` | `monthly` |

---

### **Response (200)**

```json
{
  "success": true,
  "trend_type": "daily",
  "average_cost_per_patient": 1350000,
  "trend": [
    { "date": "2025-12-01", "avg_cost": 1400000 },
    { "date": "2025-12-02", "avg_cost": 1300000 },
    { "date": "2025-12-03", "avg_cost": 1350000 }
  ],
  "generated_at": "2025-12-10T12:25:10Z"
}
```

### **Data Source**

* `penjualan`
* `penjualan_barang`
* Divided by jumlah pasien (mengacu `registrasi` atau `billing`)

---

# 📌 Error Response Format

```json
{
  "success": false,
  "message": "Invalid trend parameter",
  "code": 400
}
```

---

# 📎 Notes

* Semua response dapat di-cache untuk mempercepat dashboard.
* Operational cost dan potential reject diberi `null` sesuai kondisi data real.
* Format disesuaikan untuk mudah dipakai di frontend charting (Line/Bar/Pie).

---

Kalau kamu mau, aku bisa sekalian buatin:

✅ SQL query dasar untuk tiap API
✅ Struktur service & controller (Laravel / Node.js / FastAPI)
✅ Swagger / OpenAPI YAML version

Tinggal bilang saja mau yang mana.

---

# 📦 **Implementation Status**

✅ **COMPLETED** - All 4 Financial APIs have been implemented!

## **Files Updated:**

1. **controller.js** - Added 4 new financial controller methods:
   - `getRevenueVsOperational()` - Revenue vs Operational Cost
   - `getRevenuePerService()` - Revenue per Service Type
   - `getBPJSClaimStatus()` - BPJS Claim Status
   - `getCostPerPatient()` - Average Cost per Patient

2. **route.js** - Added 4 new financial routes with authentication

## **Routes Added:**

Base URL remains: `/stats`

### New Financial Endpoints:

1. `GET /stats/revenue-vs-operational?trend={daily|weekly|monthly}`
2. `GET /stats/revenue-per-service?range={monthly|yearly}`
3. `GET /stats/bpjs-claim-status`
4. `GET /stats/cost-per-patient?trend={daily|monthly}`

## **Database Tables Used:**

✅ **NO NEW MODELS CREATED** - Uses existing tables:

- `penjualan` - Transaction data for revenue calculation
- `registrasi` - Patient registration data for BPJS claims
- `ms_asuransi` - Insurance master data (BPJS filtering)
- `ms_jenis_layanan` - Service type master (RJ, Ranap, IGD, etc)

## **Key Features:**

✅ Revenue calculation from penjualan table  
✅ Trend analysis (daily/weekly/monthly)  
✅ Service-based revenue breakdown  
✅ BPJS claim status tracking  
✅ Average cost per patient calculation  
✅ Null handling for unavailable data (operational cost, potential reject)  
✅ Authentication protected  
✅ Standardized error responses  

## **Data Mapping:**

### Service Type Mapping:
- **RAJAL** → RJ (Rawat Jalan)
- **RINAP** → Ranap (Rawat Inap)
- **IGD** → IGD (Emergency)
- **LAB** → Lab (Laboratory)
- **RAD** → Radiologi (Radiology)
- **OK** → OK (Operating Room)

### BPJS Status Mapping:
- **Outstanding** = status_registrasi = 1 (Baru dibuat)
- **In Progress** = status_registrasi = 2 (Proses)
- **Potential Reject** = null (Data tidak tersedia)

### Penjualan Status Filter:
Only counted when `status_penjualan IN (2, 3)`:
- 2 = Locked (Dikunci)
- 3 = Closed (Ditutup)

## **Example Usage:**

### 1. Get Revenue vs Operational Cost (Daily Trend)

```bash
GET /stats/revenue-vs-operational?trend=daily
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "month": "2025-12",
  "total_revenue": 480000000,
  "total_operational_cost": null,
  "trend_type": "daily",
  "trend": [
    { "date": "2025-12-01", "revenue": 18000000 },
    { "date": "2025-12-02", "revenue": 15000000 }
  ],
  "generated_at": "2025-12-11T12:00:00.000Z"
}
```

### 2. Get Revenue per Service (Monthly)

```bash
GET /stats/revenue-per-service?range=monthly
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "range": "monthly",
  "services": [
    { "service": "RJ", "revenue": 120000000 },
    { "service": "Ranap", "revenue": 180000000 },
    { "service": "IGD", "revenue": 65000000 },
    { "service": "Lab", "revenue": 30000000 },
    { "service": "Radiologi", "revenue": 20000000 },
    { "service": "OK", "revenue": 55000000 }
  ],
  "generated_at": "2025-12-11T12:00:00.000Z"
}
```

### 3. Get BPJS Claim Status

```bash
GET /stats/bpjs-claim-status
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "bpjs_claims": {
    "outstanding": 82,
    "in_progress": 47,
    "potential_reject": null
  },
  "note": "Potensi reject tidak tersedia karena data bridging tidak mencapai proses grouping.",
  "generated_at": "2025-12-11T12:00:00.000Z"
}
```

### 4. Get Cost per Patient (Daily Trend)

```bash
GET /stats/cost-per-patient?trend=daily
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "trend_type": "daily",
  "average_cost_per_patient": 1350000,
  "trend": [
    { "date": "2025-12-01", "avg_cost": 1400000 },
    { "date": "2025-12-02", "avg_cost": 1300000 }
  ],
  "generated_at": "2025-12-11T12:00:00.000Z"
}
```

## **Testing Checklist:**

- [ ] Server restarted successfully
- [ ] No syntax errors (✅ verified)
- [ ] All 4 financial endpoints return 200 OK
- [ ] Revenue calculations are accurate
- [ ] Service mapping works correctly
- [ ] BPJS filtering by tipe_asuransi = 'BPJS'
- [ ] Null values handled properly
- [ ] Trend data formatted correctly
- [ ] Authentication required (401 without token)

---

**Implementation Date:** December 11, 2025  
**Total APIs in Module:** 8 (4 Statistics + 4 Financial)  
**Status:** ✅ READY FOR TESTING
