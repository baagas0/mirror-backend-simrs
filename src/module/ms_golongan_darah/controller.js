const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const msGolonganDarah = require("./model");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };


class Controller {

    static async register(req, res) {
        const { nama_golongan_darah, keterangan_golongan_darah } = req.body

        msGolonganDarah.findAll({ where: { nama_golongan_darah: { [Op.iLike]: nama_golongan_darah } } }).then(data => {
            if (data.length) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                msGolonganDarah.create({ id: uuid_v4(), nama_golongan_darah, keterangan_golongan_darah }).then(data2 => {
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
        const { id, nama_golongan_darah, keterangan_golongan_darah } = req.body

        msGolonganDarah.update({ nama_golongan_darah, keterangan_golongan_darah }, { where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static delete(req, res) {
        const { id } = req.body

        msGolonganDarah.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        const{halaman,jumlah,nama_golongan_darah,keterangan_golongan_darah,search} = req.body

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if(nama_golongan_darah){
                isi+= ` and mgd.nama_golongan_darah ilike '%${nama_golongan_darah}%'`
            }
            if(keterangan_golongan_darah){
                isi+= ` and mgd.keterangan_golongan_darah ilike '%${keterangan_golongan_darah}%'`
            }
            if(search) {
                isi += ` and mgd.nama_golongan_darah ilike '%${search}%' `
            }

            let data = await sq.query(`select * from ms_golongan_darah mgd where mgd."deletedAt" isnull${isi} order by mgd.nama_golongan_darah ${pagination}`,s);
            let jml = await sq.query(`select count(*) from ms_golongan_darah mgd where mgd."deletedAt" isnull${isi}`,s)

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static detailsById(req, res) {
        const { id } = req.body

        msGolonganDarah.findAll({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses", data });
        }).catch(err => {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }
}
module.exports = Controller;