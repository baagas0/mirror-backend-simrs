const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')
const auth = require('../../middleware/auth')

router.post('/register',authentification,Controller.register)
router.post('/update',authentification,Controller.update)
router.post('/list',authentification,Controller.list)
router.post('/list',authentification,Controller.list)
router.post('/listPenjualanPenunjangByPenjualanId',authentification,Controller.listPenjualanPenunjangnByPenjualanId)
router.post('/listPenjualanPenunjangnByPenunjangId',authentification,Controller.listPenjualanPenunjangnByPenunjangId)
router.post('/delete',authentification,Controller.delete)
router.post('/detailsById',authentification,Controller.detailsById)
module.exports = router