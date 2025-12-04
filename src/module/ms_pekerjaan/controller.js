const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const msPekerjaan = require("./model");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };


class Controller {

    static async register(req, res) {
        const { nama_pekerjaan, keterangan_pekerjaan } = req.body

        msPekerjaan.findAll({ where: { nama_pekerjaan: { [Op.iLike]: nama_pekerjaan } } }).then(data => {
            if (data.length) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                msPekerjaan.create({ id: uuid_v4(), nama_pekerjaan, keterangan_pekerjaan }).then(data2 => {
                    res.status(200).json({ status: 200, message: "sukses", data: data2 });
                }).catch(err => {
                    console.log(req.body);
                    console.log(err);
                    res.status(500).json({ status: 500, message: "gagal", data: err });
                })
            }
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static update(req, res) {
        const { id, nama_pekerjaan, keterangan_pekerjaan } = req.body

        msPekerjaan.update({ nama_pekerjaan, keterangan_pekerjaan }, { where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static delete(req, res) {
        const { id } = req.body

        msPekerjaan.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        const{halaman,jumlah,nama_pekerjaan,keterangan_pekerjaan,search} = req.body

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if(nama_pekerjaan){
                isi+= ` and mp.nama_pekerjaan ilike '%${nama_pekerjaan}%'`
            }
            if(keterangan_pekerjaan){
                isi+= ` and mp.keterangan_pekerjaan ilike '%${keterangan_pekerjaan}%'`
            }
            if(search) {
                isi += ` and mp.nama_pekerjaan ilike '%${search}%' `
            }

            let data = await sq.query(`select * from ms_pekerjaan mp where mp."deletedAt" isnull${isi} order by mp."createdAt" desc ${pagination}`,s);
            let jml = await sq.query(`select count(*) from ms_pekerjaan mp where mp."deletedAt" isnull${isi}`,s)

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static detailsById(req, res) {
        const { id } = req.body;

        msPekerjaan.findAll({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses", data });
        }).catch(err => {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }
}
module.exports = Controller;