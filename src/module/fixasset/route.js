const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')
const auth = require('../../middleware/auth')
const v = require('../../helper/validation')

router.post('/register',auth.langsungMasuk(""), Controller.register)
router.post('/update',auth.langsungMasuk(""), Controller.update)
router.post('/list',authentification, Controller.list)
router.post('/detailsById/:id',authentification, Controller.detailsById)
router.post('/delete',auth.langsungMasuk(""), Controller.delete)

module.exports = router