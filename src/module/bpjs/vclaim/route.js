const router = require('express').Router()


router.use('/monitoring',require('./monitoring/route'))
router.use('/peserta',require('./peserta/route'))
router.use('/refrensi',require('./referensi/route'))
router.use('/rencanaKontrol',require('./rencana_kontrol/route'))
router.use('/rujukan',require('./rujukan/route'))
router.use('/sep',require('./sep/route'))

module.exports = router