const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')

router.post('/register', authentification, Controller.register)
router.post('/update', authentification, Controller.update)
router.post('/updateBulk', authentification, Controller.updateBulk)
router.post('/list', authentification, Controller.list)
router.post('/listPerHalaman', authentification, Controller.listPerHalaman)
router.post('/listMsHargaFasilitasByMsTarifMsHargaId', authentification, Controller.listMsHargaFasilitasByMsTarifMsHargaId)
router.get('/detailsById/:id', authentification, Controller.detailsById)
router.post('/delete', authentification, Controller.delete)
router.post('/listMsHargaFasilitasByMsHargaId', authentification, Controller.listMsHargaFasilitasByMsHargaId)
router.post('/listMsHargaFasilitasByMsTarifId', authentification, Controller.listMsHargaFasilitasByMsTarifId)
router.post('/listFasilitasHargaTarifPerHalaman', authentification, Controller.listFasilitasHargaTarifPerHalaman)

module.exports = router