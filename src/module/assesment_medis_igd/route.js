const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')

router.post('/register', authentification,Controller.register)
router.post('/update',authentification, Controller.update)
router.post('/list',authentification,Controller.list)
router.post('/delete',authentification,Controller.delete)
router.post('/detailsById',authentification,Controller.details_by_id)

module.exports = router