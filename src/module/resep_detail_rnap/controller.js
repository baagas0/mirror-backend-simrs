const resepDetailRnap = require('./model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const resepRacikRnap = require('../resep_racik_rnap/model');
const s = { type: QueryTypes.SELECT }

class Controller {
    
        static register(req, res) {
            resepDetailRnap.create({ id: uuid_v4(), ...req.body }).then(hasil => {
                res.status(200).json({ status: 200, message: "sukses", data: hasil })
            }).catch(error => {
                console.log(error);
                res.status(500).json({ status: 500, message: "gagal", data: error })
            })
        }
    
        static update(req, res) {
            resepDetailRnap.update({ ...req.body}, { where: { id:req.body.id } }).then(hasil => {
                res.status(200).json({ status: 200, message: "sukses" })
            }).catch(error => {
                console.log(error);
                res.status(500).json({ status: 500, message: "gagal", data: error })
            })
        }
    
        static async list(req, res) {
        
            const { resep_rnap_id, is_racik } = req.body;
            let param='';
            if(resep_rnap_id){
                param+=` and rd.resep_id='${resep_rnap_id}'`
            }
            try {
                let data = []
                if(is_racik==1){
                    data = await resepRacikRnap.findAll({where:{resep_rnap_id},include:[{model:resepDetailRnap}]})
                }else{
                    data = await sq.query(`select rd.id as id_resep_detail_rnap, * from resep_detail_rnap rd
                    where rd."deletedAt" isnull${param} and resep_racik_rnap_id isnull`, s)
                }
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
                let data = await sq.query(`select rd.id as id_resep_detail_rnap, * from resep_detail_rnap rd
                where rd."deletedAt" isnull and rd.id = '${id}'`, s)
                res.status(200).json({ status: 200, message: "sukses", data })
            } catch (error) {
                res.status(500).json({ status: 500, message: "gagal", data: error })   
            } 
        }
        static delete(req, res) {
            const { id } = req.body
            resepDetailRnap.destroy({ where: { id } }).then(hasil => {
                res.status(200).json({ status: 200, message: "sukses" })
            }).catch(error => {
                console.log(error);
                res.status(500).json({ status: 500, message: "gagal", data: error })
            })
        }
}

module.exports = Controller