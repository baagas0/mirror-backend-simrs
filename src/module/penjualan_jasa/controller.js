const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const penjualanJasa = require('./model')
const penjualan = require('../penjualan/model')
const s = { type: QueryTypes.SELECT };

class Controller {

    static async register(req, res) {
        const {qty_jasa, harga_jasa, harga_jasa_custom, keterangan_penjualan_jasa, status_penjualan_jasa, penjualan_id, ms_jasa_id, harga_total_jasa,discount,tax,total_penjualan} = req.body;
        
        try {
            let cekPenjualan = await penjualan.findAll({where:{id:penjualan_id}})
            if(cekPenjualan.length==0){
                res.status(201).json({ status: 204, message: "penjualan_id tidak ada" })
            }else{
                if(cekPenjualan[0].status_penjualan != 1){
                    res.status(201).json({ status: 204, message: "status penjualan bukan 1" })
                }else{
                    let cekPenjualanJasa = await penjualanJasa.findAll({where:{penjualan_id, ms_jasa_id}})
                    if(cekPenjualanJasa.length>0){
                        res.status(201).json({ status: 204, message: "data sudah ada" })
                    }else{
                        let hasil = await sq.transaction(async t =>{
                            let data = await penjualanJasa.create({id:uuid_v4(),qty_jasa, harga_jasa, harga_jasa_custom, keterangan_penjualan_jasa, status_penjualan_jasa, penjualan_id, ms_jasa_id},{transaction:t});     
                            await penjualan.update({harga_total_jasa,discount,tax,total_penjualan},{where:{id:penjualan_id},transaction:t})
                            return data
                        })
                        
                        res.status(200).json({ status: 200, message: "sukses", data:hasil })
                    }
                }
            }
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async update(req, res) {
        const { id, qty_jasa, harga_jasa, harga_jasa_custom, keterangan_penjualan_jasa, status_penjualan_jasa, penjualan_id, ms_jasa_id, harga_total_jasa,discount, tax, total_penjualan } = req.body;

        try {
            let cekPenjualanJasa = await penjualanJasa.findAll({where:{id}})
            if(cekPenjualanJasa[0].status_penjualan_jasa != 1){
                res.status(201).json({ status: 204, message: "status penjualan jasa bukan 1" });
            }else{
                await sq.transaction(async t =>{
                    await penjualanJasa.update({ qty_jasa, harga_jasa, harga_jasa_custom, keterangan_penjualan_jasa, status_penjualan_jasa, penjualan_id, ms_jasa_id }, { where: { id },transaction:t })
                    await penjualan.update({harga_total_jasa,discount, tax, total_penjualan},{where:{id:penjualan_id},transaction:t})
                })
                res.status(200).json({ status: 200, message: "sukses" });
            }
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async delete(req, res) {
        const { id, harga_total_jasa,discount, tax, total_penjualan, penjualan_id } = req.body;

        try {
            let cekPenjualanJasa= await penjualanJasa.findAll({where:{id}})
            if(cekPenjualanJasa[0].status_penjualan_jasa != 1){
                res.status(201).json({ status: 204, message: "status penjualan jasa bukan 1" });
            }else{
                await sq.transaction(async t=>{
                    await penjualan.update({harga_total_jasa,discount, tax, total_penjualan},{ where: {id:penjualan_id},transaction:t })
                    await penjualanJasa.destroy({ where: {id},transaction:t })
                })
                res.status(200).json({ status: 200, message: "sukses" });
            }
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async list(req, res) {
        try {
            let data = await sq.query(`select pj.id as penjualan_jasa_id,pj.*,mj.nama_jasa ,p.tgl_penjualan,p.is_external  
            from penjualan_jasa pj 
            join ms_jasa mj on mj.id = pj.ms_jasa_id
            join penjualan p on p.id = pj.penjualan_id
            where pj."deletedAt" isnull order by pj."createdAt" desc`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async listPenjualanJasaByPenjualanId(req, res) {
        const {penjualan_id} = req.body;
        try {
            let data = await sq.query(`select pj.id as penjualan_jasa_id,pj.*,mj.nama_jasa ,p.tgl_penjualan,p.is_external  
            from penjualan_jasa pj 
            join ms_jasa mj on mj.id = pj.ms_jasa_id
            join penjualan p on p.id = pj.penjualan_id
            where pj."deletedAt" isnull and pj.penjualan_id = '${penjualan_id}' order by pj."createdAt" desc`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
    
    static async listPenjualanJasaByMsJasaId(req, res) {
        const {ms_jasa_id} = req.body;
        try {
            let data = await sq.query(`select pj.id as penjualan_jasa_id,pj.*,mj.nama_jasa ,p.tgl_penjualan,p.is_external  
            from penjualan_jasa pj 
            join ms_jasa mj on mj.id = pj.ms_jasa_id
            join penjualan p on p.id = pj.penjualan_id
            where pj."deletedAt" isnull and pj.ms_jasa_id = '${ms_jasa_id}' order by pj."createdAt" desc`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async detailsById(req, res) {
        const { id } = req.params

        try {
            let data = await sq.query(`select p.id as pembelian_id,* 
            from pembelian p
            join ms_supplier ms on ms.id = p.ms_suplier_id 
            join ms_gudang mg on mg.id = p.ms_gudang_id 
            join users u on u.id = p.user_id 
            where p."deletedAt" isnull and p.id = '${id}'`,s);
            
            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
}

module.exports = Controller