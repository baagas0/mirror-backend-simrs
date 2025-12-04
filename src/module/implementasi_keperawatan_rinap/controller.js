const implementasiKeperawatanRinap = require('./model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT }


class Controller {

    static register(req, res) {
        implementasiKeperawatanRinap.create({ id: uuid_v4(), createdBy:req.dataUsers.id, ...req.body }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses", data: hasil })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static update(req, res) {
        const { id } = req.body;
        implementasiKeperawatanRinap.update({updatedBy:req.dataUsers.id, ...req.body}, { where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async list(req, res) {
        const { evaluasi_id } = req.body;
            let param='';
            if(evaluasi_id){
                param+=` and iki.evaluasi_id='${evaluasi_id}'`
            }
        try {
            let data = await sq.query(`select iki.id as id_implementasi_keperawatan_rinap, *, msd.kode_diagnosa, msd.nama_diagnosa from implementasi_keperawatan_rinap iki
            left join evaluasi_keperawatan_rinap ek on ek.id=iki.evaluasi_id
            left join ms_diagnosa msd on msd.id = iki.diagnosa
            where ek."deletedAt" isnull and iki."deletedAt" isnull${param}`, s)
            // console.log(data);
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static async detailsById(req, res) {
        const { id } = req.body
        try {
            let data = await sq.query(`select iki.id as id_implementasi_keperawatan_rinap, *, msd.kode_diagnosa, msd.nama_diagnosa from implementasi_keperawatan_rinap iki
            left join evaluasi_keperawatan_rinap ek on ek.id=iki.evaluasi_id
            left join ms_diagnosa msd on msd.id = iki.diagnosa
            where ek."deletedAt" isnull and iki."deletedAt" isnull and iki.id = '${id}'`, s)
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static delete(req, res) {
        const { id } = req.body
        implementasiKeperawatanRinap.destroy({ where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }


}

module.exports = Controller