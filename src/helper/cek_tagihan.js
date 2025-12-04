const { sq } = require("../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };
const moment = require('moment');

function cekTagihanByPenjualanId (data){
    return new Promise(async(resolve, reject) => {
        const {penjualan_id} = data
        try {
            let cek = false;
            let cekTagihan = await sq.query(`select * from tagihan t
            where t."deletedAt" isnull and (t.id = (select pr.tagihan_id from pool_registrasi pr join penjualan p on p.registrasi_id = pr.registrasi_id 
            where pr."deletedAt" isnull and p.id ='${penjualan_id}' limit 1) 
            or t.id = (select pe.tagihan_id from pool_external pe where pe."deletedAt" isnull and pe.penjualan_id = '${penjualan_id}'))`,s);
            
            if(cekTagihan.length>0){
                if(cekTagihan != 1){
                    cek = true
                }
            }

            resolve(cek)
        } catch (err) {
            console.log(err);
            console.log("erorr cekTagihanByPenjualanId");
            reject(err)
        }
    });
}

function cekTagihanByRegistrasiId (data){
    return new Promise(async(resolve, reject) => {
        const {registrasi_id} = data
        try {
            let cek = false;
            let cekTagihan = await sq.query(`select * from pool_registrasi pr where pr."deletedAt" isnull and pr.registrasi_id = '${!registrasi_id?"":registrasi_id}'`,s);

            if(cekTagihan.length>0){
                if(cekTagihan != 1){
                    cek = true
                }
            }

            resolve(cek)
        } catch (err) {
            console.log(err);
            console.log("erorr cekTagihanByRegistrasiId");
            reject(err)
        }
    });
}


module.exports = {cekTagihanByPenjualanId,cekTagihanByRegistrasiId}