const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const penjualanFasilitas = require('./model')
const penjualan = require('../penjualan/model')
const s = { type: QueryTypes.SELECT };

class Controller {

    static async register(req, res) {
        const {qty_fasilitas, harga_fasilitas, harga_fasilitas_custom, keterangan_penjualan_fasilitas, status_penjualan_fasilitas, penjualan_id, ms_fasilitas_id,harga_total_fasilitas,discount,tax,total_penjualan} = req.body;
        
        try {
            let cekPenjualan = await penjualan.findAll({where:{id:penjualan_id}})
            if(cekPenjualan.length==0){
                res.status(201).json({ status: 204, message: "penjualan_id tidak ada" })
            }else{
                if(cekPenjualan[0].status_penjualan != 1){
                    res.status(201).json({ status: 204, message: "status penjualan bukan 1" })
                }else{
                    let cekPenjualanJasa = await penjualanFasilitas.findAll({where:{penjualan_id, ms_fasilitas_id}})
                    if(cekPenjualanJasa.length>0){
                        res.status(201).json({ status: 204, message: "data sudah ada" })
                    }else{
                        let hasil = await sq.transaction(async t=>{
                            let data = await penjualanFasilitas.create({id:uuid_v4(),qty_fasilitas, harga_fasilitas, harga_fasilitas_custom, keterangan_penjualan_fasilitas, status_penjualan_fasilitas, penjualan_id, ms_fasilitas_id});   
                            await penjualan.update({harga_total_fasilitas,discount,tax,total_penjualan},{where:{id:penjualan_id},transaction:t})
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
        const { id, qty_fasilitas, harga_fasilitas, harga_fasilitas_custom, keterangan_penjualan_fasilitas, status_penjualan_fasilitas, penjualan_id, ms_fasilitas_id, harga_total_fasilitas, discount, tax, total_penjualan } = req.body;

        try {
            let cekPenjualanFasilitas = await penjualanFasilitas.findAll({where:{id}})
            if(cekPenjualanFasilitas[0].status_penjualan_fasilitas != 1){
                res.status(201).json({ status: 204, message: "status penjualan fasilitas bukan 1" });
            }else{
                await sq.transaction(async t =>{
                    await penjualanFasilitas.update({ qty_fasilitas, harga_fasilitas, harga_fasilitas_custom, keterangan_penjualan_fasilitas, status_penjualan_fasilitas,penjualan_id,ms_fasilitas_id }, { where: { id },transaction:t })
                    await penjualan.update({ harga_total_fasilitas, discount, tax, total_penjualan},{where:{id:penjualan_id},transaction:t})
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
        const { id,harga_total_fasilitas, discount, tax, total_penjualan, penjualan_id } = req.body;

        try {
            let cekPenjualanFasilitas = await penjualanFasilitas.findAll({where:{id}})
            if(cekPenjualanFasilitas[0].status_penjualan_fasilitas != 1){
                res.status(201).json({ status: 204, message: "status penjualan fasilitas bukan 1" });
            }else{
                await sq.transaction(async t=>{
                    await penjualan.update({harga_total_fasilitas, discount, tax, total_penjualan},{ where: {id:penjualan_id},transaction:t })
                    await penjualanFasilitas.destroy({ where: { id },transaction:t })
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
            let data = await sq.query(`select pf.id as penjualan_fasilitas_id, pf.*,mf.nama_fasilitas,p.tgl_penjualan,p.is_external
            from penjualan_fasilitas pf 
            join ms_fasilitas mf on mf.id = pf.ms_fasilitas_id 
            join penjualan p on p.id = pf.penjualan_id
            where pf."deletedAt" isnull order by pf."createdAt" desc`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async listPenjualanFasilitasByPenjualanId(req, res) {
        const {penjualan_id}= req.body;
        try {
            let data = await sq.query(`select pf.id as penjualan_fasilitas_id, pf.*,mf.nama_fasilitas,p.tgl_penjualan,p.is_external
            from penjualan_fasilitas pf 
            join ms_fasilitas mf on mf.id = pf.ms_fasilitas_id 
            join penjualan p on p.id = pf.penjualan_id
            where pf."deletedAt" isnull and pf.penjualan_id = '${penjualan_id}' order by pf."createdAt" desc`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async listPenjualanFasilitasByMsFasilitasId(req, res) {
        const {ms_fasilitas_id}= req.body;
        try {
            let data = await sq.query(`select pf.id as penjualan_fasilitas_id, pf.*,mf.nama_fasilitas,p.tgl_penjualan,p.is_external
            from penjualan_fasilitas pf 
            join ms_fasilitas mf on mf.id = pf.ms_fasilitas_id 
            join penjualan p on p.id = pf.penjualan_id
            where pf."deletedAt" isnulland pf.ms_fasilitas_id = '${ms_fasilitas_id}' order by pf."createdAt" desc`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async detailsById(req, res) {
        const { id } = req.params

        try {
            let data = await sq.query(`select pf.id as penjualan_fasilitas_id, pf.*,mf.nama_fasilitas,p.tgl_penjualan,p.is_external
            from penjualan_fasilitas pf 
            join ms_fasilitas mf on mf.id = pf.ms_fasilitas_id 
            join penjualan p on p.id = pf.penjualan_id
            where pf."deletedAt" isnull and p.id = '${id}'`,s);
            
            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
}

module.exports = Controller