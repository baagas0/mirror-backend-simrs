const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')

// router.post('/', authentification, upload, Controller.index)
router.post('/kunjungan_pasien', authentification, Controller.kunjungan_pasien)
router.post('/kunjungan_pasien_excel', Controller.kunjungan_pasien_excel)

router.post('/kunjungan_pasien_bpjs', authentification, Controller.kunjungan_pasien_bpjs)
router.post('/kunjungan_pasien_bpjs_excel', Controller.kunjungan_pasien_bpjs_excel)

router.post('/penyakit', authentification, Controller.penyakit)
router.post('/penyakit_excel', authentification, Controller.penyakit_excel)

router.post('/pemeriksaan_medis', authentification, Controller.pemeriksaan_medis)
router.post('/pemeriksaan_medis_excel', authentification, Controller.pemeriksaan_medis_excel)

module.exports = router