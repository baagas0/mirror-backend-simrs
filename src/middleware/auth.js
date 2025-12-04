// let jwt = require('../helper/jwt');
const { verifyToken } = require('../helper/jwt')
let management_accessModel = require('../module/roles/model');
let menuModel = require('../module/menu/model');
let { QueryTypes } = require('sequelize');
// const db = require('../config/connection')
const { sq } = require("../config/connection");
// const cache = require('../config/redisCon')

const { createClient } = require("redis")
const client = createClient({ url: `redis://${process.env.HOST_REDIS}:${process.env.PORT_REDIS}`, legacyMode: true });
client.connect().catch(console.error)

class Authentification{

    static Manageaccess(array){
        return async (req, res, next)=>{
            if(req.headers.token){
                try{
                    let hasil = verifyToken(req.headers.token);
                    /** REDIS */
                    client.setEx(`tkn_${hasil.username}_${hasil.id}`, 1800, req.headers.token);
                    req.dataUsers = hasil, 
                    next()
                    await client.ttl(`tkn_${hasil.username}_${hasil.id}`, async function(err, replies){
                        // if (replies < 0 )
                        // {
                        //     res.status(201).json({ status: 201, message: "Tidak ada interaksi selama 3 menit, login ulang coyyy." });
                        // }
            
                        req.dataUsers = hasil, 
                        client.setEx(`tkn_${hasil.username}_${hasil.id}`, 1800, req.headers.token);
                        next()
                    });
                    
                    // let querysearch = await sq.query(
                    //     `
                    //         SELECT 
                    //             menu.code
                    //         FROM role_access 
                    //         join menu on menu.id = role_access.menu_id 
                            
                    //         where true 
                    //         and role_access.role_id = '${hasil.role_id}'
                    //         and menu.code = '${array}'
                    //         and menu."deletedAt" is null
                            
                    //         ORDER BY id ASC
                    //     `,
                    //     { type: QueryTypes.SELECT }
                    // );
                    // if(querysearch.length > 0){
                    //     req.dataUsers = hasil;
                        
                    //     /** REDIS */
                    //     await client.ttl(`tkn_${hasil.username}_${hasil.id}`, async function(err, replies){
                    //         if (replies < 0 )
                    //         {
                    //             res.status(201).json({ status: 201, message: "Tidak ada interaksi selama 3 menit, login ulang coyyy." });
                    //         }
                
                    //         req.dataUsers = hasil, 
                    //         client.setEx(`tkn_${hasil.username}_${hasil.id}`, 1800, req.headers.token);
                    //         next()
                    //     });
                    // }else{
                    //     res.status(201).json({
                    //         status:201, message: "user anda tidak memiliki akses !"
                    //     });
                    // }
                }catch(err){
                    res.status(201).json({status:201, message: "token salah !"});
                }
            }else{
                res.status(201).json({status:201, message: "Anda Belum Login !"});
            }
        }
    }

    static langsungMasuk(listrole){
        return async (req, res, next)=>{
            if(req.headers.token){
                try{
                    let hasil = verifyToken(req.headers.token);
                    req.dataUsers = hasil;
                    
                    /** REDIS */
                    await client.ttl(`tkn_${hasil.username}_${hasil.id}`, async function(err, replies){
                        if (replies < 0 )
                        {
                            res.status(401).json({ status: 401, message: "Tidak ada interaksi selama 3 menit, login ulang coyyy." });
                            return;
                        }
            
                        req.dataUsers = hasil, 
                        client.setEx(`tkn_${hasil.username}_${hasil.id}`, 1800, req.headers.token);
                        next()
                    });
                            
                }catch(err){
                    console.log(err)
                    res.status(201).json({status:201, message: "token salah | ceklogin", err})
                    return;
                }
            }else{
                res.status(201).json({status:201, message: "Anda Belum Login | ceklogin"})
                return;
            }
        }
    }

}

module.exports = Authentification;
