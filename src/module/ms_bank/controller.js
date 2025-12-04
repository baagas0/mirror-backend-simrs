const msBank = require('./model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT }


class Controller {

    static register(req, res) {
        const { nama_bank } = req.body
        msBank.findAll({ where: { nama_bank: { [Op.iLike]: nama_bank } }}).then(async hasil1 => {
            if (hasil1.length) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            }
            else {
                await msBank.create({ id: uuid_v4(), nama_bank }).then(hasil2 => {
                    res.status(200).json({ status: 200, message: "sukses", data: hasil2 })
                })
            }
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static update(req, res) {
        const { id, nama_bank } = req.body
        msBank.update({ nama_bank }, { where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async list(req, res) {
        const {halaman,jumlah,nama_bank} = req.body
        try {
            let isi = ''
            let offset=''
            let pagination=''
            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if(nama_bank){
                isi+= ` and mb.nama_bank ilike '%${nama_bank}%'`
            }
            let data = await sq.query(`select * from ms_bank mb where mb."deletedAt" isnull${isi} order by mb."createdAt" desc ${pagination}`, s)
            let jml = await sq.query(`select count(*) from ms_bank mb where mb."deletedAt" isnull${isi}`,s)

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static async detailsById(req, res) {
        const { id } = req.body
        try {
            let data = await sq.query(`select * from ms_bank mb where mb."deletedAt" isnull and mb.id = '${id}'`, s)
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static delete(req, res) {
        const { id } = req.body
        msBank.destroy({ where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

}

module.exports = Controller