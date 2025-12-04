const msSpecialist = require('./model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT }


class Controller {

    static register(req, res) {
        const { nama_specialist, kode_specialist } = req.body

        msSpecialist.findAll({ where: { [Op.or]: [{ nama_specialist }, { kode_specialist }] } }).then(async hasil1 => {
            if (hasil1.length) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                await msSpecialist.create({ id: uuid_v4(), nama_specialist, kode_specialist }).then(hasil2 => {
                    res.status(200).json({ status: 200, message: "sukses", data: hasil2 })
                })
            }
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static update(req, res) {
        const { id, nama_specialist, kode_specialist } = req.body
        msSpecialist.update({ nama_specialist, kode_specialist }, {
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
        const{halaman,jumlah,nama_specialist,kode_specialist} = req.body

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if(nama_specialist){
                isi+= ` and ms.nama_specialist ilike '%${nama_specialist}%'`
            }
            if(kode_specialist){
                isi+= ` and ms.kode_specialist ilike '%${kode_specialist}%'`
            }

            let data = await sq.query(`select * from ms_specialist ms where ms."deletedAt" isnull${isi} order by ms.nama_specialist ${pagination}`,s);
            let jml = await sq.query(`select count(*) from ms_specialist ms where ms."deletedAt" isnull${isi}`,s)

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
            let data = await sq.query(`select * from ms_specialist ms where ms."deletedAt" isnull and ms.id = '${id}'`, s)
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static delete(req, res) {
        const { id } = req.body
        msSpecialist.destroy({
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

}

module.exports = Controller