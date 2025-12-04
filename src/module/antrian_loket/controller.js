const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');
const s = { type: QueryTypes.SELECT }
const moment = require('moment');
const antrian_loket = require('./model');

class Controller {

    static async register(req, res) {
        const { tgl_antrian_loket, initial_loket } = req.body

        try {
            let tgl = moment(tgl_antrian_loket).format('YYYY-MM-DD')
            let urutan = await sq.query(`select al.antrian_no_loket from antrian_loket al where al."deletedAt" isnull and date(al.tgl_antrian_loket)= '${tgl}' and al.initial_loket = '${initial_loket}' order by al."createdAt" desc limit 1`,s);
            let sisa = await sq.query(`select count(*)as total from antrian_loket al where al."deletedAt" isnull and date(al.tgl_antrian_loket)= '${tgl}' and al.initial_loket = '${initial_loket}' and al.status_antrian_loket = 1`, s);

            let antrian_no_loket = urutan.length == 0 ? 1 : +urutan[0].antrian_no_loket + 1
            let hasil = await antrian_loket.create({ id: uuid_v4(), tgl_antrian_loket, initial_loket, antrian_no_loket })
            hasil.dataValues.sisa_antrian = +sisa[0].total

            res.status(200).json({ status: 200, message: "sukses", data: hasil })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async update(req, res) {
        const { id, tgl_antrian_loket, initial_loket, antrian_no_loket, status_antrian_loket, ms_loket_id } = req.body
        try {
            let hasil = await antrian_loket.update({ tgl_antrian_loket, initial_loket, antrian_no_loket, status_antrian_loket, ms_loket_id }, { where: { id }, returning: true })

            res.status(200).json({ status: 200, message: "sukses", data: hasil[1] })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static delete(req, res) {
        const { id } = req.body

        antrian_loket.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async list(req, res) {
        const { halaman, jumlah, tgl_antrian_loket, initial_loket, antrian_no_loket, status_antrian_loket, ms_loket_id } = req.body;

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if (tgl_antrian_loket) {
                isi += ` and date(al.tgl_antrian_loket)='${tgl_antrian_loket}'`
            }
            if (initial_loket) {
                isi += ` and al.initial_loket = '${initial_loket}'`
            }
            if (antrian_no_loket) {
                isi += ` and al.antrian_no_loket = '${antrian_no_loket}'`
            }
            if (status_antrian_loket) {
                isi += ` and al.status_antrian_loket = ${status_antrian_loket}`
            }
            if (ms_loket_id) {
                isi += ` and al.ms_loket_id = '${ms_loket_id}'`
            }

            let data = await sq.query(`select * from antrian_loket al where al."deletedAt" isnull${isi} order by al."createdAt" ${pagination}`, s)

            let jml = await sq.query(`select count(*) from antrian_loket al where al."deletedAt" isnull${isi}`,s)

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async detailsById(req, res) {
        const { id } = req.body;

        try {
            let data = await sq.query(`select * from antrian_loket al where al."deletedAt" isnull and al.id = '${id}'`, s);

            res.status(200).json({ status: 200, message: "sukses",data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }
}

module.exports = Controller