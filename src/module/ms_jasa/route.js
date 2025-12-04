const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')

router.post('/register', authentification, Controller.register)
router.post('/update', authentification, Controller.update)
router.post('/updateBulk', authentification, Controller.updateBulk)
router.post('/list', authentification, Controller.list)
router.post('/listPerhalaman', authentification, Controller.listPerhalaman)
router.post('/detailsById', authentification, Controller.detailsById)
router.post('/delete', authentification, Controller.delete)
router.post('/listMsJasaByJenisJasaId', authentification, Controller.listMsJasaByJenisJasaId)

module.exports = router