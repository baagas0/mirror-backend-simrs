const Controller = require('./controller');
const router = require('express').Router();
const authentification = require('../../middleware/authentification');

// ========================================
// Hospital Statistics APIs
// ========================================

// API 1: Total kunjungan pasien berdasarkan rentang waktu
router.get('/visits', authentification, Controller.getVisits);

// API 2: BOR realtime dan tren
router.get('/bor', authentification, Controller.getBOR);

// API 3: Status antrian IGD realtime
router.get('/igd-queue/realtime', authentification, Controller.getIGDQueueRealtime);

// API 4: Kapasitas idle tempat tidur
router.get('/idle-capacity', authentification, Controller.getIdleCapacity);

// ========================================
// Financial APIs
// ========================================

// API 5: Perbandingan pendapatan vs biaya operasional
router.get('/revenue-vs-operational', authentification, Controller.getRevenueVsOperational);

// API 6: Pendapatan per jenis layanan
router.get('/revenue-per-service', authentification, Controller.getRevenuePerService);

// API 7: Status klaim BPJS
router.get('/bpjs-claim-status', authentification, Controller.getBPJSClaimStatus);

// API 8: Biaya rata-rata per pasien
router.get('/cost-per-patient', authentification, Controller.getCostPerPatient);

// ========================================
// Operational/Services APIs
// ========================================

// API 9: Jumlah pasien per jenis layanan
router.get('/patient-count', authentification, Controller.getPatientCount);

// API 10: Rata-rata waktu tunggu pasien
router.get('/waiting-time', authentification, Controller.getWaitingTime);

// API 11: Jumlah tindakan medis (Lab & Radiologi)
router.get('/medical-actions', authentification, Controller.getMedicalActions);

// API 12: Top 10 diagnosa
router.get('/top-diagnosis', authentification, Controller.getTopDiagnosis);

// ========================================
// Facilities & Capacity APIs
// ========================================

// API 13: BOR per ruang
router.get('/bor-room', authentification, Controller.getBORPerRoom);

// API 14: Dokter on-call
router.get('/doctors-oncall', authentification, Controller.getDoctorsOnCall);

// API 15: Utilisasi ruang operasi
router.get('/operation-room-utilization', authentification, Controller.getOperationRoomUtilization);

module.exports = router;
