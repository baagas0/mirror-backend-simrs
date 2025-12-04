const router = require('express').Router()
const controller = require('./controller')

router.post('/product/list',controller.product)
router.post('/syncProduct',controller.syncProduct)

module.exports = router