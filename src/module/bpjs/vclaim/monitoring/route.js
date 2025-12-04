const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../../../middleware/authentification')


router.post('/getDataKlaim',authentification,Controller.getDataKlaim)
router.post('/getDataKunjungan',authentification,Controller.getDataKunjungan)
router.post('/getDataHistoriPelayananPeserta',authentification,Controller.getDataHistoriPelayananPeserta)

module.exports = router