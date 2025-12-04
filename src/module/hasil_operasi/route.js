const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')
const auth = require('../../middleware/auth')

router.post('/upsert',authentification, Controller.upsert)
router.post('/register',authentification, Controller.register)
router.post('/update',authentification, Controller.update)
router.post('/list',authentification,Controller.list)
router.post('/detailsById',authentification,Controller.detailsById)
router.post('/detailsByJadwalOperasiId',authentification,Controller.detailsByJadwalOperasiId)
router.post('/update_mapping_operasi',authentification,Controller.update_mapping_operasi)

// Route untuk Laporan Operasi
router.post('/laporan/rekap', authentification, Controller.laporanRekap)
router.post('/laporan/rekap/export', authentification, Controller.laporanRekapExport)

// router.post('/delete',authentification,Controller.delete)
module.exports = router