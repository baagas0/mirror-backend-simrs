const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')

router.post('/register', authentification, Controller.register)
router.post('/update', authentification, Controller.update)
router.post('/updateBulk', authentification, Controller.updateBulk)
router.post('/list', authentification, Controller.list)
router.post('/listPerHalaman', authentification, Controller.listPerHalaman)
router.post('/listMsHargaJasaByMsHargaMsTarifId', authentification, Controller.listMsHargaJasaByMsHargaMsTarifId)
router.post('/listMsHargaJasaByMsHargaId', authentification, Controller.listMsHargaJasaByMsHargaId)
router.post('/listMsHargaJasaByMsJasaId', authentification, Controller.listMsHargaJasaByMsJasaId)
router.post('/listMsHargaJasaByMsHargaMsJasaId', authentification, Controller.listMsHargaJasaByMsHargaMsJasaId)
router.post('/listMsHargaJasaByMsTarifId', authentification, Controller.listMsHargaJasaByMsTarifId)
router.post('/listMsHargaJasaPerHalaman', authentification, Controller.listMsHargaJasaPerHalaman)
router.post('/detailsById', authentification, Controller.detailsById)
router.post('/delete', authentification, Controller.delete)

module.exports = router