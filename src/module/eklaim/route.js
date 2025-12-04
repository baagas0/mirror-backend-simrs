const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')

// ECLAIM
router.post('/send_to_eklaim',Controller.send_to_eklaim)
router.post('/send_grouper_1',Controller.send_grouper_1)

router.post('/encrypt',Controller.encrypt)
router.post('/decrypt',Controller.decrypt)

router.get('/list',Controller.list)

router.post('/search_diagnosis',authentification, Controller.search_diagnosis)
router.post('/new_claim', authentification, Controller.new_claim)
router.post('/update_patient', authentification, Controller.update_patient)
router.post('/delete_patient', authentification, Controller.delete_patient)
router.post('/set_claim_data', authentification, Controller.set_claim_data)
router.post('/grouper', authentification, Controller.grouper)
router.post('/grouper2', authentification, Controller.grouper2)
router.post('/reedit_claim', authentification, Controller.reedit_claim)
router.post('/send_claim', authentification, Controller.send_claim)
router.post('/claim_final', authentification, Controller.claim_final)
router.post('/send_claim_individual', authentification, Controller.send_claim_individual)
router.post('/delete_claim', authentification, Controller.delete_claim)
router.post('/claim_print', authentification, Controller.claim_print)
router.post('/search_procedures', authentification, Controller.search_procedures)
router.post('/search_diagnosis_inagrouper', authentification, Controller.search_diagnosis_inagrouper)
router.post('/search_procedures_inagrouper', authentification, Controller.search_procedures_inagrouper)
router.post('/sitb_validate', authentification, Controller.sitb_validate)
router.post('/sitb_invalidate', authentification, Controller.sitb_invalidate)
router.post('/generate_claim_number', authentification, Controller.generate_claim_number)

module.exports = router