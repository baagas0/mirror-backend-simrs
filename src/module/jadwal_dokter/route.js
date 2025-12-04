const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')

router.post('/register', authentification, Controller.register)
router.post('/update', authentification, Controller.update)
// router.post('/listPerHalaman', authentification, Controller.listPerHalaman)
router.post('/listJadwalDokterByMsPoliId', Controller.listJadwalDokterByMsPoliId)
router.post('/listJadwalDokterByMsDokterId', Controller.listJadwalDokterByMsDokterId)
router.post('/listKuotaJadwalDokterByMsPoliId', Controller.listKuotaJadwalDokterByMsPoliId)
router.post('/listKuotaJadwalDokterByMsDokterId', Controller.listKuotaJadwalDokterByMsDokterId)
router.post('/delete', authentification, Controller.delete)
router.post('/list', authentification, Controller.list)
router.post('/detailsById', authentification, Controller.detailsById)
router.post('/syncJadwal', authentification, Controller.syncJadwal)

module.exports = router