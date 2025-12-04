const Controller = require('./controller');
const router = require('express').Router();
const authentification = require('../../middleware/authentification');

// Basic CRUD operations
router.post('/register', authentification, Controller.register);
router.post('/update', authentification, Controller.update);
router.post('/delete', authentification, Controller.delete);
router.post('/list', authentification, Controller.list);
router.post('/detailsById', authentification, Controller.detailsById);

// Additional operations
router.post('/updateStatus', authentification, Controller.updateStatus);
router.post('/getItems', authentification, Controller.getItems);
router.post('/dashboard', authentification, Controller.dashboard);

module.exports = router;