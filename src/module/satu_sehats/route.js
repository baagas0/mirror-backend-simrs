const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')


router.post('/request', Controller.request);
router.post('/syncEncounter', authentification, Controller.syncEncounter);
router.post('/syncSatuSehat', authentification, Controller.syncSatuSehat);
router.post('/syncCondition', authentification, Controller.syncCondition);
router.post('/syncObservation', authentification, Controller.syncObservation);
router.post('/syncProcedureRajal', authentification, Controller.syncProcedureRajal);
router.post('/syncPlanningRajal', authentification, Controller.syncPlanningRajal);
router.post('/syncClinicalImpressionRajal', authentification, Controller.syncClinicalImpressionRajal);
router.post('/syncDietRajal', authentification, Controller.syncDietRajal);
router.post('/syncKontrolRajal', authentification, Controller.syncKontrolRajal);
router.post('/syncAlergiIntoleranRajal', authentification, Controller.syncAlergiIntoleranRajal);

module.exports = router