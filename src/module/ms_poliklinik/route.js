const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')
const auth = require('../../middleware/auth')

router.post('/register',auth.Manageaccess("MTR_PLK_CRT"), Controller.register)
router.post('/update',auth.Manageaccess("MTR_PLK_UPD"), Controller.update)
router.post('/list',Controller.list)
router.post('/detailsById',Controller.detailsById)
router.post('/delete',auth.Manageaccess("MTR_PLK_DLT"),Controller.delete)
module.exports = router