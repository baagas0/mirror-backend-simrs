const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../../../middleware/authentification')


router.post('/getCariSep',authentification,Controller.getCariSep)
router.post('/getNomorSuratKontrol',authentification,Controller.getNomorSuratKontrol)
router.post('/getNomorSuratKontrolByNoKartu',authentification,Controller.getNomorSuratKontrolByNoKartu)
router.post('/getDataNomorSuratKontrol',authentification,Controller.getDataNomorSuratKontrol)
router.post('/getDataPoli',authentification,Controller.getDataPoli)
router.post('/getDataDokter',authentification,Controller.getDataDokter)


router.post('/insertSPRI',authentification,Controller.insertSPRI);
router.post('/updateSPRI',authentification,Controller.updateSPRI);
router.post('/insertRencanaKontrol',authentification,Controller.insertRencanaKontrol)
router.post('/updateRencanaKontrol',authentification,Controller.updateRencanaKontrol)
router.post('/deleteRencanaKontrol',authentification,Controller.deleteRencanaKontrol)

module.exports = router