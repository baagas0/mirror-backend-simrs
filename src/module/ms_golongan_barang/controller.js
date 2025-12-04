const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const msGolonganBarang = require("./model");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };


class Controller {

    static register(req, res) {
        const { nama_golongan_barang } = req.body

        msGolonganBarang.findAll({ where: { nama_golongan_barang: { [Op.iLike]: nama_golongan_barang } } }).then(data => {
            if (data.length > 0) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                msGolonganBarang.create({ id: uuid_v4(), nama_golongan_barang }).then(data => {
                    res.status(200).json({ status: 200, message: "sukses", data });
                }).catch(err => {
                    
                    res.status(500).json({ status: 500, message: "gagal", data: err });
                })
            }
        }).catch(err => {
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static update(req, res) {
        const { id, nama_golongan_barang } = req.body

        msGolonganBarang.update({ nama_golongan_barang }, { where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static delete(req, res) {
        const { id } = req.body

        msGolonganBarang.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        const{halaman,jumlah,nama_golongan_barang} = req.body

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if(nama_golongan_barang){
                isi+= ` and mgb.nama_golongan_barang ilike '%${nama_golongan_barang}%'`
            }

            let data = await sq.query(`select * from ms_golongan_barang mgb where mgb."deletedAt" isnull${isi} order by mgb."createdAt" desc ${pagination}`,s);
            let jml = await sq.query(`select count(*) from ms_golongan_barang mgb where mgb."deletedAt" isnull${isi}`,s)

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static detailsById(req, res) {
        const { id } = req.body

        msGolonganBarang.findAll({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses", data });
        }).catch(err => {
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }
}
module.exports = Controller;