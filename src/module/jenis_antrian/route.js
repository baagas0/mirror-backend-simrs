const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')

router.post('/register', Controller.register)
router.post('/update', Controller.update)
router.post('/list', Controller.list)
router.post('/detailsById', Controller.detailsById)
router.post('/delete', Controller.delete)

module.exports = router