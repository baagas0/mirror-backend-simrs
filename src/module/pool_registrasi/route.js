const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')

router.post('/register', authentification,Controller.register)
router.post('/update', authentification,Controller.update)
router.post('/list', authentification,Controller.list)
router.post('/listPoolRegistrasiByRegistrasiId', authentification,Controller.listPoolRegistrasiByRegistrasiId)
router.post('/listPoolRegistrasiByTagihanId', authentification,Controller.listPoolRegistrasiByTagihanId)
router.get('/detailsById/:id', authentification,Controller.detailsById)
router.post('/delete',authentification,Controller.delete)
router.post('/changeMain',authentification,Controller.changeMain)

module.exports = router