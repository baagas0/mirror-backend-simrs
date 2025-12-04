const { verifyToken } = require('../helper/jwt')
const user = require('../module/users/model')

const { createClient } = require("redis")
const client = createClient({ url: `redis://${process.env.HOST_REDIS}:${process.env.PORT_REDIS}`, legacyMode: true });
client.connect().catch(console.error)

// async function authentification (req,res,next){
//     try {
//         let decode = verifyToken(req.headers.token);

//         await client.ttl(`tkn_${decode.username}_${decode.id}`, async function(err, replies){
//             if (replies < 0 )
//             {
//                 res.status(201).json({ status: 201, message: "Tidak ada interaksi selama 30 menit, login ulang coyyy." });
//             }else{
//                 let masterUser = await user.findAll({where:{id:decode.id,password:decode.password}})
            
//                 if(masterUser.length==0){
//                     res.status(201).json({ status: 201, message: "anda belum login" });
//                 }else{
//                     req.dataUsers = decode, 
//                     client.setEx(`tkn_${decode.username}_${decode.id}`, 1800, req.headers.token);
//                     next()
//                 }
//             }    
//         });

//     } catch (err) {
//         console.log(err);
//         res.status(201).json({ status: 201, message: "anda belum login" });
//     }
// }

async function authentification (req,res,next){
    try {
        let hasil = verifyToken(req.headers.token);
        req.dataUsers = hasil;
        next()
    } catch (err) {
        console.log(err);
        res.status(201).json({ status: 201, message: "anda belum login" });
    }
}

module.exports = authentification
