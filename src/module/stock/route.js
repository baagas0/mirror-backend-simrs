const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')

router.post('/register', authentification, Controller.register)
router.post('/update', authentification, Controller.update)
router.post('/list', authentification, Controller.list)
router.post('/detailStockBarangByGudang', authentification, Controller.detailStockBarangByGudang)
router.post('/delete', authentification, Controller.delete)
router.post('/listStockByGudangId', authentification, Controller.listStockByGudangId)
router.post('/listStockBarangJualPerHalaman', authentification, Controller.listStockBarangJualPerHalaman)
router.post('/listStockByGudangIdPerHalaman', authentification, Controller.listStockByGudangIdPerHalaman)
router.post('/kartuStok', authentification, Controller.kartuStok)
router.post('/laporanNarkotik', authentification, Controller.laporanNarkotik)
router.get('/downloadKartuStok', Controller.downloadKartuStok)
router.get('/downloadLaporanNarkotik', Controller.downloadLaporanNarkotik)

module.exports = router