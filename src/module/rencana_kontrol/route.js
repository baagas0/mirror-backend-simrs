const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')

router.post('/register', authentification, Controller.register)
router.post('/update', authentification, Controller.update)
router.post('/delete', authentification, Controller.delete)
router.post('/list',authentification, Controller.list)
router.post('/detailsById', authentification,Controller.detailsById)


module.exports = router