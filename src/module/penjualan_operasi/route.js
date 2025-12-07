const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')

router.post('/register', authentification, Controller.register)
router.post('/update', authentification, Controller.update)
router.get('/list', authentification, Controller.list)
router.post('/listPenjualanOperasiByPenjualanId', authentification, Controller.listPenjualanOperasiByPenjualanId)
router.post('/listPenjualanOperasiByMsBarangId', authentification, Controller.listPenjualanOperasiByMsBarangId)
router.post('/listPenjualanOperasiByRegistrasiId', authentification, Controller.listPenjualanOperasiByRegistrasiId)
router.get('/detailsById/:id', authentification, Controller.detailsById)
router.post('/delete', authentification, Controller.delete)

module.exports = router

