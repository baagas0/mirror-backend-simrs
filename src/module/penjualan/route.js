const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')

router.post('/register', authentification,Controller.register)
router.post('/registerBulk', authentification,Controller.registerBulk)
router.post('/update', authentification,Controller.update)
router.post('/changeStatusPenjualan', authentification,Controller.changeStatusPenjualan)
router.post('/list', authentification,Controller.list)
// router.post('/listPerhalaman', authentification,Controller.listPerhalaman)
router.post('/listPenjualanNonTagihanPerHalaman', authentification,Controller.listPenjualanNonTagihanPerHalaman)
router.post('/listPenjualanByTagihanId', authentification,Controller.listPenjualanByTagihanId)
router.post('/detailsById', authentification,Controller.detailsById)
router.post('/delete',authentification,Controller.delete)

router.post('/listPenjualanBmhp',authentification,Controller.listPenjualanBmhp)

module.exports = router