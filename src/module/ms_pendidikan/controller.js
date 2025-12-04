const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const msPendidikan = require("./model");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };


class Controller {

    static async register(req, res) {
        const { nama_pendidikan, keterangan_pendidikan } = req.body

        msPendidikan.findAll({ where: { nama_pendidikan: { [Op.iLike]: nama_pendidikan } } }).then(data => {
            if (data.length) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                msPendidikan.create({ id: uuid_v4(), nama_pendidikan, keterangan_pendidikan }).then(data2 => {
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
        const { id, nama_pendidikan, keterangan_pendidikan } = req.body

        msPendidikan.update({ nama_pendidikan, keterangan_pendidikan }, { where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static delete(req, res) {
        const { id } = req.body

        msPendidikan.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        const{halaman,jumlah,nama_pendidikan,keterangan_pendidikan,search} = req.body

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if(nama_pendidikan){
                isi+= ` and mp.nama_pendidikan ilike '%${nama_pendidikan}%'`
            }
            if(keterangan_pendidikan){
                isi+= ` and mp.keterangan_pendidikan ilike '%${keterangan_pendidikan}%'`
            }
            if(search) {
                isi += ` and mp.nama_pendidikan ilike '%${search}%' `
            }

            let data = await sq.query(`select * from ms_pendidikan mp where mp."deletedAt" isnull${isi} order by mp."createdAt" desc ${pagination}`,s);
            let jml = await sq.query(`select count(*) from ms_pendidikan mp where mp."deletedAt" isnull${isi}`,s)

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static detailsById(req, res) {
        const { id } = req.body;

        msPendidikan.findAll({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses", data });
        }).catch(err => {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }
}
module.exports = Controller;