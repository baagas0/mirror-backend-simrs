const Controller = require('./controller')
const router = require('express').Router()
const upload = require('../../helper/upload')
const authentification = require('../../middleware/authentification')

router.post('/register',authentification,upload,Controller.register)
router.post('/acceptedPersetujuan',authentification,Controller.acceptedPersetujuan)
router.post('/deleteMember',authentification,Controller.deleteMember)
router.post('/update',authentification,Controller.update)
router.post('/cekPasien', Controller.cekPasien)
router.post('/listMemberByUserId', Controller.listMemberByUserId)
router.post('/listMemberBelumDiverifikasiByUserId', Controller.listMemberBelumDiverifikasiByUserId)
router.post('/listMemberDitolakByUserId', Controller.listMemberDitolakByUserId)
router.post('/listMemberBaru', Controller.listMemberBaru)
router.post('/detailsById', Controller.detailsById)

module.exports = router