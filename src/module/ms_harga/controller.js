const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const msHarga = require("./model");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };


class Controller {

    static async register(req, res) {
        const { nama_harga, keterangan } = req.body

        msHarga.findAll({ where: { nama_harga: { [Op.iLike]: nama_harga } } }).then( async data => {
            if (data.length) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                await msHarga.create({ id: uuid_v4(), nama_harga, keterangan }).then(data2 => {
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
        const { id, nama_harga, keterangan } = req.body

        msHarga.update({ nama_harga, keterangan }, { where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static delete(req, res) {
        const { id } = req.body

        msHarga.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        const{halaman,jumlah,nama_harga,keterangan} = req.body

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if(nama_harga){
                isi+= ` and mh.nama_harga ilike '%${nama_harga}%'`
            }
            if(keterangan){
                isi+= ` and mh.keterangan ilike '%${keterangan}%'`
            }

            let data = await sq.query(`select * from ms_harga mh where mh."deletedAt" isnull${isi} order by mh."createdAt" desc ${pagination}`,s);
            let jml = await sq.query(`select count(*) from ms_harga mh where mh."deletedAt" isnull${isi}`,s)

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static detailsById(req, res) {
        const { id } = req.body

        msHarga.findAll({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses", data });
        }).catch(err => {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }
}
module.exports = Controller;