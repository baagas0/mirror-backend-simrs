const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')
const auth = require('../../middleware/auth')

router.post('/register',authentification, Controller.register)
router.post('/update',authentification, Controller.update)
router.post('/list',authentification,Controller.list)
router.post('/detailsById',authentification,Controller.detailsById)
router.post('/delete',authentification,Controller.delete)

router.post('/set_batal',authentification,Controller.set_batal)
router.post('/set_menunggu',authentification,Controller.set_menunggu)
router.post('/set_proses',authentification,Controller.set_proses)
router.post('/set_selesai',authentification,Controller.set_selesai)

router.post('/pasien_operasi/list', authentification, Controller.pasienOperasiList)
router.post('/pasien_operasi/details', authentification, Controller.pasienOperasiDetails)

module.exports = router