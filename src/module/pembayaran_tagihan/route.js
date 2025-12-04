const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')

router.post('/register', authentification,Controller.register)
router.post('/update', authentification,Controller.update)
router.post('/list', authentification,Controller.list)
router.post('/listPembayaranTagihanByMsKasId', authentification,Controller.listPembayaranTagihanByMsKasId)
router.post('/listPembayaranTagihanByTagihanId', authentification,Controller.listPembayaranTagihanByTagihanId)
router.get('/detailsById/:id', authentification,Controller.detailsById)
router.post('/delete',authentification,Controller.delete)

module.exports = router