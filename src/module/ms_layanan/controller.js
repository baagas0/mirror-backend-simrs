const msLayanan = require('./model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT }

class Controller {
    static register(req, res) {
        const { nama_layanan, kode_layanan, status_layanan, keterangan_layanan } = req.body

        msLayanan.findAll({ where: {[Op.or]:[{nama_layanan},{kode_layanan}]} }).then(async hasil1 => {
            if (hasil1.length) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                await msLayanan.create({ id: uuid_v4(), nama_layanan, kode_layanan, status_layanan, keterangan_layanan }).then(hasil2 => {
                    res.status(200).json({ status: 200, message: "sukses", data: hasil2 })
                })
            }
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static update(req, res) {
        const { id, nama_layanan, kode_layanan, status_layanan, keterangan_layanan } = req.body
        
        msLayanan.update({ nama_layanan, kode_layanan, status_layanan, keterangan_layanan }, { where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async list(req, res) {
        const{halaman,jumlah,nama_layanan,kode_layanan,status_layanan,keterangan_layanan} = req.body

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if(nama_layanan){
                isi+= ` and ml.nama_layanan ilike '%${nama_layanan}%'`
            }
            if(kode_layanan){
                isi+= ` and ml.kode_layanan ilike '%${kode_layanan}%'`
            }
            if(status_layanan){
                isi+= ` and ml.status_layanan = '${status_layanan}'`
            }
            if(keterangan_layanan){
                isi+= ` and ml.keterangan_layanan ilike '%${keterangan_layanan}%'`
            }

            let data = await sq.query(`select * from ms_layanan ml where ml."deletedAt" isnull${isi} order by ml."createdAt" desc ${pagination}`,s);
            let jml = await sq.query(`select count(*) from ms_layanan ml where ml."deletedAt" isnull${isi}`,s)

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async detailsById(req, res) {
        const { id } = req.body;
        try {
            let data = await sq.query(`select * from ms_layanan ml where ml."deletedAt" isnull and ml.id = '${id}'`, s)
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static delete(req, res) {
        const { id } = req.body
        msLayanan.destroy({ where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }
}

module.exports = Controller