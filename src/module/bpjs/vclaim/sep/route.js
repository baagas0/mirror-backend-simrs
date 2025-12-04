const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../../../middleware/authentification')


router.post('/getFingerPrint',authentification,Controller.getFingerPrint)
router.post('/getCariSep',authentification,Controller.getCariSep)
router.post('/getSEPInternal',authentification,Controller.getSEPinternal)
router.post('/getDataPersetujuanSEP',authentification,Controller.getDataPersetujuanSEP)
router.post('/getIntegrasiSEPInacbg',authentification,Controller.getIntegrasiSEPInacbg)
router.post('/getDataUpdateTglPulangSEP',authentification,Controller.getDataUpdateTglPulangSEP)


router.post('/registerSEP',authentification,Controller.registerSEP)
router.post('/registerSEP2',authentification,Controller.registerSEP2)
router.post('/updateSEP2',authentification,Controller.updateSEP2)
router.post('/deleteSEP2',authentification,Controller.deleteSEP2)
router.post('/deletesSEPinternal',authentification,Controller.deletesSEPinternal)

module.exports = router