const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const penjualanOperasi = require('./model')
const penjualan = require('../penjualan/model')
const stockBarang = require('../stock/model')
const historyInv = require('../history_inventory/model')
const s = { type: QueryTypes.SELECT };
const {kurangiStock,kembaliStock,updateStock} = require('../../helper/stock_barang');

class Controller {

    static async register(req, res) {
        const {qty_barang: qty, harga_barang: harga_satuan, harga_barang_custom: harga_satuan_custom, harga_pokok, keterangan, status_penjualan_operasi, penjualan_id, ms_barang_id, jenis, harga_total_operasi, discount, tax, total_penjualan, ms_gudang_id} = req.body;
        
        try {
            let cekPenjualan = await penjualan.findAll({where:{id:penjualan_id}})
            if(cekPenjualan.length==0){
                res.status(201).json({ status: 204, message: "penjualan_id tidak ada" })
            }else{
                if(cekPenjualan[0].status_penjualan != 1){
                    res.status(201).json({ status: 204, message: "status penjualan bukan 1" })
                }else{
                    let cekPenjualanOperasi = await penjualanOperasi.findAll({where:{penjualan_id, ms_barang_id}})
                    if(cekPenjualanOperasi.length>0){
                        res.status(201).json({ status: 204, message: "data sudah ada" })
                    }else{
                        let barang = await kurangiStock({ms_gudang_id,isi:`'${ms_barang_id}'`,bulk_barang:[{ms_barang_id,penjualan_id,qty_barang:qty}]})
                        if(barang.cekHasil.length > 0){
                            res.status(201).json({ status: 204, message: "stock tidak cukup",data:barang.cekHasil })
                        }else{
                            let hasil = await sq.transaction(async t =>{
                                let data = await penjualanOperasi.create({
                                    id:uuid_v4(),
                                    qty, 
                                    harga_satuan, 
                                    harga_satuan_custom, 
                                    harga_pokok, 
                                    keterangan,
                                    status_penjualan_operasi, 
                                    penjualan_id, 
                                    ms_barang_id,
                                    jenis
                                },{transaction:t});     
                                await penjualan.update({harga_total_operasi, discount, tax, total_penjualan},{where:{id:penjualan_id},transaction:t})
                                await stockBarang.bulkCreate(barang.stock,{updateOnDuplicate:['qty'],transaction:t})
                                await historyInv.bulkCreate(barang.hisInv,{transaction:t})

                                return data
                            })
                            
                            res.status(200).json({ status: 200, message: "sukses", data:hasil })
                        }
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
        const { id, qty_barang: qty, harga_barang: harga_satuan, harga_barang_custom: harga_satuan_custom, harga_pokok, keterangan, status_penjualan_operasi, penjualan_id, ms_barang_id, harga_total_operasi, discount, tax, total_penjualan, jenis } = req.body;

        try {
            let dataOperasi = await sq.query(`select po.*,p.ms_gudang_id from penjualan_operasi po join penjualan p on p.id = po.penjualan_id where po."deletedAt" isnull and po.id = '${id}'`,s);
            if(dataOperasi[0].status_penjualan_operasi != 1){
                res.status(201).json({ status: 204, message: "status penjualan operasi bukan 1" });
            }else{
                let stock = []
                let hisInv = []
                let barang = []

                if(dataOperasi[0].qty != qty){
                    dataOperasi[0].qtyUpdate = +qty
                    dataOperasi[0].qty_barang = dataOperasi[0].qty
                    let data = await updateStock({ms_gudang_id:dataOperasi[0].ms_gudang_id,bulk_barang:dataOperasi,isi:`'${dataOperasi[0].ms_barang_id}'`})
                    if(data.cekHasil.length>0){
                        barang = data.cekHasil
                    }else{
                        stock= data.stock
                        hisInv= data.hisInv
                    }
                }

                if(barang.length>0){
                    res.status(201).json({status:204,message:"stock tidak cukup",data:barang})
                }else{
                    await sq.transaction(async t=>{
                        await penjualanOperasi.update({ qty, harga_satuan, harga_satuan_custom, harga_pokok, keterangan, status_penjualan_operasi, penjualan_id, ms_barang_id, jenis }, { where: { id },transaction:t })
                        await penjualan.update({harga_total_operasi, discount, tax, total_penjualan},{where:{id:penjualan_id},transaction:t})
                        await stockBarang.bulkCreate(stock,{updateOnDuplicate:['qty'],transaction:t})
                        await historyInv.bulkCreate(hisInv,{transaction:t})
                    })

                    res.status(200).json({ status: 200, message: "sukses" });
                }
            }
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async delete(req, res) {
        const { id, harga_total_operasi, discount, tax, total_penjualan, penjualan_id } = req.body;

        try {
            let dataOperasi = await sq.query(`select po.*,p.ms_gudang_id from penjualan_operasi po join penjualan p on p.id = po.penjualan_id where po."deletedAt" isnull and po.id = '${id}'`,s);

            if(dataOperasi.length==0){
                res.status(201).json({ status: 204, message: "data tidak ditemukan" });
            }else{
                if(dataOperasi[0].status_penjualan_operasi != 1){
                    res.status(201).json({ status: 204, message: "status penjualan operasi bukan 1" });
                }else{
                    dataOperasi[0].qty_barang = dataOperasi[0].qty
                    let barang = await kembaliStock({ms_gudang_id:dataOperasi[0].ms_gudang_id,bulk_barang:dataOperasi,isi:`'${dataOperasi[0].ms_barang_id}'`})
                    await sq.transaction(async t =>{
                        await penjualan.update({harga_total_operasi,discount, tax, total_penjualan},{ where: {id:penjualan_id},transaction:t })
                        await penjualanOperasi.destroy({ where: {id},transaction:t })
                        await historyInv.bulkCreate(barang.hisInv,{transaction:t})
                        await stockBarang.bulkCreate(barang.stock,{updateOnDuplicate:['qty'],transaction:t})
                    })

                    res.status(200).json({ status: 200, message: "sukses" });
                }
            }
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async list(req, res) {
        try {
            let data = await sq.query(`select po.id as penjualan_operasi_id, po.*,
            mb.nama_barang, mb.kode_produk, mb.qjb, mb.harga_pokok, mb.harga_tertinggi, mb.harga_beli_terahir,
            mb.ms_jenis_obat_id, mjo.nama_jenis_obat, mb.komposisi, mb.ms_satuan_jual_id, msb.nama_satuan,
            p.kode_penjualan
            from penjualan_operasi po 
            join ms_barang mb on mb.id = po.ms_barang_id
            join ms_jenis_obat mjo on mjo.id = mb.ms_jenis_obat_id
            join ms_satuan_barang msb on msb.id = mb.ms_satuan_barang_id
            join penjualan p on p.id = po.penjualan_id
            where po."deletedAt" isnull order by po."createdAt" desc`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async listPenjualanOperasiByPenjualanId(req, res) {
        const {penjualan_id, order} = req.body;
        try {
            let urut = order
            if (urut != 'desc' && urut != 'asc') {
                urut = 'desc'
            }

            let data = await sq.query(`select po.id as penjualan_operasi_id, po.*,
            mb.nama_barang, mb.kode_produk, mb.qjb, mb.harga_pokok, mb.harga_tertinggi, mb.harga_beli_terahir,
            mb.ms_jenis_obat_id, mjo.nama_jenis_obat, mb.komposisi, mb.ms_satuan_jual_id, msb.nama_satuan,
            p.kode_penjualan, p.ms_gudang_id,
            mg.nama_gudang, mg.tipe_gudang,
            (select sum(s.qty) as total_stock_barang from stock s where s."deletedAt" isnull and s.ms_gudang_id = p.ms_gudang_id and s.ms_barang_id = po.ms_barang_id)
            from penjualan_operasi po
            join penjualan p on p.id = po.penjualan_id
            join ms_barang mb on mb.id = po.ms_barang_id
            join ms_jenis_obat mjo on mjo.id = mb.ms_jenis_obat_id
            join ms_satuan_barang msb on msb.id = mb.ms_satuan_barang_id
            join ms_gudang mg on mg.id = p.ms_gudang_id
            where po."deletedAt" isnull and po.penjualan_id = '${penjualan_id}' 
            order by po."createdAt" ${urut}`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
    
    static async listPenjualanOperasiByMsBarangId(req, res) {
        const {ms_barang_id} = req.body;
        try {
            let data = await sq.query(`select po.id as penjualan_operasi_id, po.*,
            mb.nama_barang, mb.kode_produk, mb.qjb, mb.harga_pokok, mb.harga_tertinggi, mb.harga_beli_terahir,
            mb.ms_jenis_obat_id, mjo.nama_jenis_obat, mb.komposisi, mb.ms_satuan_jual_id, msb.nama_satuan,
            p.kode_penjualan
            from penjualan_operasi po 
            join ms_barang mb on mb.id = po.ms_barang_id
            join ms_jenis_obat mjo on mjo.id = mb.ms_jenis_obat_id
            join ms_satuan_barang msb on msb.id = mb.ms_satuan_barang_id
            join penjualan p on p.id = po.penjualan_id
            where po."deletedAt" isnull and po.ms_barang_id = '${ms_barang_id}' 
            order by po."createdAt" desc`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async listPenjualanOperasiByRegistrasiId(req, res) {
        const {registrasi_id} = req.body;
        try {
            let data = await sq.query(`select po.id as penjualan_operasi_id, po.*,
            mb.nama_barang, mb.kode_produk, mb.qjb, mb.harga_pokok, mb.harga_tertinggi, mb.harga_beli_terahir,
            mb.ms_jenis_obat_id, mjo.nama_jenis_obat, mb.komposisi, mb.ms_satuan_jual_id, msb.nama_satuan,
            p.kode_penjualan, p.registrasi_id
            from penjualan_operasi po 
            join penjualan p on p.id = po.penjualan_id
            join ms_barang mb on mb.id = po.ms_barang_id
            join ms_jenis_obat mjo on mjo.id = mb.ms_jenis_obat_id
            join ms_satuan_barang msb on msb.id = mb.ms_satuan_barang_id
            where po."deletedAt" isnull and p.registrasi_id = '${registrasi_id}' 
            order by p.kode_penjualan, mb.nama_barang`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async detailsById(req, res) {
        const { id } = req.params

        try {
            let data = await sq.query(`select po.id as penjualan_operasi_id, po.*,
            mb.nama_barang, mb.kode_produk, mb.qjb, mb.harga_pokok, mb.harga_tertinggi, mb.harga_beli_terahir,
            mb.ms_jenis_obat_id, mjo.nama_jenis_obat, mb.komposisi, mb.ms_satuan_jual_id, msb.nama_satuan,
            p.kode_penjualan, p.registrasi_id, p.tgl_penjualan
            from penjualan_operasi po 
            join ms_barang mb on mb.id = po.ms_barang_id
            join ms_jenis_obat mjo on mjo.id = mb.ms_jenis_obat_id
            join ms_satuan_barang msb on msb.id = mb.ms_satuan_barang_id
            join penjualan p on p.id = po.penjualan_id
            where po."deletedAt" isnull and po.id = '${id}'`,s);
            
            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
}

module.exports = Controller




