const msLoket = require('./model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT }

class Controller {

    static register(req, res) {
        const { nama_loket, status_loket } = req.body

        msLoket.findAll({ where: { nama_loket: { [Op.iLike]: nama_loket } } }).then(cek_data => {
            if (cek_data.length) {
                res.status(201).json({ status: 204, message: "data sudah ada" })
            } else {
                msLoket.create({ id: uuid_v4(), nama_loket, status_loket }).then(hasil => {
                    res.status(200).json({ status: 200, message: "sukses", data: hasil })
                })
            }
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static update(req, res) {
        const { id, nama_loket, status_loket } = req.body

        msLoket.update({ nama_loket, status_loket }, { where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async list(req, res) {
        const{halaman,jumlah,nama_loket,status_loket} = req.body

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if(nama_loket){
                isi+= ` and ml.nama_loket ilike '%${nama_loket}%'`
            }
            if(status_loket){
                isi+= ` and ml.status_loket = '${status_loket}'`
            }

            let data = await sq.query(`select * from ms_loket ml where ml."deletedAt" isnull${isi} order by ml."createdAt" desc ${pagination}`,s);
            let jml = await sq.query(`select count(*) from ms_loket ml where ml."deletedAt" isnull${isi}`,s)

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static detailsById(req, res) {
        const { id } = req.body;
        msLoket.findAll({ where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses", data: hasil })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static delete(req, res) {
        const { id } = req.body
        msLoket.destroy({ where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

}

module.exports = Controller