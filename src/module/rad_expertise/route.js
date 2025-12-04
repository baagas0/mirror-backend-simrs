const Controller = require('./controller');
const router = require('express').Router();
const authentification = require('../../middleware/authentification');
const upload = require('../../helper/upload');

// Basic CRUD operations
router.post('/register', authentification, upload, Controller.register);
router.post('/update', authentification, upload, Controller.update);
router.post('/detailsById', authentification, Controller.detailsById);
router.post('/list', authentification, Controller.list);
router.post('/delete', authentification, Controller.delete);

// Expertise specific operations
router.post('/submit', authentification, Controller.submit);
router.post('/request-second-opinion', authentification, Controller.requestSecondOpinion);
router.post('/peer-review', authentification, Controller.peerReview);

// Get expertise by rad_hasil_id
router.post('/get-by-rad-hasil', authentification, Controller.getByRadHasilId);

// Statistics
router.post('/statistics', authentification, Controller.getStatistics);

// PDF Export
router.post('/export-pdf', authentification, Controller.exportPDF);
router.post('/export-multiple-pdf', authentification, Controller.exportMultiplePDF);
router.post('/export-rad-hasil-pdf', authentification, Controller.exportRadHasilWithExpertisePDF);

// Comprehensive Report
router.post('/comprehensive-report/data', authentification, Controller.getComprehensiveReportData);
router.post('/comprehensive-report/pdf', authentification, Controller.exportComprehensiveReportPDF);

// Patient Recap
router.post('/patient-recap', authentification, Controller.getPatientRecap);
router.post('/patient-recap/export-excel', authentification, Controller.exportPatientRecapExcel);

// Waiting Time Analysis
router.post('/waiting-time-analysis', authentification, Controller.getWaitingTimeAnalysis);
router.post('/waiting-time-analysis/export-excel', authentification, Controller.exportWaitingTimeAnalysisExcel);

// Cancellation Analysis
router.post('/cancellation-analysis', authentification, Controller.getCancellationAnalysis);
router.post('/cancellation-analysis/export-excel', authentification, Controller.exportCancellationAnalysisExcel);

module.exports = router;