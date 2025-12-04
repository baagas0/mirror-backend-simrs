const Controller = require( './controller' );
const router = require( 'express' ).Router();
const authentification = require( '../../middleware/authentification' );

router.post('/register', authentification, Controller.register );
router.post('/list', authentification, Controller.list);
router.post('/detailsById', authentification, Controller.detailsById);
router.post('/update', authentification, Controller.update );
router.post('/delete', authentification, Controller.delete );

// New endpoints for expertise integration
router.post('/list-with-expertise', authentification, Controller.listWithExpertise);
router.post('/get-by-radiolog', authentification, Controller.getByRadiolog);

module.exports = router
