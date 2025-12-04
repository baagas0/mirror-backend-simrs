const labPaketList = require("./model");
const { sq } = require("../../config/connection");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };
const { v4: uuid_v4 } = require("uuid");
const labPaket = require("../lab_paket/model");
const penunjang = require("../penunjang/model");

class Controller {
    
        static register(req, res) {
            const { queue, keterangan_lab_paket_list, lab_paket_id, penunjang_id, operator, nilai_r_neonatus_min, nilai_r_neonatus_max, nilai_r_bayi_min, nilai_r_bayi_max, nilai_r_anak_min, nilai_r_anak_max, nilai_r_d_perempuan_min, nilai_r_d_perempuan_max, nilai_r_d_laki_min, nilai_r_d_laki_max } = req.body;
            labPaketList.create({ id:uuid_v4(),queue, keterangan_lab_paket_list, lab_paket_id, penunjang_id, operator, nilai_r_neonatus_min, nilai_r_neonatus_max, nilai_r_bayi_min, nilai_r_bayi_max, nilai_r_anak_min, nilai_r_anak_max, nilai_r_d_perempuan_min, nilai_r_d_perempuan_max, nilai_r_d_laki_min, nilai_r_d_laki_max }).then(hasil => {
                res.status(200).json({ status: 200, message: "sukses", data: hasil })
            }).catch(error => {
                console.log(error);
                res.status(500).json({ status: 500, message: "gagal", data: error })
            })
        }
    
        static update(req, res) {
            const { id, queue, keterangan_lab_paket_list, lab_paket_id, penunjang_id, operator, nilai_r_neonatus_min, nilai_r_neonatus_max, nilai_r_bayi_min, nilai_r_bayi_max, nilai_r_anak_min, nilai_r_anak_max, nilai_r_d_perempuan_min, nilai_r_d_perempuan_max, nilai_r_d_laki_min, nilai_r_d_laki_max } = req.body;
            labPaketList.update({ queue, keterangan_lab_paket_list, lab_paket_id, penunjang_id, operator, nilai_r_neonatus_min, nilai_r_neonatus_max, nilai_r_bayi_min, nilai_r_bayi_max, nilai_r_anak_min, nilai_r_anak_max, nilai_r_d_perempuan_min, nilai_r_d_perempuan_max, nilai_r_d_laki_min, nilai_r_d_laki_max }, { where: { id } }).then(hasil => {
                res.status(200).json({ status: 200, message: "sukses" })
            }).catch(error => {
                console.log(error);
                res.status(500).json({ status: 500, message: "gagal", data: error })
            })
        }
        
        static async updateBulk(req, res) {
            const t = await sq.transaction()
            const { data } = req.body;
            console.log(data);
            try {
                await labPaketList.bulkCreate(data,{ updateOnDuplicate: ["queue"] },{transaction:t})
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
                let data = await sq.query(`select lpl.id as id_lab_paket_list, * from lab_paket_list lpl
                left join lab_paket lp on lp.id=lpl.lab_paket_id
                left join penunjang p on p.id=lpl.penunjang_id
                where lpl."deletedAt" isnull and lp."deletedAt" isnull and p."deletedAt" isnull order by lpl."createdAt" desc`, s)
                // console.log(data);
                res.status(200).json({ status: 200, message: "sukses", data })
            }catch (error) {
                console.log(error);
                res.status(500).json({ status: 500, message: "gagal", data: error })
            }
    
        }
    
        static async detailsById(req, res) {
            const { id } = req.body;
            try {
                let data = await sq.query(`select lpl.id as id_lab_paket_list, * from lab_paket_list lpl
                left join lab_paket lp on lp.id=lpl.lab_paket_id
                left join penunjang p on p.id=lpl.penunjang_id
                where lpl."deletedAt" isnull and lp."deletedAt" isnull and p."deletedAt" isnull and lpl.id = '${id}'`, s)
                res.status(200).json({ status: 200, message: "sukses", data })
            } catch (error) {
                res.status(500).json({ status: 500, message: "gagal", data: error })
            }
    
        }
    
        static delete(req, res) {
            const { id } = req.body;
            labPaketList.destroy({ where: { id } }).then(hasil => {
                res.status(200).json({ status: 200, message: "sukses" })
            }).catch(error => {
                console.log(error);
                res.status(500).json({ status: 500, message: "gagal", data: error })
            })
        }

        static async listWithParam(req, res) {
            const {lab_paket_id,penunjang_id} = req.body;
            let params = {};
            if(lab_paket_id) params.lab_paket_id = lab_paket_id;
            if(penunjang_id) params.penunjang_id = penunjang_id;
            console.log(params);
            labPaketList.findAll({where: params, include:[labPaket,penunjang]}).then(hasil => {
                res.status(200).json({ status: 200, message: "sukses", data: hasil })
            }).catch(error => {
                 console.log(error);
                res.status(500).json({ status: 500, message: "gagal", data: error })
            })
        }
}

module.exports = Controller;