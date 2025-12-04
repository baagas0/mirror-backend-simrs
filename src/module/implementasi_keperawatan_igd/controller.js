const implementasiKeperawatanIgd = require('./model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT }


class Controller {

    static register(req, res) {
        const {implementasi_keperawatan_igd,evaluasi_id} = req.body;
        implementasiKeperawatanIgd.create({ id: uuid_v4(), implementasi_keperawatan_igd,evaluasi_id,createdBy:req.dataUsers.id }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses", data: hasil })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static update(req, res) {
        const { id,implementasi_keperawatan_igd,evaluasi_id } = req.body
        implementasiKeperawatanIgd.update({ implementasi_keperawatan_igd,evaluasi_id,updatedBy:req.dataUsers.id}, { where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async list(req, res) {

        try {
            let data = await sq.query(`select iki.id as id_implementasi_keperawatan_igd, * from implementasi_keperawatan_igd iki
            left join evaluasi_keperawatan ek on ek.id=iki.evaluasi_id
            left join ms_dokter md on md.id=ek.perawat_id
            where ek."deletedAt" isnull and iki."deletedAt" isnull`, s)
            // console.log(data);
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static async detailsById(req, res) {
        const { id } = req.body;
        try {
            let data = await sq.query(`select iki.id as id_implementasi_keperawatan_igd, * from implementasi_keperawatan_igd iki
            left join evaluasi_keperawatan ek on ek.id=iki.evaluasi_id
            left join ms_dokter md on md.id=ek.perawat_id
            where ek."deletedAt" isnull and iki."deletedAt" isnull and iki.id = '${id}'`, s)
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static delete(req, res) {
        const { id } = req.body
        implementasiKeperawatanIgd.destroy({ where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }


}

module.exports = Controller