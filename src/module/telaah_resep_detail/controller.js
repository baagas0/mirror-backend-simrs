const resepDetailRnap = require('../resep_detail_rnap/model');
const waktu = require('../waktu/model');
const telaahResepDetail = require('./model');
const { v4: uuidv4 } = require('uuid');
const { QueryTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const s = { type: QueryTypes.SELECT }

class Controller {
    
        static async register(req, res) {
            const t = await sq.transaction();
            const { data } = req.body;
            let dataBulk = []
            let totalQty = 0;
            await data.forEach(element => {
                totalQty += element.qty
                dataBulk.push({
                    id: uuidv4(),
                    ...element
                })
            });
            const retrieveResepDetailRnap = await resepDetailRnap.findOne({ where: { id: dataBulk[0].resep_detail_rnap_id } })
            if (totalQty != retrieveResepDetailRnap.final_qty) {
                await t.rollback();
                return res.status(500).json({ status: 500, message: "gagal, qty tidak sama" })
            }
            telaahResepDetail.bulkCreate(dataBulk,{transaction:t}).then(hasil => {
                t.commit();
                res.status(200).json({ status: 200, message: "sukses", data: hasil })
            }).catch(error => {
                console.log(error);
                t.rollback();
                res.status(500).json({ status: 500, message: "gagal", data: error })
            })
        }
    
        static async update(req, res) {
            const t = await sq.transaction()
            const { data } = req.body;
            console.log(data);
            try {
                let totalQty = 0;
                let dataBulk = []
                await data.forEach(element => {
                    totalQty += element.qty
                    dataBulk.push({
                        id: uuidv4(),
                        ...element
                    })
                });
                const retrieveResepDetailRnap = await resepDetailRnap.findOne({ where: { id: dataBulk[0].resep_detail_rnap_id } })
                console.log(retrieveResepDetailRnap);
                if (totalQty != retrieveResepDetailRnap.qty) {
                    await t.rollback();
                    return res.status(500).json({ status: 500, message: "gagal, qty tidak sama" })
                }
                await telaahResepDetail.bulkCreate(data,{ updateOnDuplicate: ["qty","persiapan","tanggal_persiapan","keterangan","waktu_id","resep_detail_rnap_id"] },{transaction:t})
                await t.commit()
                res.status(200).json({ status: 200, message: "sukses" })
            } catch (error) {
                await t.rollback()
                console.log(error);
                res.status(500).json({ status: 500, message: "gagal", data: error })
            }
        }
    
        static async list(req, res) {
                try {
                 let data = await sq.query(`select *, trd.id as id_telaah_resep_detail from telaah_resep_detail trd
                 left join waktu w on trd.waktu_id=w.id
                 left join resep_detail_rnap r on trd.resep_detail_rnap_id=r.id
                 where trd."deletedAt" isnull and r."deletedAt" isnull`, s)
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
                let data = await sq.query(`select *, trd.id as id_telaah_resep_detail from telaah_resep_detail trd
                left join waktu w on trd.waktu_id=w.id
                left join resep_detail_rnap r on trd.resep_detail_rnap_id=r.id
                where trd."deletedAt" isnull and r."deletedAt" isnull and trd.id = '${id}'`, s)
                res.status(200).json({ status: 200, message: "sukses", data })
            } catch (error) {
                res.status(500).json({ status: 500, message: "gagal", data: error })   
            } 
        }

        static delete(req, res) {
            const { id } = req.body
            telaahResepDetail.destroy({ where: { id } }).then(hasil => {
                res.status(200).json({ status: 200, message: "sukses" })
            }).catch(error => {
                console.log(error);
                res.status(500).json({ status: 500, message: "gagal", data: error })
            })
        }

        static async listWithParam(req, res) {
            const {resep_detail_rnap_id} = req.body;
            let params = {};
            if(resep_detail_rnap_id) params.resep_detail_rnap_id = resep_detail_rnap_id;
            telaahResepDetail.findAll({where: params,include:[waktu]}).then(hasil => {
                res.status(200).json({ status: 200, message: "sukses", data: hasil })
            }
            ).catch(error => {
                console.log(error);
                res.status(500).json({ status: 500, message: "gagal", data: error })   
            })
        }

}

module.exports = Controller