const router = require("express").Router();

// router.use("/Ecounter", require('./Ecounter/route'));
router.use("/patient", require('./patient/route'));
router.use("/location", require('./location/route'));
router.use("/practitioner", require('./practitioner/route'));
router.use("/organization", require('./organization/route'));

module.exports = router;