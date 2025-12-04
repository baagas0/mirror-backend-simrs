const Controller = require('./controller');
const router = require('express').Router();
const authentification = require('../../middleware/authentification');


router.post('/register', authentification, Controller.register);
router.post('/update', authentification, Controller.update);
router.post('/delete', authentification, Controller.delete);
router.post('/list', authentification, Controller.list);
router.get('/detailsById/:id', authentification, Controller.detailsById);
router.post('/listBracket', authentification, Controller.listBrackets);
router.post('/listCoaByParentLevel', authentification, Controller.listCoaByParentLevel);


module.exports = router