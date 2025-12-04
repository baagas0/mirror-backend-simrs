const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')

router.post('/register', authentification,Controller.register)
router.post('/update', authentification,Controller.update)
router.get('/list', authentification,Controller.list)
router.post('/listPenjualanBarangByPenjualanId', authentification,Controller.listPenjualanBarangByPenjualanId)
router.post('/listPenjualanBarangByMsBarangId', authentification,Controller.listPenjualanBarangByMsBarangId)
router.get('/detailsById/:id', authentification,Controller.detailsById)
router.get('/cobaStock',Controller.cobaStock)
router.post('/delete',authentification,Controller.delete)

module.exports = router