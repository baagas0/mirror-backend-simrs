const router = require('express').Router()
const controller = require('./controller')


router.use('/vclaim', require('./vclaim/route'))
router.use('/antrean_rs', require('./antrean_rs/route'))
// router.post('/getPesertaByNoKartu',controller.getPesertaByNoKartu)

module.exports = router