const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')

router.post('/register', authentification, Controller.register)
router.post('/update', authentification, Controller.update)
router.get('/list', authentification, Controller.list)
router.post('/listPenjualanBmhpByPenjualanId', authentification, Controller.listPenjualanBmhpByPenjualanId)
router.post('/listPenjualanBmhpByOperasiBmhpId', authentification, Controller.listPenjualanBmhpByOperasiBmhpId)
router.post('/listPenjualanBmhpByRegistrasiId', authentification, Controller.listPenjualanBmhpByRegistrasiId)
router.get('/detailsById/:id', authentification, Controller.detailsById)
router.post('/delete', authentification, Controller.delete)
router.post('/createFromOperasiBmhp', authentification, Controller.createFromOperasiBmhp)

module.exports = router

