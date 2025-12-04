const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')
const auth = require('../../middleware/auth')

router.post('/register',auth.Manageaccess("MTR_LYN_CRT"), Controller.register)
router.post('/update',auth.Manageaccess("MTR_LYN_UPD"), Controller.update)
router.post('/list',authentification,Controller.list)
router.post('/detailsById',authentification,Controller.detailsById)
router.post('/delete',auth.Manageaccess("MTR_LYN_DLT"),Controller.delete)
module.exports = router