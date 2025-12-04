const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const msEtnis = require("./model");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };


class Controller {

    static async register(req, res) {
        const { nama_etnis, keterangan_etnis } = req.body

        msEtnis.findAll({ where: { nama_etnis: { [Op.iLike]: nama_etnis } } }).then( async data => {
            if (data.length) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                await msEtnis.create({ id: uuid_v4(), nama_etnis, keterangan_etnis }).then(data2 => {
                    res.status(200).json({ status: 200, message: "sukses", data: data2 });
                })
            }
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static update(req, res) {
        const { id, nama_etnis, keterangan_etnis } = req.body

        msEtnis.update({ nama_etnis, keterangan_etnis }, { where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static delete(req, res) {
        const { id } = req.body

        msEtnis.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        const{halaman,jumlah,nama_etnis,keterangan_etnis,search} = req.body

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if(nama_etnis){
                isi+= ` and me.nama_etnis ilike '%${nama_etnis}%'`
            }
            if(keterangan_etnis){
                isi+= `  and me.keterangan_etnis ilike '%${keterangan_etnis}%'`
            }
            if(search) {
                isi += ` and me.nama_etnis ilike '%${search}%' `
            }

            let data = await sq.query(`select * from ms_etnis me where me."deletedAt" isnull${isi} order by me."createdAt" desc ${pagination}`,s);
            let jml = await sq.query(`select count(*) from ms_etnis me where me."deletedAt" isnull${isi}`,s)

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static detailsById(req, res) {
        const { id } = req.body

        msEtnis.findAll({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses", data });
        }).catch(err => {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }
}
module.exports = Controller;