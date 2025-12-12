Berikut **dokumen API** untuk modul **Pelayanan & Kunjungan**, dengan format konsisten seperti sebelumnya—siap dipakai untuk Notion, Swagger, atau dokumentasi internal.

---

# 📘 **Pelayanan & Kunjungan API Documentation**

## Base URL

```
/api/v1/services
```

---

# 1. **GET /services/patient-count**

Mengambil jumlah pasien berdasarkan jenis pelayanan **Rawat Jalan**, **Rawat Inap**, dan **IGD**, serta dapat difilter per **poli** atau **ruang**.

---

### **Endpoint**

```
GET /api/v1/services/patient-count?unit={poli|ruang}&date={YYYY-MM-DD}
```

### **Query Parameters**

| Parameter | Tipe   | Wajib | Default  | Contoh          | Keterangan                            |
| --------- | ------ | ----- | -------- | --------------- | ------------------------------------- |
| `unit`    | string | no    | `null`   | `poli`, `ruang` | Filter berdasarkan poli/ruangan       |
| `date`    | string | no    | hari ini | `2025-12-10`    | Mengambil data untuk tanggal tertentu |

---

### **Response (200)**

```json
{
  "success": true,
  "date": "2025-12-10",
  "counts": {
    "rawat_jalan": 182,
    "rawat_inap": 67,
    "igd": 95
  },
  "per_unit": [
    { "unit": "Poli Umum", "count": 56 },
    { "unit": "Poli Anak", "count": 41 },
    { "unit": "Ruang Mawar", "count": 18 }
  ],
  "generated_at": "2025-12-10T13:00:22Z"
}
```

### **Data Source**

* Table `registrasi`

---

---

# 2. **GET /services/waiting-time**

Mengambil **rata-rata waktu tunggu pasien** dari:

👉 **Registrasi → Dilayani (tgl_diproses)**

> Data diperoleh dari table `antrian_list`
> Kolom `tgl_diproses` di-update oleh trigger saat tombol "Proses Antrian" ditekan.

---

### **Endpoint**

```
GET /api/v1/services/waiting-time?range=daily|monthly
```

### **Query Parameters**

| Parameter | Tipe   | Default | Keterangan                    |
| --------- | ------ | ------- | ----------------------------- |
| `range`   | string | `daily` | Rentang analisis waktu tunggu |

---

### **Response (200)**

```json
{
  "success": true,
  "range": "daily",
  "average_wait_time_minutes": 32.5,
  "detail": [
    { "date": "2025-12-01", "avg_wait": 30 },
    { "date": "2025-12-02", "avg_wait": 35 },
    { "date": "2025-12-03", "avg_wait": 32 }
  ],
  "generated_at": "2025-12-10T13:05:40Z"
}
```

### **Data Source**

* Table `antrian_list`

  * `tgl_registrasi`
  * `tgl_diproses`

---

---

# 3. **GET /services/medical-actions**

Menampilkan jumlah tindakan medis berdasarkan layanan:

* Laboratorium
* Radiologi
* (opsional: tindakan OK bila tersedia)

---

### **Endpoint**

```
GET /api/v1/services/medical-actions?range={daily|monthly}
```

### **Query Parameters**

| Parameter | Default |
| --------- | ------- |
| `range`   | `daily` |

---

### **Response (200)**

```json
{
  "success": true,
  "range": "daily",
  "lab_actions": 340,
  "radiology_actions": 120,
  "trend": [
    { "date": "2025-12-01", "lab": 31, "radiology": 10 },
    { "date": "2025-12-02", "lab": 29, "radiology": 11 },
    { "date": "2025-12-03", "lab": 34, "radiology": 9 }
  ],
  "generated_at": "2025-12-10T13:09:12Z"
}
```

### **Data Source**

* Table `laboratories`
* Table `radiologi`

---

---

# 4. **GET /services/patient-satisfaction**

Menampilkan skor kepuasan pasien.

> ⚠️ *Saat ini tidak ada form atau data kepuasan → API tetap ada, tetapi memberikan nilai `null`.*

---

### **Endpoint**

```
GET /api/v1/services/patient-satisfaction
```

### **Response (200)**

```json
{
  "success": true,
  "satisfaction_score": null,
  "note": "Data kepuasan pasien belum tersedia.",
  "generated_at": "2025-12-10T13:12:55Z"
}
```

### **Data Source**

* **Tidak ada data** – kolom disediakan untuk future update

---

---

# 5. **GET /services/top-diagnosis**

Menampilkan **Top 10 diagnosa** dan **tren 30 hari**.

> Data diagnosa sudah tersedia melalui view diagnosa (seperti di dashboard umum).

---

### **Endpoint**

```
GET /api/v1/services/top-diagnosis?days=30
```

### **Query Parameters**

| Parameter | Default | Contoh |
| --------- | ------- | ------ |
| `days`    | `30`    | `30`   |

---

### **Response (200)**

```json
{
  "success": true,
  "top_10_diagnosis": [
    { "diagnosis": "A09 - Diare", "count": 128 },
    { "diagnosis": "J06.9 - ISPA", "count": 103 },
    { "diagnosis": "I10 - Hipertensi", "count": 97 }
  ],
  "trend_days": 30,
  "trend": [
    { "date": "2025-11-11", "count": 52 },
    { "date": "2025-11-12", "count": 63 },
    { "date": "2025-11-13", "count": 58 }
  ],
  "generated_at": "2025-12-10T13:17:44Z"
}
```

### **Data Source**

* View diagnosa (existing)

---

# 📌 Error Response Format

```json
{
  "success": false,
  "message": "Invalid parameter",
  "code": 400
}
```

---

# 📎 Notes

* Semua API mendukung sistem cache jika diperlukan untuk dashboard.
* `patient-satisfaction` tetap dibuat agar struktur modul tetap konsisten.
* tren bisa ditampilkan dalam bentuk line chart atau bar chart di frontend.

---

Kalau kamu mau, aku bisa sekalian buatkan:

🔥 SQL query dasar untuk setiap API
🔥 Struktur controller + service (Laravel / Node.js / FastAPI)
🔥 OpenAPI 3.0 / Swagger YAML

Tinggal bilang mau yang mana.
