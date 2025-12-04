const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../../../middleware/authentification')


router.post('/getRujukanByNoRujukan',authentification,Controller.getRujukanByNoRujukan)
router.post('/getRujukanBerdasarkanNomorKartuMulti',authentification,Controller.getRujukanBerdasarkanNomorKartuMulti)
router.post('/getRujukanKhusus',authentification,Controller.getRujukanKhusus)
router.post('/getSpesialistikRujukan',authentification,Controller.getSpesialistikRujukan)
router.post('/getSarana',authentification,Controller.getSarana)
router.post('/getRujukanKeluarRS',authentification,Controller.getRujukanKeluarRS)
router.post('/getDataRujukanKeluarRSberdasarkanNoRujukan',authentification,Controller.getDataRujukanKeluarRSberdasarkanNoRujukan)
router.post('/getDataJumlahSEPrujukan',authentification,Controller.getDataJumlahSEPrujukan)

module.exports = router