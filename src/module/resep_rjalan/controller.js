const resepRjalan = require('./model');
const registrasi = require('../registrasi/model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT }

class Controller {
    
        static register(req, res) {
            resepRjalan.create({ id: uuid_v4(), createdBy:req.dataUsers.id, ...req.body }).then(hasil => {
                res.status(200).json({ status: 200, message: "sukses", data: hasil })
            }).catch(error => {
                console.log(error);
                res.status(500).json({ status: 500, message: "gagal", data: error })
            })
        }
    
        static update(req, res) {
            resepRjalan.update({ ...req.body, updatedBy:req.dataUsers.id}, { where: { id:req.body.id } }).then(hasil => {
                res.status(200).json({ status: 200, message: "sukses" })
            }).catch(error => {
                console.log(error);
                res.status(500).json({ status: 500, message: "gagal", data: error })
            })
        }
    
        static async list(req, res) {
    
            try {
                let data = await sq.query(`select rr.id as id_resep_rjalan, * from resep_rjalan rr
                left join registrasi r on rr.registrasi_id=r.id
                where rr."deletedAt" isnull and r."deletedAt" isnull`, s)
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
                let data = await sq.query(`select rr.id as id_resep_rjalan, * from resep_rjalan rr
                left join registrasi r on rr.registrasi_id=r.id
                where rr."deletedAt" isnull and r."deletedAt" isnull and rr.id = '${id}'`, s)
                res.status(200).json({ status: 200, message: "sukses", data })
            } catch (error) {
                res.status(500).json({ status: 500, message: "gagal", data: error })   
            } 
        }
        static async delete(req, res) {
            const { id } = req.body;
            try {
                await resepRjalan.update({ deletedBy: req.dataUsers.id }, { where: { id } });
                await resepRjalan.destroy({ where: { id } });
                return res.status(200).json({ status: 200, message: "sukses" })
            } catch (error) {
                console.log(error);
                return res.status(500).json({ status: 500, message: "gagal", data: error })
            }
        }
        static async listWithParam(req, res) {
            const {registrasi_id, tahap_resep} = req.body;
            let params = {};
            if(registrasi_id) params.registrasi_id = registrasi_id;
            if(tahap_resep) params.tahap_resep = tahap_resep;
            resepRjalan.findAll({where: params}).then(hasil => {
                res.status(200).json({ status: 200, message: "sukses", data: hasil })
            }
            ).catch(error => {
                console.log(error);
                res.status(500).json({ status: 500, message: "gagal", data: error })   
            })
        }
        static async getWithDetailResep(req, res) {
            const {id} = req.body;
            let params = {};
            if(id) params.id = id;
            try {
                const data = await resepRjalan.findAll({where: params, include: [{model: registrasi, as: 'registrasi'}]});
                for (let i = 0; i < data.length; i++) {
                    const element = data[i];
                    const detail = await sq.query(`select * from resep_detail_rjalan where resep_id='${element.id}'`, s);
                    element.dataValues.detail = detail;
                }
                res.status(200).json({ status: 200, message: "sukses", data })
            } catch (error) {
                console.log(error);
                res.status(500).json({ status: 500, message: "gagal", data: error })
            }
            
        }
}

module.exports = Controller