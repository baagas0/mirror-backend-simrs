const Controller = require('./controller');
const router = require('express').Router();

router.get('/list', Controller.list);

module.exports = router;