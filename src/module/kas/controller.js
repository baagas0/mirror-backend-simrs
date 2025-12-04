const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const kas = require("./model");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };


class Controller {

    static async register(req, res) {
        const { coa_code, name, no_rek, contact_person, telp, hp } = req.body

        kas.findAll({ where: { coa_code: { [Op.iLike]: coa_code } } }).then( async data => {
            if (data.length) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                await kas.create({ id: uuid_v4(), coa_code, name, no_rek, contact_person, telp, hp }).then(data2 => {
                    res.status(200).json({ status: 200, message: "sukses", data: data2 });
                })
            }
        }).catch(err => {
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static update(req, res) {
        const { id, coa_code, name, no_rek, contact_person, telp, hp } = req.body
        kas.findAll({ where: { [Op.and]:{ coa_code: { [Op.iLike]: coa_code },id:{[Op.not]:id} }}}).then(data => {
            if (data.length > 0) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                kas.update({ coa_code, name, no_rek, contact_person, telp, hp}, { where: { id } }).then(dataa => {
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

        kas.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        const{halaman,jumlah,coa_code,name,no_rek,contact_person,telp,hp} = req.body

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if(coa_code){
                isi+= ` and k.coa_code = '%${coa_code}%'`
            }
            if(name){
                isi+= ` and k."name" ilike '%${name}%'`
            }
            if(no_rek){
                isi+= ` and k.no_rek ilike '%${no_rek}%'`
            }
            if(contact_person){
                isi+= ` and k.contact_person ilike '%${contact_person}%'`
            }
            if(telp){
                isi+= ` and k.telp ilike '%${telp}%'`
            }
            if(hp){
                isi+= ` and k.hp ilike '%${hp}%'`
            }


            let data = await sq.query(`select * from kas k where k."deletedAt" isnull${isi} order by k.coa_code ${pagination}`,s);
            let jml = await sq.query(`select count(*) from kas k where k."deletedAt" isnull${isi}`,s)

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static detailsById(req, res) {
        const { id } = req.body

        kas.findAll({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses", data });
        }).catch(err => {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }
}
module.exports = Controller;