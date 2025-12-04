const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../../../middleware/authentification')


router.post('/getDiagnosa',authentification,Controller.getDiagnosa)
router.post('/getPoli',authentification,Controller.getPoli)
router.post('/getFaskesKesehatan',authentification,Controller.getFaskesKesehatan)
router.post('/getDokterDPJP',authentification,Controller.getDokterDPJP)
router.post('/getDiagnosaProgramPRB',authentification,Controller.getDiagnosaProgramPRB)
router.post('/getObatGenerikProgramPRB',authentification,Controller.getObatGenerikProgramPRB)
router.post('/getTindakan',authentification,Controller.getTindakan)
router.post('/getKelasRawat',authentification,Controller.getKelasRawat)
router.post('/getDokter',authentification,Controller.getDokter)
router.post('/getPropinsi',authentification,Controller.getPropinsi)
router.post('/getKabupaten',authentification,Controller.getKabupaten)
router.post('/getKecamatan',authentification,Controller.getKecamatan)
router.post('/getKecamatan',authentification,Controller.getKecamatan)
router.post('/getSpesialistik',authentification,Controller.getSpesialistik)
router.post('/getRuangrawat',authentification,Controller.getRuangrawat)
router.post('/getCarakeluar',authentification,Controller.getCarakeluar)
router.post('/getPascapulang',authentification,Controller.getPascapulang)

module.exports = router