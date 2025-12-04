const jenis_antrian = require('./model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');
const s = { type: QueryTypes.SELECT }


class Controller {

    static register(req, res) {
        const { nama_jenis_antrian, kode_jenis_antrian, status_jenis_antrian } = req.body

        jenis_antrian.create({ id: uuid_v4(), nama_jenis_antrian, kode_jenis_antrian, status_jenis_antrian }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses", data: hasil })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static update(req, res) {
        const { id, nama_jenis_antrian, kode_jenis_antrian, status_jenis_antrian } = req.body

        jenis_antrian.update({ id: uuid_v4(), nama_jenis_antrian, kode_jenis_antrian, status_jenis_antrian }, { where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async list(req, res) {
        const{halaman,jumlah,nama_jenis_antrian,kode_jenis_antrian,status_jenis_antrian} = req.body

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if(nama_jenis_antrian){
                isi+= ` and ja.nama_jenis_antrian ilike '%${nama_jenis_antrian}%'`
            }
            if(kode_jenis_antrian){
                isi+= ` and ja.kode_jenis_antrian ilike '%${kode_jenis_antrian}%'`
            }
            if(status_jenis_antrian){
                isi+= ` and ja.status_jenis_antrian = '${status_jenis_antrian}'`
            }

            let data = await sq.query(`select * from jenis_antrian ja where ja."deletedAt" isnull${isi} order by ja."createdAt" desc ${pagination}`,s);
            let jml = await sq.query(`select count(*) from jenis_antrian ja where ja."deletedAt" isnull${isi}`,s)

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static detailsById(req, res) {
        const { id } = req.body
        jenis_antrian.findAll({ where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses", data: hasil })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static delete(req, res) {
        const { id } = req.body
        jenis_antrian.destroy({ where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

}

module.exports = Controller