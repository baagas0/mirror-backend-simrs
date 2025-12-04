const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')
const upload = require('../../helper/upload')

router.post('/register', authentification,Controller.register)
router.post('/update', authentification,Controller.update)
router.get('/list', authentification,Controller.list)
router.get('/detailsById/:id', authentification,Controller.detailsById)
router.post('/delete',authentification,Controller.delete)
router.get('/downloadStockByGudangId',Controller.downloadStockByGudangId)
router.post('/simpanStockOpname',Controller.simpanStockOpname)
router.post('/uploadExcel',authentification,upload,Controller.uploadExcel)

module.exports = router