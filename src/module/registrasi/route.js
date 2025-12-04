const Controller = require('./controller');
const router = require('express').Router();
const authentification = require('../../middleware/authentification');


router.post('/register', authentification, Controller.register);
router.post('/registerRajal', authentification, Controller.registerRajal);
router.post('/registerRanap', authentification, Controller.registerRanap);
router.post('/registerIGD', authentification, Controller.registerIGD);
router.post('/update', authentification, Controller.update);
router.post('/updateSatuSehat', authentification, Controller.updateSatuSehat);
router.post('/delete', authentification, Controller.delete);
router.post('/list', authentification, Controller.list);
router.post('/listPerHalaman', authentification, Controller.listPerHalaman);
router.post('/listKunjunganRinap', authentification, Controller.listKunjunganRinap);
router.post('/listKunjunganRajal', authentification, Controller.listKunjunganRajal);
router.post('/listKunjunganIGD', authentification, Controller.listKunjunganIGD);
router.post('/listKunjunganInapPerHalaman', authentification, Controller.listKunjunganInapPerHalaman);
router.post('/listKunjunganRajalPerHalaman', authentification, Controller.listKunjunganRajalPerHalaman);
router.post('/listKunjunganIGDPerHalaman', authentification, Controller.listKunjunganIGDPerHalaman);
router.post('/listRegistrasiNonTagihanPerHalaman', authentification, Controller.listRegistrasiNonTagihanPerHalaman);
router.post('/detailsById', authentification, Controller.detailsById);
router.post('/registerSEP', authentification, Controller.detailsById);
router.post('/listKunjunganRajalWithResepPerHalaman', authentification, Controller.listKunjunganRajalWithResepPerHalaman);
router.post('/tutupKunjungan', authentification, Controller.tutupKunjungan);
router.post('/batalKunjungan', authentification, Controller.batalKunjungan);

router.post('/list_diagnosa_by_registrasi_id', authentification, Controller.listDiagnosaByRegistrasiId);

// riwayatRegistrasiPasien
router.post('/riwayatRegistrasiPasien/list', authentification, Controller.riwayatRegistrasiPasien);

// konversi rawat jalan ke rawat inap
router.post('/convertRajalToRanap', authentification, Controller.convertRajalToRanap);

module.exports = router