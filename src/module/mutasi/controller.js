const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const mutasi = require("./model");
const subReqMutasi = require("../sub_req_mutasi/model");
const subMutasi = require("../sub_mutasi/model");
const stock = require("../stock/model");
const msBarang = require("../ms_barang/model");
const historyInventory = require("../history_inventory/model");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };

class Controller {

    static async createReqMutasi(req, res) {
        let { ms_gudang_sumber_id, ms_gudang_tujuan_id,sub_req_mutasi} = req.body
        const t = await sq.transaction()
        try {
            const id = uuid_v4();
            let data = await mutasi.create({ id, ms_gudang_sumber_id, ms_gudang_tujuan_id,is_mutasi:0 },{ transaction: t });
            const items=[];
            for(let item of sub_req_mutasi){
                items.push({id:uuid_v4(), mutasi_id:id, ms_barang_id:item.ms_barang_id, qty_req:item.qty_req})
            }
            const tes= await subReqMutasi.bulkCreate(items,{transaction:t})
            await t.commit()
            data.dataValues.subReqMutasi=tes;
            return res.status(200).json({ status: 200, message: "sukses", data })
        } catch (err) {
            await t.rollback()
            return res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async updateReqMutasi(req, res) {
        let { id,ms_gudang_sumber_id, ms_gudang_tujuan_id,sub_req_mutasi} = req.body
        const t = await sq.transaction()
        try {
            const update = await mutasi.update({ms_gudang_sumber_id, ms_gudang_tujuan_id},{where:{id}}, { transaction: t });
            await subReqMutasi.destroy({ where: { mutasi_id:id },force:true }, { transaction: t })
            let items=[]
            for(let item of sub_req_mutasi){
                items.push({id:uuid_v4(), mutasi_id:id, ms_barang_id:item.ms_barang_id, qty_req:item.qty_req})
                };
            const jmbt= await subReqMutasi.bulkCreate(items,{transaction:t})
            await t.commit()
            return res.status(200).json({ status: 200, message: "sukses" })
        } catch (err) {
            await t.rollback()
            return res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async createMutasi(req, res) {
        let { ms_gudang_sumber_id, ms_gudang_tujuan_id,sub_mutasi} = req.body
        const t = await sq.transaction()
        try {
            const id = uuid_v4();
            let data = await mutasi.create({ id, ms_gudang_sumber_id, ms_gudang_tujuan_id,is_mutasi:1,status_mutasi:1 },{ transaction: t });
            const items=[];
            for(let item of sub_mutasi){
                items.push({id:uuid_v4(), mutasi_id:id, stock_id:item.stock_id, qty_sub:item.qty_sub})
            }
            const tes= await subMutasi.bulkCreate(items,{transaction:t})
            await t.commit()
            data.dataValues.subMutasi=tes;
            return res.status(200).json({ status: 200, message: "sukses", data })
        } catch (err) {
            await t.rollback()
            return res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async updateMutasi(req, res) {
        let { id, ms_gudang_sumber_id, ms_gudang_tujuan_id,sub_mutasi} = req.body
        const t = await sq.transaction()
        try {
            const update = await mutasi.update({ms_gudang_sumber_id, ms_gudang_tujuan_id},{where:{id}}, { transaction: t });
            await subMutasi.destroy({ where: { mutasi_id:id },force:true }, { transaction: t })
            const items=[];
            for(let item of sub_mutasi){
                items.push({id:uuid_v4(), mutasi_id:id, stock_id:item.stock_id, qty_sub:item.qty_sub})
            }
            const tes= await subMutasi.bulkCreate(items,{transaction:t})
            await t.commit()
            
            return res.status(200).json({ status: 200, message: "sukses" })
        } catch (err) {
            await t.rollback()
            return res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
    static async proses(req, res) {
        const {id, tanggal_mutasi} = req.body;
        const t = await sq.transaction()
        try {
            const dataMutasi= await mutasi.findOne({where:{id}})
            if(dataMutasi.dataValues.status_mutasi==2){
                return res.status(201).json({ status: 204, message: 'mutasi sudah pernah diproses' });
            }
            const dataSubMutasi= await subMutasi.findAll({where:{mutasi_id:id}})
            for(let item of dataSubMutasi){
                const checkStock = await stock.findOne({where:{id:item.stock_id},include:[msBarang],raw: true})
                const checkStockPerBatchGudangSumber = await stock.sum('qty',{where:{ms_gudang_id:checkStock.ms_gudang_id,ms_barang_id:checkStock.ms_barang_id,kode_batch:checkStock.kode_batch}});
                const sumStockAllGudangSumber = await stock.sum('qty',{where:{ms_gudang_id:checkStock.ms_gudang_id,ms_barang_id:checkStock.ms_barang_id}});
                const checkStockPerBatchGudangTujuan = await stock.sum('qty',{where:{ms_gudang_id:dataMutasi.dataValues.ms_gudang_tujuan_id,ms_barang_id:checkStock.ms_barang_id,kode_batch:checkStock.kode_batch}});
                const sumStockAllGudangTujuan = await stock.sum('qty',{where:{ms_gudang_id:dataMutasi.dataValues.ms_gudang_tujuan_id,ms_barang_id:checkStock.ms_barang_id}});
                
                if(checkStock.qty<item.qty_sub){
                    await t.rollback()
                    return res.status(201).json({ status: 204, message: `${checkStock['ms_barang.nama_barang']} kode batch ${checkStock.kode_batch} stock kurang ${item.qty_sub-checkStock.qty}` });
                }
                let newStock =  checkStock.qty-item.qty_sub;
                const adjustmentStock = await stock.update({qty:newStock},{where:{id:item.stock_id}}, { transaction: t })
                let historyInventoryItems = [{
                    id:uuid_v4(),
                    tipe_transaksi:'mutasi keluar',
                    transaksi_id:id,
                    ms_gudang_id:checkStock.ms_gudang_id,
                    stock_id:item.stock_id,
                    debit_kredit:'k',
                    stok_awal_per_gudang:sumStockAllGudangSumber,
                    stok_akhir_per_gudang:(sumStockAllGudangSumber-item.qty_sub),
                    stok_awal_per_batch:checkStockPerBatchGudangSumber,
                    stok_akhir_per_batch:(checkStockPerBatchGudangSumber-item.qty_sub),
                    qty:item.qty_sub,
                    harga_pokok_awal:checkStock['ms_barang.harga_pokok'],
                    harga_pokok_akhir:checkStock['ms_barang.harga_pokok'],
                    tgl_transaksi:tanggal_mutasi,
                    gudang_tambahan_id:dataMutasi.dataValues.ms_gudang_tujuan_id,
                    ms_barang_id:checkStock.ms_barang_id
                }]
                const newStockId = uuid_v4();
                const createStock = await stock.create({id:newStockId, ms_barang_id:checkStock.ms_barang_id, ms_gudang_id:dataMutasi.dataValues.ms_gudang_tujuan_id, kode_batch:checkStock.kode_batch, qty:item.qty_sub, mutasi_id:id, tgl_masuk:tanggal_mutasi, tgl_kadaluarsa:checkStock.tgl_kadaluarsa}, { transaction: t })
                historyInventoryItems.push({
                    id:uuid_v4(),
                    tipe_transaksi:'mutasi masuk',
                    transaksi_id:id,
                    ms_gudang_id:dataMutasi.dataValues.ms_gudang_tujuan_id,
                    stock_id:newStockId,
                    debit_kredit:'d',
                    stok_awal_per_gudang:sumStockAllGudangTujuan?sumStockAllGudangTujuan:0,
                    stok_akhir_per_gudang:sumStockAllGudangTujuan?(sumStockAllGudangTujuan+item.qty_sub):item.qty_sub,
                    stok_awal_per_batch:checkStockPerBatchGudangTujuan?checkStockPerBatchGudangTujuan:0,
                    stok_akhir_per_batch:checkStockPerBatchGudangTujuan?(checkStockPerBatchGudangTujuan+item.qty_sub):item.qty_sub,
                    qty:item.qty_sub,
                    harga_pokok_awal:checkStock['ms_barang.harga_pokok'],
                    harga_pokok_akhir:checkStock['ms_barang.harga_pokok'],
                    tgl_transaksi:tanggal_mutasi,
                    gudang_tambahan_id:checkStock.ms_gudang_id,
                    ms_barang_id:checkStock.ms_barang_id
                })
                const tes= await historyInventory.bulkCreate(historyInventoryItems,{transaction:t})
            }
            await mutasi.update({tanggal_mutasi,status_mutasi:2},{where:{id}},{transaction:t})
            await t.commit()
            return res.status(200).json({ status: 200, message: "sukses" })
        } catch (err) {
            await t.rollback()
            return res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
    // static update(req, res) {
    //     const { id, ms_gudang_utama_id, nama_gudang, tipe_gudang } = req.body
    //     let is_utama;
    //     if(!ms_gudang_utama_id || ms_gudang_utama_id==id){
    //         is_utama=0;
    //     }else{
    //         is_utama=1;
    //     }
    //     msGudang.update({ ms_gudang_utama_id, nama_gudang, tipe_gudang, is_utama}, { where: { id } }).then(data => {
    //         res.status(200).json({ status: 200, message: "sukses" });
    //     }).catch(err => {
    //         res.status(500).json({ status: 500, message: "gagal", data: err });
    //     })
    // }

    // static delete(req, res) {
    //     const { id } = req.body
    //     msGudang.findAll({ where: { ms_gudang_utama_id: id } }).then(data => {
    //         if (data.length > 1) {
    //             const namaGudang = data.map((item) => {
    //                 if(item.dataValues.id!=id){
    //                     return item.dataValues.nama_gudang;
    //                 }
    //               });
    //             res.status(201).json({ status: 204, message: `Tidak bisa di hapus, have a child ${namaGudang}` });
    //         } else {
    //             msGudang.destroy({ where: { id } }).then(data => {
    //                 res.status(200).json({ status: 200, message: "sukses" });
    //             }).catch(err => {
    //                 res.status(500).json({ status: 500, message: "gagal", data: err });
    //             })
    //         }
    //     }).catch(err => {
    //         res.status(500).json({ status: 500, message: "gagal", data: err });
    //     })
    // }

    // static list(req, res) {

    //     msGudang.findAll({ order: [['createdAt', 'DESC']] }).then(data => {
    //         res.status(200).json({ status: 200, message: "sukses", data });
    //     }).catch(err => {
    //         res.status(500).json({ status: 500, message: "gagal", data: err });
    //     })
    // }

    static async detailsById(req, res) {
        const { id } = req.body;
        try {
            const hasil= await sq.query(`select m.id as mutasi_id, m."createdAt" as tgl_dibuat, sumber.nama_gudang as nama_gudang_sumber, sumber.is_utama as is_utama_sumber, sumber.ms_gudang_utama_id as ms_gudang_utama_id_sumber, tujuan.nama_gudang as nama_gudang_tujuan, tujuan.is_utama as is_utama_tujuan,tujuan.ms_gudang_utama_id as ms_gudang_utama_id_tujuan,* from mutasi m
            join ms_gudang sumber on sumber.id = m.ms_gudang_sumber_id
            join ms_gudang tujuan on tujuan.id = m.ms_gudang_tujuan_id 
            where m."deletedAt" isnull and sumber."deletedAt" isnull and tujuan."deletedAt" isnull and m.id='${id}'`, s)
            let data=hasil.shift();
            data.subMutasi=await sq.query(`select sm.id as sub_mutasi_id,* from sub_mutasi sm join stock s on s.id = sm.stock_id left join ms_barang mb on s.ms_barang_id=mb.id where sm."deletedAt" isnull and s."deletedAt" isnull and sm.mutasi_id ='${data.mutasi_id}'`,s);
            data.reqMutasi=await sq.query(`select srm.id as sub_req_mutasi_id,* from sub_req_mutasi srm join ms_barang mb on mb.id = srm.ms_barang_id where srm."deletedAt" isnull and mb."deletedAt" isnull and srm.mutasi_id ='${data.mutasi_id}'`,s);
            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
    
     static async allPagination(req, res) {
        const { halaman,jumlah } = req.body
        try {
            let offset = (+halaman - 1) * jumlah;
            let data = await sq.query(`select m.id as mutasi_id, m."createdAt" as tgl_dibuat, sumber.nama_gudang as nama_gudang_sumber, sumber.is_utama as is_utama_sumber, tujuan.nama_gudang as nama_gudang_tujuan, tujuan.is_utama as is_utama_tujuan,* from mutasi m
            join ms_gudang sumber on sumber.id = m.ms_gudang_sumber_id
            join ms_gudang tujuan on tujuan.id = m.ms_gudang_tujuan_id 
            where m."deletedAt" isnull and sumber."deletedAt" isnull and tujuan."deletedAt" isnull order by m."createdAt" desc limit ${jumlah} offset ${offset}`, s)
            let jml = await sq.query(`select count(*) as total from mutasi m
            join ms_gudang sumber on sumber.id = m.ms_gudang_sumber_id
            join ms_gudang tujuan on tujuan.id = m.ms_gudang_tujuan_id 
            where m."deletedAt" isnull and sumber."deletedAt" isnull and tujuan."deletedAt" isnull`, s)
            res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].total, jumlah, halaman })
        } catch (err) {
             res.status(500).json({ status: 500, message: "gagal", data: err });
        }

    }
    static async listWithParam(req, res) {
        const { ms_gudang_sumber_id,ms_gudang_tujuan_id, is_mutasi, status_mutasi, tgl_awal,tgl_akhir,id } = req.body
        let q='';
        q+=ms_gudang_sumber_id?` and m.ms_gudang_sumber_id='${ms_gudang_sumber_id}'`:'';
        q+=ms_gudang_tujuan_id?` and m.ms_gudang_tujuan_id='${ms_gudang_tujuan_id}'`:'';
        q+=is_mutasi?` and m.is_mutasi=${is_mutasi}`:'';
        q+=status_mutasi?` and m.status_mutasi=${status_mutasi}`:'';
        q+=tgl_awal?` and m.tanggal_mutasi>='${tgl_awal}'`:'';
        q+=tgl_akhir?` and m.tanggal_mutasi<='${tgl_akhir}'`:'';
        q+=id?` and m.id='${id}'`:'';
        try {
            let data = await sq.query(`select m.id as mutasi_id, sumber.nama_gudang as nama_gudang_sumber, sumber.is_utama as is_utama_sumber, tujuan.nama_gudang as nama_gudang_tujuan, tujuan.is_utama as is_utama_tujuan,* from mutasi m
            join ms_gudang sumber on sumber.id = m.ms_gudang_sumber_id
            join ms_gudang tujuan on tujuan.id = m.ms_gudang_tujuan_id 
            where m."deletedAt" isnull and sumber."deletedAt" isnull and tujuan."deletedAt" isnull${q} order by m."createdAt" desc`, s)
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (err) {
             res.status(500).json({ status: 500, message: "gagal", data: err });
        }

    }
    static async delete(req, res) {
        const { id } = req.body
        const t = await sq.transaction()
        try {
            const dataMutasi= await mutasi.findOne({where:{id}})
            if(dataMutasi.dataValues.status_mutasi==2){
                return res.status(201).json({ status: 204, message: 'mutasi sudah pernah diproses' });
            }
            const deleteSubMutasi= await subMutasi.destroy({ where: { mutasi_id:id },force:true }, { transaction: t })
            const deleteSubReqMutasi= await subReqMutasi.destroy({ where: { mutasi_id:id },force:true }, { transaction: t })
            const deleteMutasi = await mutasi.destroy({ where: { id },force:true }, { transaction: t })
            await t.commit()
            return res.status(200).json({ status: 200, message: "sukses" })
        }catch (err) {
            await t.rollback()
            return res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
}
module.exports = Controller;