const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')
const auth = require('../../middleware/auth')

router.post('/statistik_poliklinik', authentification, Controller.statistik_poliklinik)
router.post('/statistik_diagnosa',authentification,Controller.statistik_diagnosa)


module.exports = router