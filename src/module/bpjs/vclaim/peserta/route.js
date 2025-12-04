const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../../../middleware/authentification')


router.post('/getPesertaByNoKartu',authentification,Controller.getPesertaByNoKartu)


module.exports = router