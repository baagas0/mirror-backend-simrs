const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')
const auth = require('../../middleware/auth')

router.post('/register',auth.langsungMasuk("MJA_MHA_FCREATE"), Controller.register)

router.post('/update', auth.langsungMasuk(), Controller.update)

router.post('/list', auth.langsungMasuk(),Controller.list)
router.post('/detailsById',authentification,Controller.detailsById)
router.post('/delete',authentification,Controller.delete)

router.post('/managementAccess',authentification,Controller.managementAccess)

router.get('/getUserAccess/:role_id',authentification,Controller.getUserAccess)
router.post('/registerUserAccess/:role_id',authentification,Controller.registerUserAccess)

router.get('/getMenuAccess/:role_id', authentification, Controller.getMenuAccess)
router.post('/registerMenuAccess/:role_id', authentification, Controller.registerMenuAccess)

router.post('/mappingRoleMenu/list', authentification, Controller.mappingRoleMenu)
router.post('/mappingRoleMenu/register', authentification, Controller.mappingRoleMenuRegister)
module.exports = router