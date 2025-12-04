const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')

router.post('/register', authentification,Controller.register)
router.post('/registerPo', authentification,Controller.registerPo)
router.post('/update', authentification,Controller.update)
router.post('/list', authentification,Controller.list)
router.post('/detailsById', authentification,Controller.detailsById)
router.post('/delete',authentification,Controller.delete)
router.post('/closed',authentification,Controller.closed)
router.post('/getWithSub',authentification,Controller.getWithSub)
router.post('/changeStatus',authentification,Controller.changeStatus)
router.post('/havePo',authentification,Controller.havePo)
router.post('/haveSub',authentification,Controller.haveSub)
router.post('/listClosedPembelian',authentification,Controller.listClosedPembelian)
router.post('/hapus',authentification,Controller.hapus)

module.exports = router