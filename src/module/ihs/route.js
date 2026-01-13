const router = require("express").Router();
const controller = require("./controller");

router.post("/organization_id", controller.organization_id);
router.post("/request", controller.request);

module.exports = router;
