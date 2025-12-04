const Controller = require('./controller');
const router = require('express').Router();
const authentification = require('../../middleware/authentification');

router.post('/register', authentification, Controller.register);
router.post('/delete', authentification, Controller.delete);
router.post('/list', authentification, Controller.list);

module.exports = router;