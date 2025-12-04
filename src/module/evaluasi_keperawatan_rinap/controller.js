const evaluasiKeperawatanRinap = require('./model');
const implementasiKeperawatanRinap = require('../implementasi_keperawatan_rinap/model');
const registrasi = require('../registrasi/model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT }


class Controller {

    static register(req, res) {
        evaluasiKeperawatanRinap.create({ id: uuid_v4(), ...req.body,createdBy:req.dataUsers.id }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses", data: hasil })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static update(req, res) {
        const { id } = req.body
        evaluasiKeperawatanRinap.update({ ...req.body, updatedBy:req.dataUsers.id}, { where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async list(req, res) {
        const { registrasi_id } = req.body;
        let param='';
        if(registrasi_id){
            param+=` and ek.registrasi_id='${registrasi_id}'`
        }
        try {
            let data = await sq.query(`select ek.id as id_evaluasi_keperawatan_rinap, * from evaluasi_keperawatan_rinap ek
            left join registrasi r on ek.registrasi_id=r.id
            left join ms_dokter md on md.id=ek.perawat_id
            where ek."deletedAt" isnull${param}`, s)
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
            let data = await sq.query(`select ek.id as id_evaluasi_keperawatan_rinap, * from evaluasi_keperawatan_rinap ek
            left join registrasi r on ek.registrasi_id=r.id
            where ek."deletedAt" isnull and ek.id = '${id}'`, s)
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static delete(req, res) {
        const { id } = req.body
        evaluasiKeperawatanRinap.destroy({ where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static listWithParam(req, res) { 
        const {status_evaluasi_keperawatan} = req.body
        evaluasiKeperawatanRinap.findAll({ where: { status_evaluasi_keperawatan } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses", data })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async getWithImplementasi(req, res){
        const {id, status_evaluasi_keperawatan,registrasi_id} = req.body;
        let param = {
            id
        };
        if(status_evaluasi_keperawatan!=undefined){
            param.status_evaluasi_keperawatan = status_evaluasi_keperawatan;
        }
        if(registrasi_id){
            param.registrasi_id = registrasi_id;
        }
        try {
            if(id){
                let data = await evaluasiKeperawatanRinap.findOne({where:param,include:[registrasi]});
                if(data){
                    const dataImpelementasi = await implementasiKeperawatanRinap.findAll({where:{evaluasi_id:data.dataValues.id}});
                    data.dataValues.implementasi = dataImpelementasi;
                }
                return res.status(200).json({ status: 200, message: "sukses", data })
            }
            delete param.id;
            let data = await evaluasiKeperawatanRinap.findAll({where:param,include:[registrasi]});
            await Promise.all(data.map(async (item,index) => {
                const dataImpelementasi = await implementasiKeperawatanRinap.findAll({where:{evaluasi_id:item.id}});
                data[index].dataValues.implementasi = dataImpelementasi;
            }))
            return res.status(200).json({ status: 200, message: "sukses", data })
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

}

module.exports = Controller