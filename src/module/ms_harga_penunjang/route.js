const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')

router.post('/register', authentification, Controller.register)
router.post('/update', authentification, Controller.update)
router.post('/updateBulk', authentification, Controller.updateBulk)
router.post('/list', authentification, Controller.list)
// router.post('/listPerHalaman', authentification, Controller.listPerHalaman)
router.post('/listms_harga_penunjangByMsTarifMsHargaId', authentification, Controller.listms_harga_penunjangByMsTarifMsHargaId)
router.post('/detailsById', authentification, Controller.detailsById)
router.post('/delete', authentification, Controller.delete)
// router.post('/listMsHargaFasilitasByMsHargaId', authentification, Controller.listMsHargaFasilitasByMsHargaId)
// router.post('/listMsHargaFasilitasByMsTarifId', authentification, Controller.listMsHargaFasilitasByMsTarifId)
router.post('/listpenunjangHargaTarifPerHalaman', authentification, Controller.listpenunjangHargaTarifPerHalaman)

module.exports = router