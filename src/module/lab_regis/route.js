const Controller = require( './controller' );
const router = require( 'express' ).Router();
const authentification = require( '../../middleware/authentification' );

router.post( '/register', authentification, Controller.register );
router.post( '/update', authentification, Controller.update );
router.post( '/delete', authentification, Controller.delete );
router.post( '/list', authentification, Controller.list);
router.post( '/detailsById', authentification, Controller.detailsById);
router.post( '/createLabHasil', authentification, Controller.createLabHasil);
router.post('/updateSampel', authentification, Controller.updateSampel );
router.post('/statistic', authentification, Controller.statistic );
router.post('/rekap_pemeriksaan', authentification, Controller.rekapExcel );

// New routes for pengambilan sampel
router.post( '/:id/pengambilan-sampel', authentification, Controller.createPengambilanSampel );
router.post( '/:id/start-pengambilan-sampel', authentification, Controller.startPengambilanSampel );
router.post( '/:id/finish-pengambilan-sampel', authentification, Controller.finishPengambilanSampel );
router.post( '/:lab_regis_id/pengambilan-sampel', authentification, Controller.getPengambilanSampelByLabRegis );

module.exports = router