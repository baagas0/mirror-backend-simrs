# Dokumentasi Fitur Laporan Pemeriksaan Radiologi Lengkap

## Overview

Fitur **Laporan Pemeriksaan Radiologi Lengkap** (Comprehensive Radiology Report) adalah modul yang dirancang untuk menghasilkan laporan radiologi yang komprehensif menggabungkan semua data dari proses pemeriksaan radiologi mulai dari registrasi hingga hasil expertise.

## Fitur Utama

### 1. Data Pasien Lengkap
- Informasi demografi pasien (nama, RM, umur, jenis kelamin, alamat)
- Data registrasi (no. registrasi, antrian, SEP, rujukan)
- Informasi klinis awal

### 2. Informasi Klinis
- Diagnosa klinis dari dokter pengirim
- Informasi klinis tambahan
- Dokter pengirim dan spesialisasinya

### 3. Detail Pemeriksaan
- Jenis pemeriksaan radiologi
- Keterangan dan detail spesifik
- Status CITO dan puasa
- Unit penunjang terkait

### 4. Parameter Teknis
- Proyeksi pemeriksaan
- Parameter radiografi (kV, mAs, FFD, BSF, INAK)
- Dosis radiasi
- Jumlah penyinaran

### 5. Hasil Pemeriksaan
- Hasil pemeriksaan radiologi
- Kesan dari hasil
- Temuan detail
- Pengukuran (jika ada)

### 6. Interpretasi Radiolog
- Temuan pemeriksaan oleh radiolog
- Temuan tambahan
- Perbandingan dengan pemeriksaan sebelumnya
- Korelasi klinis
- Keterbatasan pemeriksaan

### 7. Kesimpulan dan Saran
- Kesimpulan diagnosis
- Saran/rekomendasi tindakan lanjutan

### 8. Status dan Informasi Tambahan
- Status laporan (draft, final, revisi)
- Tingkat urgensi
- Temuan kritis
- Informasi peer review (jika ada)

## API Endpoints

### 1. Get Comprehensive Report Data
**Endpoint:** `POST /rad_expertise/comprehensive-report/data`

**Deskripsi:** Mengambil data lengkap laporan pemeriksaan radiologi tanpa menghasilkan PDF

**Request Body:**
```json
{
  "rad_regis_id": "uuid_registrasi_radiologi"
}
```

**Response:**
```json
{
  "status": 200,
  "message": "Data laporan lengkap berhasil diambil",
  "data": {
    "no_rm": "RM001",
    "nama_lengkap": "John Doe",
    "jenis_kelamin": "L",
    "tgl_lahir": "1990-01-01",
    "umur": "33 tahun",
    "nik": "1234567890123456",
    "alamat_sekarang": "Jl. Contoh No. 123",
    "no_hp": "08123456789",
    "registrasi_id": "uuid_registrasi",
    "no_antrian": "A001",
    "no_sep": "SEP001",
    "no_rujukan": "RJ001",
    "nama_dokter_pengirim": "Dr. Smith",
    "spesialisasi_pengirim": "Internal Medicine",
    "diagnosa": [
      {
        "kode_icd": "J45",
        "nama_diagnosa": "Asthma"
      }
    ],
    "klinis": "Pasien dengan sesak napas...",
    "nama_rad_test": "Chest X-Ray",
    "keterangan_rad_test": "PA and Lateral",
    "is_cito": false,
    "is_puasa": false,
    "proyeksi": "PA, Lateral",
    "kv": 125,
    "mas": 20,
    "hasil": "Jantung tidak membesar...",
    "kesan": "Normal",
    "temuan": "Tidak ada abnormalitas...",
    "kesimpulan": "Pemeriksaan thoraks dalam batas normal",
    "saran": "Kontrol rutin ke poli...",
    "status_expertise": "final",
    "urgency_level": "routine",
    "nama_radiolog": "Dr. Radiologist",
    "spesialisasi_radiolog": "Radiologi"
  }
}
```

### 2. Export Comprehensive Report PDF
**Endpoint:** `POST /rad_expertise/comprehensive-report/pdf`

**Deskripsi:** Menghasilkan PDF laporan pemeriksaan radiologi lengkap

**Request Body:**
```json
{
  "rad_regis_id": "uuid_registrasi_radiologi",
  "includeImages": false,
  "includeTechnicalDetails": true,
  "includeComparison": true
}
```

**Parameters:**
- `rad_regis_id` (required): UUID dari registrasi radiologi
- `includeImages` (optional): Include gambar dalam PDF (default: false)
- `includeTechnicalDetails` (optional): Include parameter teknis (default: true)
- `includeComparison` (optional): Include catatan perbandingan (default: true)

**Response:** PDF File dengan header:
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="Laporan_Radiologi_Lengkap_John_Doe_2024-01-01_14-30-00.pdf"
```

## Struktur Data yang Digunakan

### Tabel Utama
1. **rad_regis** - Registrasi radiologi
2. **registrasi** - Registrasi utama pasien
3. **pasien** - Data pasien
4. **ms_dokter** - Data dokter (pengirim & radiolog)
5. **rad_hasil** - Hasil pemeriksaan radiologi
6. **rad_test** - Jenis pemeriksaan radiologi
7. **rad_test_list** - Detail spesifik pemeriksaan
8. **rad_expertise** - Laporan expertise radiolog
9. **penunjang** - Unit penunjang

### Relasi Data
```
registrasi → rad_regis → rad_hasil → rad_expertise
     ↓             ↓           ↓           ↓
   pasien    ms_dokter    rad_test    ms_dokter (radiolog)
     ↓                         ↓
                           penunjang
```

## Format PDF Output

### Layout
1. **Header** - Informasi rumah sakit
2. **Title** - Judul laporan
3. **Patient Information** - Data pasien
4. **Clinical Information** - Informasi klinis
5. **Examination Details** - Detail pemeriksaan
6. **Technical Parameters** - Parameter teknis (opsional)
7. **Examination Results** - Hasil pemeriksaan
8. **Findings & Interpretation** - Temuan dan interpretasi
9. **Measurements** - Pengukuran (jika ada)
10. **Comparison Notes** - Catatan perbandingan (jika ada)
11. **Conclusions** - Kesimpulan
12. **Recommendations** - Saran/rekomendasi
13. **Status Information** - Status dan informasi tambahan
14. **Signatures** - Tanda tangan dokter pengirim dan radiolog
15. **Footer** - Nomor halaman dan disclaimer

### Styling
- **Font:** Helvetica family
- **Page Size:** A4
- **Margins:** 40px all sides
- **Language:** Bahasa Indonesia
- **Date Format:** DD MMMM YYYY

## Contoh Penggunaan

### Frontend Implementation (Vue.js)

```javascript
// Service untuk mengambil data laporan lengkap
async getComprehensiveReportData(radRegisId) {
  try {
    const response = await this.$_api.post('/rad_expertise/comprehensive-report/data', {
      rad_regis_id: radRegisId
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Service untuk download PDF
async downloadComprehensiveReportPDF(radRegisId, options = {}) {
  try {
    const response = await this.$_api.post('/rad_expertise/comprehensive-report/pdf', {
      rad_regis_id: radRegisId,
      includeImages: options.includeImages || false,
      includeTechnicalDetails: options.includeTechnicalDetails !== false,
      includeComparison: options.includeComparison !== false
    }, {
      responseType: 'blob'
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_Radiologi_Lengkap_${moment().format('YYYY-MM-DD_HH-mm-ss')}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return response;
  } catch (error) {
    throw error;
  }
}
```

### Contoh Vue Component

```vue
<template>
  <div class="comprehensive-report">
    <div class="report-header">
      <h3>Laporan Pemeriksaan Radiologi Lengkap</h3>
    </div>

    <div class="report-actions">
      <b-button variant="primary" @click="loadReportData">
        <i class="ri-file-search-line"></i> Tampilkan Data
      </b-button>

      <b-button variant="success" @click="downloadPDF" :disabled="!reportData">
        <i class="ri-download-line"></i> Download PDF
      </b-button>

      <b-button variant="info" @click="previewPDF" :disabled="!reportData">
        <i class="ri-eye-line"></i> Preview PDF
      </b-button>
    </div>

    <div class="report-content" v-if="reportData">
      <patient-info :patient="reportData" />
      <clinical-info :clinical="reportData" />
      <examination-details :examination="reportData" />
      <results-info :results="reportData" />
      <conclusions-info :conclusions="reportData" />
    </div>
  </div>
</template>

<script>
import { RadiologyService } from '@/services/radiology.service';

export default {
  name: 'ComprehensiveRadiologyReport',
  props: {
    radRegisId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      reportData: null,
      loading: false,
      pdfOptions: {
        includeImages: false,
        includeTechnicalDetails: true,
        includeComparison: true
      }
    };
  },
  methods: {
    async loadReportData() {
      this.loading = true;
      try {
        const response = await RadiologyService.getComprehensiveReportData(this.radRegisId);
        this.reportData = response.data;
      } catch (error) {
        this.$_alert.error(error.response?.data?.message || 'Gagal mengambil data laporan');
      } finally {
        this.loading = false;
      }
    },

    async downloadPDF() {
      try {
        await RadiologyService.downloadComprehensiveReportPDF(this.radRegisId, this.pdfOptions);
        this.$_alert.success('PDF berhasil diunduh');
      } catch (error) {
        this.$_alert.error('Gagal mengunduh PDF');
      }
    },

    async previewPDF() {
      try {
        const response = await RadiologyService.downloadComprehensiveReportPDF(this.radRegisId, this.pdfOptions);
        const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');
      } catch (error) {
        this.$_alert.error('Gagal menampilkan preview PDF');
      }
    }
  }
};
</script>
```

## Error Handling

### Common Error Responses

1. **Data Not Found (404)**
```json
{
  "status": 404,
  "message": "Data pemeriksaan radiologi tidak ditemukan"
}
```

2. **Validation Error (400)**
```json
{
  "status": 400,
  "message": "rad_regis_id is required"
}
```

3. **Internal Server Error (500)**
```json
{
  "status": 500,
  "message": "gagal membuat laporan lengkap",
  "data": "error details"
}
```

### Error Handling Best Practices
- Validasi input sebelum mengirim request
- Handle timeout untuk pembuatan PDF yang kompleks
- Berikan feedback visual kepada user
- Implement retry mechanism untuk network errors
- Log error untuk debugging dan monitoring

## Performance Considerations

### Database Optimization
- Query dengan JOIN yang efisien
- Penggunaan index pada kolom yang sering dicari
- Limit data retrieval untuk prevent memory overflow

### PDF Generation
- Cache PDF yang sering diakses
- Implementasi asynchronous PDF generation untuk laporan besar
- Compress PDF untuk reduce file size

### Frontend Optimization
- Lazy loading untuk data laporan
- Implement pagination untuk multiple reports
- Progress indicator untuk PDF generation

## Security Considerations

### Access Control
- Validasi authentication token
- Role-based access control (RBAC)
- Validasi hak akses ke data pasien

### Data Protection
- HTTPS untuk semua API calls
- Validasi input untuk prevent injection
- Rate limiting untuk prevent abuse

### Audit Trail
- Log semua akses ke laporan
- Track PDF generation activities
- Monitor unusual patterns

## Testing

### Unit Tests
- Test controller methods
- Test PDF generation logic
- Test data transformation

### Integration Tests
- Test API endpoints
- Test database queries
- Test PDF download flow

### E2E Tests
- Test complete user workflow
- Test PDF generation end-to-end
- Test error scenarios

## Deployment

### Environment Variables
```env
# PDF Generation
PDF_MAX_FILE_SIZE=10MB
PDF_TIMEOUT=30000ms
PDF_TEMP_DIR=/tmp/radiology_reports

# Database
DB_QUERY_TIMEOUT=30000ms
DB_POOL_SIZE=10

# File Storage
UPLOAD_MAX_SIZE=50MB
ALLOWED_FILE_TYPES=jpg,jpeg,png,dcm
```

### Monitoring
- Monitor PDF generation time
- Track API response times
- Monitor memory usage
- Log error rates

## Future Enhancements

### Planned Features
1. **Digital Signatures** - Tanda tangan digital yang valid
2. **Template Customization** - Customizable PDF templates
3. **Multilingual Support** - Support untuk Bahasa Inggris
4. **Batch Report Generation** - Generate multiple reports simultaneously
5. **Integration with PACS** - Direct integration with Picture Archiving and Communication System
6. **Mobile Responsive Design** - Mobile-friendly report viewing
7. **Real-time Collaboration** - Multiple radiologists can collaborate on reports

### Technical Improvements
1. **Performance Optimization** - Caching and database optimization
2. **Security Enhancements** - Advanced access controls
3. **Reporting Analytics** - Usage and performance analytics
4. **Automated Testing** - Comprehensive test coverage
5. **API Documentation** - Interactive API documentation

## Troubleshooting

### Common Issues

1. **PDF Generation Fails**
   - Check file permissions in temp directory
   - Verify memory allocation
   - Check if all required fonts are available

2. **Data Not Found**
   - Verify rad_regis_id is correct
   - Check if data exists in database
   - Verify user has access to the data

3. **Performance Issues**
   - Check database query performance
   - Optimize PDF generation
   - Implement caching

4. **Memory Issues**
   - Increase server memory allocation
   - Implement streaming for large PDFs
   - Optimize image processing

### Debug Mode
Enable debug logging:
```javascript
// In controller.js
const DEBUG = process.env.NODE_ENV === 'development';
if (DEBUG) {
    console.log('Comprehensive Report Debug:', data);
}
```

## Version History

### v1.0.0 (Current)
- Initial implementation
- Basic PDF generation
- Comprehensive data aggregation
- Standard error handling

### Changelog
- Added comprehensive report functionality
- Implemented PDF generator with customizable options
- Added proper error handling and validation
- Created comprehensive API documentation

---

**Last Updated:** 27 Oktober 2024
**Version:** 1.0.0
**Maintainer:** SIMRS Development Team