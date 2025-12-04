const router = require('express').Router()
const controller = require('./controller')

// router.post('/credetial',controller.credetial)
router.use('/ws_rs', require('./ws_rs/route'))

router.post('/refPoli', controller.refPoli)
router.post('/refDokter', controller.refDokter)
router.post('/refJadwalDokter', controller.refJadwalDokter)
router.post('/createAntrean', controller.createAntrean)
router.post('/updateWaktuAntrean', controller.updateWaktuAntrean)
router.post('/batalAntrean', controller.batalAntrean)

router.post('/updateJadwalDokter', controller.updateJadwalDokter)
router.post('/logAntrol', controller.logAntrol)
router.post('/antrolAktif', controller.antrolAktif)
router.post('/monitorAntrean', controller.monitorAntrean)
module.exports = router