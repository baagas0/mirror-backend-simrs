Berikut **dokumen API** rapi dan siap kamu tempel ke Notion / Swagger / Confluence.
Format sudah termasuk deskripsi, parameter, contoh response, dan catatan teknis.

---

# 📘 **Hospital Statistics API Documentation**

## Base URL

```
/api/v1/stats
```

---

# 1. **GET /stats/visits**

Mengambil total kunjungan pasien berdasarkan rentang waktu.

### **Endpoint**

```
GET /api/v1/stats/visits?range={range}
```

### **Query Parameters**

| Parameter | Tipe   | Wajib | Contoh                                 | Keterangan                         |
| --------- | ------ | ----- | -------------------------------------- | ---------------------------------- |
| `range`   | string | yes   | `daily`, `weekly`, `monthly`, `yearly` | Menentukan rentang waktu statistik |

### **Response (200)**

```json
{
  "success": true,
  "range": "daily",
  "total_visits": 154,
  "date": "2025-12-10",
  "generated_at": "2025-12-10T12:01:23Z"
}
```

### **Data Source**

* Table: `registrasi`

---

# 2. **GET /stats/bor**

Mengambil nilai BOR realtime dan tren 30 hari.

### **Endpoint**

```
GET /api/v1/stats/bor?trend_days={number}
```

### **Query Parameters**

| Parameter    | Tipe    | Wajib | Default | Contoh | Keterangan                           |
| ------------ | ------- | ----- | ------- | ------ | ------------------------------------ |
| `trend_days` | integer | no    | 30      | `30`   | Jumlah hari untuk mengambil tren BOR |

### **Response (200)**

```json
{
  "success": true,
  "bor_today": 68.2,
  "trend_days": 30,
  "trend": [
    { "date": "2025-11-11", "bor": 70.5 },
    { "date": "2025-11-12", "bor": 69.1 },
    { "date": "2025-11-13", "bor": 72.0 }
  ],
  "formula": "BOR = (Total Hari Perawatan) / (Jumlah Tempat Tidur × Jumlah Hari) × 100%"
}
```

### **Catatan**

* Perhitungan berdasarkan:

  * `history_bed`
  * `master_bed` (jika butuh total bed)

---

# 3. **GET /stats/igd-queue/realtime**

Melihat status antrian IGD secara realtime.

### **Endpoint**

```
GET /api/v1/stats/igd-queue/realtime
```

### **Response (200)**

```json
{
  "success": true,
  "queue_count": 63,
  "status": "padat",
  "classification": {
    "normal": "0 - 50",
    "padat": "51 - 75",
    "kritis": "76 - 100"
  },
  "generated_at": "2025-12-10T12:04:00Z"
}
```

### **Klasifikasi Status**

| Rentang | Status |
| ------- | ------ |
| 0–50    | normal |
| 51–75   | padat  |
| 76–100  | kritis |

### **Data Source**

* Table `registrasi` (filtered: jenis pelayanan = IGD)

---

# 4. **GET /stats/idle-capacity**

Menampilkan ruang/tempat tidur yang tidak terpakai (kapasitas idle) dan potensi efisiensi.

### **Endpoint**

```
GET /api/v1/stats/idle-capacity
```

### **Response (200)**

```json
{
  "success": true,
  "total_beds": 120,
  "occupied_beds": 85,
  "idle_beds": 35,
  "idle_percentage": 29.1,
  "recommendation": "Optimalkan ruang Unit A dan C untuk efisiensi kapasitas.",
  "generated_at": "2025-12-10T12:05:10Z"
}
```

### **Data Source**

* `history_bed`
* `master_bed`

---

# 📌 Error Response Format

Akan digunakan untuk semua API.

```json
{
  "success": false,
  "message": "Invalid range parameter",
  "code": 400
}
```

---

# 📎 Notes

* Semua API mendukung cache opsional (Redis) untuk kinerja dashboard.
* Response `generated_at` membantu audit timestamp.
* Semua angka BOR dan idle capacity dalam persen dengan 1–2 decimal.

---

Kalau mau, aku bisa buatkan versi **Swagger/OpenAPI 3.0 YAML** atau **TypeScript interface** untuk frontend-mu.

---

# 📦 **Implementation Status**

✅ **COMPLETED** - All 4 APIs have been implemented!

## **Files Created:**

1. **controller.js** - Contains all 4 API controller functions
2. **route.js** - Defines the API routes with authentication middleware

## **Routes Added to Main App:**

```javascript
router.use("/stats", require("./module/dashboard_executive/route"));
```

## **Base URL:**

```
/stats
```

## **Available Endpoints:**

1. `GET /stats/visits?range={daily|weekly|monthly|yearly}`
2. `GET /stats/bor?trend_days={number}`
3. `GET /stats/igd-queue/realtime`
4. `GET /stats/idle-capacity`

## **Database Tables Used:**

- `registrasi` - For patient visit data and IGD queue
- `history_bed` - For bed occupation history
- `ms_bed` - For master bed data
- `ms_jenis_layanan` - For service type filtering (IGD, RAJAL, RINAP)

## **Key Features:**

✅ No new models created - uses existing tables
✅ All endpoints protected with authentication middleware
✅ Proper error handling with standardized response format
✅ Real-time data calculation
✅ Trend analysis for BOR
✅ Smart recommendations for idle capacity
✅ Status classification for IGD queue

## **Example Usage:**

### 1. Get Daily Visits

```bash
GET /stats/visits?range=daily
Authorization: Bearer {token}
```

### 2. Get BOR with 30-day Trend

```bash
GET /stats/bor?trend_days=30
Authorization: Bearer {token}
```

### 3. Get Realtime IGD Queue

```bash
GET /stats/igd-queue/realtime
Authorization: Bearer {token}
```

### 4. Get Idle Capacity

```bash
GET /stats/idle-capacity
Authorization: Bearer {token}
```
