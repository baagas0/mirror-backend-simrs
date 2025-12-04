const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')

router.post('/register', authentification, Controller.register)
router.post('/update', authentification, Controller.update)
router.post('/delete', authentification, Controller.delete)
router.post('/deleteInternal', authentification, Controller.deleteInternal)
router.post('/pengajuan', authentification, Controller.pengajuan)
router.post('/approvalPengajuanSEP', authentification, Controller.approvalPengajuanSEP)
router.post('/updateTanggalPulang', authentification, Controller.updateTanggalPulang)
router.post('/list',authentification, Controller.list)
router.post('/detailsById', authentification,Controller.detailsById)
router.post('/detailsByRegistrasiId', authentification,Controller.detailsByRegistrasiId)


module.exports = router