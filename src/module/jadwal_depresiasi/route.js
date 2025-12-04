const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')
const auth = require('../../middleware/auth')

router.get('/list',authentification,Controller.list)
// router.get('/cronJob',authentification,Controller.cronJob)

module.exports = router