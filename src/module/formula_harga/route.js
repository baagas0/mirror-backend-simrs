const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')

router.post('/register', authentification, Controller.register)
router.post('/update', authentification, Controller.update)
router.post('/updateBulk', authentification, Controller.updateBulk)
router.post('/list', authentification, Controller.list)
router.post('/listPerHalaman', authentification, Controller.listPerHalaman)
router.get('/detailsById/:id', authentification, Controller.detailsById)
router.post('/delete', authentification, Controller.delete)
router.post('/listFormulaHargaByMsHargaId', authentification, Controller.listFormulaHargaByMsHargaId)
router.post('/listFormulaHargaByMsTarifId', authentification, Controller.listFormulaHargaByMsTarifId)
router.post('/listformulaHargaByMsTarifMsHargaId', authentification, Controller.listformulaHargaByMsTarifMsHargaId)

module.exports = router