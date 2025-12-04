const Controller = require( './controller' );
const router = require( 'express' ).Router();
const authentification = require( '../../middleware/authentification' );

router.post( '/register', authentification, Controller.register );
router.post( '/list', authentification, Controller.list);
router.post( '/detailsById', authentification, Controller.detailsById); 
router.post( '/listByKotaId', authentification, Controller.listByKotaId);
router.post( '/update', authentification, Controller.update );
router.post( '/delete', authentification, Controller.delete );

module.exports = router
