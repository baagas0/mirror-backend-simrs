const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const settingKodeAkun = require("./model");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };


class Controller {

    static async register(req, res) {
        const t = await sq.transaction()
        let data = req.body
        try {
            await settingKodeAkun.destroy({ where: { kode_kategori:data[0].kode_kategori },force:true },{transaction:t})
            for(let i=0;i<data.length;i++){
                data[i].id=uuid_v4();
            }
            await settingKodeAkun.bulkCreate(data,{transaction:t});
            await t.commit()
            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            await t.rollback()
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static update(req, res) {
        const { id, kode_kategori,kode, setting_1,setting_2,setting_3,d_k,keterangan } = req.body
        settingKodeAkun.findAll({ where: { [Op.and]:{ kode_kategori: { [Op.iLike]: kode_kategori },id:{[Op.not]:id},kode }}}).then(data => {
            if (data.length > 0) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                settingKodeAkun.update({ kode_kategori,kode, setting_1,setting_2,setting_3,d_k,keterangan }, { where: { id } }).then(dataa => {
                    console.log(dataa);
                    res.status(200).json({ status: 200, message: "sukses" });
                }).catch(err => {
                    res.status(500).json({ status: 500, message: "gagal", data: err });
                })
            }
        }).catch(err => {
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
        
    }

    static delete(req, res) {
        const { id } = req.body

        settingKodeAkun.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        const{halaman,jumlah,kode_kategori,kode,setting_1,setting_2,setting_3,d_k,keterangan} = req.body

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if(kode_kategori){
                isi+= ` and ska.kode_kategori ilike '%${kode_kategori}%'`
            }
            if(kode){
                isi+= ` and ska.kode ilike '%${kode}%'`
            }
            if(setting_1){
                isi+= ` and ska.setting_1 ilike '%${setting_1}%'`
            }
            if(setting_2){
                isi+= ` and ska.setting_2 ilike '%${setting_2}%'`
            }
            if(setting_3){
                isi+= ` and ska.setting_3 ilike '%${setting_3}%'`
            }
            if(d_k){
                isi+= ` and ska.d_k = '${d_k}'`
            }
            if(keterangan){
                isi+= ` and ska.keterangan ilike '%${keterangan}%'`
            }

            let data = await sq.query(`select * from setting_kode_akun ska where ska."deletedAt" isnull${isi} order by ska."createdAt" desc ${pagination}`,s);
            let jml = await sq.query(`select count(*) from setting_kode_akun ska where ska."deletedAt" isnull${isi} `,s)

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static detailsById(req, res) {
        const { id } = req.body

        settingKodeAkun.findAll({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses", data });
        }).catch(err => {
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }
    
    static listParam(req, res) {
        const {kode_kategori}=req.body;
        let q={where:{}};
        if(kode_kategori){
            q={where:{kode_kategori}}
        }
        settingKodeAkun.findAll(q).then(data => {
            res.status(200).json({ status: 200, message: "sukses", data });
        }).catch(err => {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }
}
module.exports = Controller;