const { verifyToken } = require('../helper/pre_jwt')
const user = require('../module/users/model')

async function authentification (req,res,next){
    try {
        let decode = verifyToken(req.headers.token);
        console.log(decode)
        let masterUser = await user.findAll({where:{id:decode.id,password:decode.password}})
        if(masterUser.length==0){
            res.status(201).json({ status: 201, message: "anda belum login " });
        }else{
            req.dataUsers = decode, 
            next()
        }
    } catch (err) {
        console.log(err);
        if(err.name === 'TokenExpiredError') {
            res.status(201).json({status: 201, message: "Kelamaan coy, pre login cuma 15 detik"});
        } else {
            res.status(201).json({ status: 201, message: "anda belum login"});
        }
    }
}

module.exports = authentification
