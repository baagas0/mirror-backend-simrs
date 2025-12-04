const msKualifikasi = require('./model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT }

class Controller {

    static register(req, res) {
        const { nama_kualifikasi } = req.body
        msKualifikasi.findAll({ where: { nama_kualifikasi: { [Op.iLike]: nama_kualifikasi } } }).then(hasil1 => {
            if (hasil1.length) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                msKualifikasi.create({ id: uuid_v4(), nama_kualifikasi }).then(hasil2 => {
                    res.status(200).json({ status: 200, message: "sukses", data: hasil2 })
                })
            }
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static update(req, res) {
        const { id, nama_kualifikasi } = req.body
        msKualifikasi.update({ nama_kualifikasi }, {
            where: {
                id
            }
        })
            .then(hasil => {
                res.status(200).json({ status: 200, message: "sukses" })
            })
            .catch(error => {
                console.log(error);
                res.status(500).json({ status: 500, message: "gagal", data: error })
            })
    }

    static async list(req, res) {
        const{halaman,jumlah,nama_kualifikasi} = req.body

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if(nama_kualifikasi){
                isi+=`  and mk.nama_kualifikasi ilike '%${nama_kualifikasi}%'`
            }

            let data = await sq.query(`select * from ms_kualifikasi mk where mk."deletedAt" isnull${isi} order by mk."createdAt" desc ${pagination}`,s);
            let jml = await sq.query(`select count(*) from ms_kualifikasi mk where mk."deletedAt" isnull${isi}`,s)

           res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static async detailsById(req, res) {
        const { id } = req.body;
        try {
            let data = await sq.query(`select * from ms_kualifikasi mk where mk."deletedAt" isnull and mk.id = '${id}'`, s)
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static delete(req, res) {
        const { id } = req.body
        
        msKualifikasi.destroy({where: {id}}).then(hasil => {
                res.status(200).json({ status: 200, message: "sukses" })
            })
            .catch(error => {
                console.log(error);
                res.status(500).json({ status: 500, message: "gagal", data: error })
            })

    }

}

module.exports = Controller