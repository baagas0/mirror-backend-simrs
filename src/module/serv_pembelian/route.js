const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')
const upload = require('../../helper/upload')

router.post('/registerPembayaranExcel', authentification, upload, Controller.registerPembayaranExcel)
router.post('/list', authentification, Controller.list)
router.post('/listPerHalaman', authentification, Controller.listPerHalaman)
router.post('/listPembelianByKodeServPembelian', authentification, Controller.listPembelianByKodeServPembelian)

module.exports = router