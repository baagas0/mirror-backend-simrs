const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const msJenisFasilitas = require("./model");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };


class Controller {

    static register(req, res) {
        const { nama_jenis_fasilitas } = req.body

        msJenisFasilitas.findAll({ where: { nama_jenis_fasilitas: { [Op.iLike]: nama_jenis_fasilitas } } }).then(data => {
            if (data.length > 0) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                msJenisFasilitas.create({ id: uuid_v4(), nama_jenis_fasilitas }).then(data => {
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
        const { id, nama_jenis_fasilitas } = req.body

        msJenisFasilitas.update({ nama_jenis_fasilitas }, { where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static delete(req, res) {
        const { id } = req.body

        msJenisFasilitas.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        const{halaman,jumlah,nama_jenis_fasilitas} = req.body

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if(nama_jenis_fasilitas){
                isi+= ` and mjf.nama_jenis_fasilitas ilike '%${nama_jenis_fasilitas}%'`
            }

            let data = await sq.query(`select * from ms_jenis_fasilitas mjf where mjf."deletedAt" isnull${isi} order by mjf."createdAt" desc ${pagination}`,s);
            let jml = await sq.query(`select count(*)  from ms_jenis_fasilitas mjf where mjf."deletedAt" isnull${isi}`,s)

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static detailsById(req, res) {
        const { id } = req.body

        msJenisFasilitas.findAll({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses", data });
        }).catch(err => {
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }
}
module.exports = Controller;