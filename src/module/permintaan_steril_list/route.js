const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')
const auth = require('../../middleware/auth')

router.post('/register',authentification, Controller.register)
router.post('/update',authentification, Controller.update)
router.post('/list',authentification,Controller.list)
router.post('/detailsById',authentification,Controller.detailsById)
router.post('/delete',authentification,Controller.delete)
router.post('/updateStatus',authentification,Controller.updateStatus)
module.exports = router