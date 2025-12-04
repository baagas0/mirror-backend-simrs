const Controller = require('./controller');
const router = require('express').Router();


router.post('/get_organization_by_id', Controller.get_organization_by_id);
router.post('/get_organization', Controller.get_organization);
router.post('/add_organization', Controller.add_organization);

module.exports = router