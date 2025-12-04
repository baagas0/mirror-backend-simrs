const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')

router.post('/register', authentification, Controller.register)
router.post('/update', authentification, Controller.update)
router.post('/updateBulk', authentification, Controller.updateBulk)
router.post('/list', authentification, Controller.list)
router.post('/detailsById', authentification, Controller.detailsById)
router.post('/delete', authentification, Controller.delete)
router.post('/listFasilitasByMsJenisFasilitasId', authentification, Controller.listFasilitasByMsJenisFasilitasId)

module.exports = router