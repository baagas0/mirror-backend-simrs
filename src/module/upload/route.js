const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')
var multer  = require('multer')

const storage = multer.diskStorage({
    destination:'./asset/file/',
    filename:function(req,file,cb){
        cb(null,Date.now()+file.originalname)
    }
})

const upload=multer({
    storage:storage
}).fields([{ name: 'file'}])

router.post('/', authentification, upload, Controller.index)
module.exports = router