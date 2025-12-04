const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const penanggung = require('./model')
const s = { type: QueryTypes.SELECT };

class Controller {

    static async register(req, res) {
        const {nama_penanggung, jumlah_penanggung, tagihan_id} = req.body;
        
        try {
            let cekPenaggung = await penanggung.findAll({where:{tagihan_id,nama_penanggung:{[Op.iLike]:nama_penanggung}}})
            if(cekPenaggung.length>0){
                res.status(201).json({ status: 204, message: "data sudah ada" });
            }else{
                let data = await penanggung.create({id:uuid_v4(),nama_penanggung, jumlah_penanggung, tagihan_id})
                
                res.status(200).json({ status: 200, message: "sukses",data:data });
            }
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async update(req, res) {
        const { id, nama_penanggung, jumlah_penanggung, tagihan_id } = req.body;

        try {
            await penanggung.update({nama_penanggung, jumlah_penanggung, tagihan_id},{where:{id}})
            
            res.status(200).json({ status: 200, message: "sukses" });
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async delete(req, res) {
        const { id } = req.body;

        try {
            await penanggung.destroy({where:{id}})

            res.status(200).json({ status: 200, message: "sukses"});
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async list(req, res) {
        try {
            let data = await sq.query(`select p.id as penanggung_id,* 
            from penanggung p 
            join tagihan t on t.id = p.tagihan_id 
            where p."deletedAt" isnull order by p."createdAt" desc`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async listPenanggungByTagihanId(req, res) {
        const {tagihan_id} = req.body;
        
        try {
            let data = await sq.query(`select p.id as penanggung_id,* 
            from penanggung p 
            join tagihan t on t.id = p.tagihan_id 
            where p."deletedAt" isnull and p.tagihan_id = '${tagihan_id}' order by p."createdAt" desc`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async detailsById(req, res) {
        const { id } = req.params

        try {
            let data = await sq.query(`select p.id as penanggung_id,* 
            from penanggung p 
            join tagihan t on t.id = p.tagihan_id 
            where p."deletedAt" isnull and p.id = '${id}'`,s);
            
            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
}

module.exports = Controller