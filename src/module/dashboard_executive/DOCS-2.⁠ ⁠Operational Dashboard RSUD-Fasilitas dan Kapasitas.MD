Berikut **dokumen API lengkap** untuk modul **Fasilitas & Kapasitas**, dengan format yang sama seperti sebelumnya dan siap dipakai di Notion/Swagger.

---

# 📘 **Fasilitas & Kapasitas API Documentation**

## Base URL

```
/api/v1/facilities
```

---

# 1. **GET /facilities/bor-room**

Menampilkan **BOR (Bed Occupancy Rate) realtime per ruang**, seperti:

* ICU
* NICU
* Kelas 1, Kelas 2, Kelas 3
* VIP

---

### **Endpoint**

```
GET /api/v1/facilities/bor-room
```

### **Response (200)**

```json
{
  "success": true,
  "bor": [
    { "room": "ICU", "capacity": 10, "occupied": 8, "bor_percent": 80 },
    { "room": "NICU", "capacity": 6, "occupied": 5, "bor_percent": 83.3 },
    { "room": "Kelas 1", "capacity": 24, "occupied": 17, "bor_percent": 70.8 },
    { "room": "Kelas 2", "capacity": 30, "occupied": 22, "bor_percent": 73.3 },
    { "room": "Kelas 3", "capacity": 40, "occupied": 33, "bor_percent": 82.5 },
    { "room": "VIP", "capacity": 5, "occupied": 3, "bor_percent": 60 }
  ],
  "generated_at": "2025-12-10T14:20:12Z"
}
```

### **Formula**

```
BOR = (occupied / capacity) * 100%
```

### **Data Source**

* Table `history_bed` / `tt_master` atau table tempat tidur
* Grouping berdasarkan ruang

---

---

# 2. **GET /facilities/doctors-oncall**

Menampilkan daftar **dokter & konsultan yang sedang on-call** pada hari/tanggal saat ini.

---

### **Endpoint**

```
GET /api/v1/facilities/doctors-oncall?date=YYYY-MM-DD
```

### **Query Parameters**

| Parameter | Default  | Contoh       |
| --------- | -------- | ------------ |
| `date`    | hari ini | `2025-12-10` |

---

### **Response (200)**

```json
{
  "success": true,
  "date": "2025-12-10",
  "on_call": [
    { "name": "Dr. Andi", "specialist": "Penyakit Dalam", "shift": "Pagi" },
    { "name": "Dr. Sari", "specialist": "Anak", "shift": "Sore" },
    { "name": "Dr. Bimo", "specialist": "Bedah Umum", "shift": "On-Call 24 Jam" }
  ],
  "generated_at": "2025-12-10T14:25:44Z"
}
```

### **Data Source**

* Table jadwal dokter (ex: `doctor_schedule`, `oncall_schedule`)
* Filter by date atau shift

---

---

# 3. **GET /facilities/ambulance-availability**

Menampilkan status **ketersediaan ambulans**, contoh:

* Available
* Sedang dipakai
* Dalam perbaikan

---

### **Endpoint**

```
GET /api/v1/facilities/ambulance-availability
```

### **Response (200)**

```json
{
  "success": true,
  "ambulances": [
    { "unit": "AMB-01", "status": "available" },
    { "unit": "AMB-02", "status": "in_use" },
    { "unit": "AMB-03", "status": "maintenance" }
  ],
  "generated_at": "2025-12-10T14:30:11Z"
}
```

### **Data Source**

* Table: `ambulance_status` atau `kendaraan`
* Status diambil secara realtime

---

---

# 4. **GET /facilities/operation-room-utilization**

Menampilkan **ketersediaan ruang operasi (OK)** dan **persentase utilisasinya**.

### Rumus utilisasi:

```
% Utilisasi = (Total Waktu Penggunaan / Total Waktu Ketersediaan) * 100%
```

### Penjelasan:

* **Total Waktu Penggunaan**
  dihitung dari data operasi → `tgl_mulai_operasi` sampai `tgl_selesai_operasi`

* **Total Waktu Ketersediaan**
  = jumlah OK × **8 jam/hari**

---

### **Endpoint**

```
GET /api/v1/facilities/operation-room-utilization?date=YYYY-MM-DD
```

### **Query Parameters**

| Parameter | Default  | Keterangan                        |
| --------- | -------- | --------------------------------- |
| `date`    | hari ini | Mengambil utilisasi hari tertentu |

---

### **Response (200)**

```json
{
  "success": true,
  "date": "2025-12-10",
  "operating_rooms": [
    {
      "room": "OK-01",
      "availability_hours": 8,
      "usage_hours": 5,
      "utilization_percent": 62.5
    },
    {
      "room": "OK-02",
      "availability_hours": 8,
      "usage_hours": 7,
      "utilization_percent": 87.5
    }
  ],
  "summary": {
    "total_rooms": 2,
    "total_availability_hours": 16,
    "total_usage_hours": 12,
    "overall_utilization_percent": 75
  },
  "generated_at": "2025-12-10T14:40:10Z"
}
```

---

### **Data Source**

* Table operasi / OK:

  * `tgl_mulai_operasi`
  * `tgl_selesai_operasi`
  * `room_ok`

* Table master kamar operasi

  * jumlah kamar × 8 jam

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
