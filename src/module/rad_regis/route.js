const Controller = require( './controller' );
const router = require( 'express' ).Router();
const authentification = require( '../../middleware/authentification' );

router.post('/register', authentification, Controller.register );
router.post('/list', authentification, Controller.list);
router.post('/detailsById', authentification, Controller.detailsById);
router.post('/update', authentification, Controller.update );
router.post('/delete', authentification, Controller.delete );
router.post('/createradhasil', authentification, Controller.createRadHasil );
router.post('/updateSampel', authentification, Controller.updateSampel );
router.post('/statistic', authentification, Controller.statistic );
router.post('/cancel', authentification, Controller.cancel );

module.exports = router
