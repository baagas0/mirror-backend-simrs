const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')

router.post('/register', authentification,Controller.register)
router.post('/update', authentification,Controller.update)
router.post('/list', authentification,Controller.list)
router.post('/listPerHalaman', authentification,Controller.listPerHalaman)
router.post('/listTagihanByPasienId', authentification,Controller.listTagihanByPasienId)
router.post('/listTagihanByMsJenisLayananId', authentification,Controller.listTagihanByMsJenisLayananId)
router.post('/detailsById', authentification,Controller.detailsById)
router.post('/delete',authentification,Controller.delete)
router.post('/closeTagihan',authentification,Controller.closeTagihan)
router.post('/detailsSumary',authentification,Controller.detailsSumary)
router.post('/detailsSumaryByRegistrasiId',authentification,Controller.detailsSumaryByRegistrasiId)
router.post('/detailsTarifCbgByTagihanId',authentification,Controller.detailsTarifCbgByTagihanId)
router.post('/listTagihanBPJS', authentification,Controller.listTagihanBPJS)

module.exports = router