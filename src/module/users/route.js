const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')
const pre_authentification = require('../../middleware/pre_authentification')

router.post('/register', Controller.register);

router.post('/preLogin', Controller.pre_login);
router.post('/login', pre_authentification, Controller.login);

router.post('/update', authentification, Controller.update);
router.post('/delete', authentification, Controller.delete);
router.post('/list',authentification,Controller.list);
router.post('/detailsById',authentification,Controller.detailsById);

router.post('/mappingRoleUser/list', authentification, Controller.mappingRoleUser)
router.post('/mappingRoleUser/register', authentification, Controller.mappingRoleUserRegister)

module.exports = router