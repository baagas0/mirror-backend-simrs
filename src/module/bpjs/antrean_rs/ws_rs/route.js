const router = require('express').Router()
const controller = require('./controller')

router.get('/token', controller.token)
router.post('/ambil_antrean', controller.ambil_antrean)
router.post('/status_antrean', controller.status_antrean)
router.post('/sisa_antrean', controller.sisa_antrean)
router.post('/check_in', controller.check_in)
router.post('/batal_antrean', controller.batal_antrean)
router.post('/info_pasien_baru', controller.info_pasien_baru)
router.post('/jadwal_operasi_rs', controller.jadwal_operasi_rs)
router.post('/jadwal_operasi_pasien', controller.jadwal_operasi_pasien)
module.exports = router