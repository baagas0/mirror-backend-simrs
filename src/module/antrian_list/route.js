const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')

router.post('/registerLoket',authentification, Controller.registerLoket)
router.post('/registerAntrian',authentification, Controller.registerAntrian)
router.post('/update',authentification,Controller.update)
router.post('/list',authentification, Controller.list)
// router.post('/listHalaman',authentification, Controller.listHalaman)
router.get('/listAntrianAktif',authentification, Controller.listAntrianAktif)
router.post('/listAntrianAktifPoli',authentification, Controller.listAntrianAktifPoli)
router.post('/listAntrianByRegistrasiId',authentification, Controller.listAntrianByRegistrasiId)
router.post('/cekNomorAntrian', authentification, Controller.cekNomorAntrian)
router.post('/TambahAntrianLoket', Controller.TambahAntrianLoket)

module.exports = router