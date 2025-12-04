const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')

router.post('/register', Controller.register)
router.post('/update', Controller.update)
router.post('/list',Controller.list)
router.post('/list_tree',Controller.list_tree)
router.post('/delete',Controller.delete)
router.post('/detailsById', Controller.detailsById)

module.exports = router