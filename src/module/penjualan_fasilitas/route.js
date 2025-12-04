const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')

router.post('/register', authentification,Controller.register)
router.post('/update', authentification,Controller.update)
router.get('/list', authentification,Controller.list)
router.post('/listPenjualanFasilitasByPenjualanId', authentification,Controller.listPenjualanFasilitasByPenjualanId)
router.post('/listPenjualanFasilitasByMsFasilitasId', authentification,Controller.listPenjualanFasilitasByMsFasilitasId)
router.get('/detailsById/:id', authentification,Controller.detailsById)
router.post('/delete',authentification,Controller.delete)

module.exports = router