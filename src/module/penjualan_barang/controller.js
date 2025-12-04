const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const penjualanBarang = require('./model')
const penjualan = require('../penjualan/model')
const stockBarang = require('../stock/model')
const historyInv = require('../history_inventory/model')
const s = { type: QueryTypes.SELECT };
const {kurangiStock,kembaliStock,updateStock} = require('../../helper/stock_barang');

class Controller {

    static async register(req, res) {
        const {qty_barang, harga_barang, harga_barang_custom, harga_pokok_barang, keterangan_penjualan_barang, status_penjualan_barang, penjualan_id, ms_barang_id, harga_total_barang, discount, tax, total_penjualan,ms_gudang_id} = req.body;
        
        try {
            let cekPenjualan = await penjualan.findAll({where:{id:penjualan_id}})
            if(cekPenjualan.length==0){
                res.status(201).json({ status: 204, message: "penjualan_id tidak ada" })
            }else{
                if(cekPenjualan[0].status_penjualan != 1){
                    res.status(201).json({ status: 204, message: "status penjualan bukan 1" })
                }else{
                    let cekPenjualanBarang = await penjualanBarang.findAll({where:{penjualan_id, ms_barang_id}})
                    if(cekPenjualanBarang.length>0){
                        res.status(201).json({ status: 204, message: "data sudah ada" })
                    }else{
                        let barang = await kurangiStock({ms_gudang_id,isi:`'${ms_barang_id}'`,bulk_barang:[{ms_barang_id,penjualan_id,qty_barang}]})
                        if(barang.cekHasil.length > 0){
                            res.status(201).json({ status: 204, message: "stock tidak cukup",data:barang.cekHasil })
                        }else{
                            // console.log(barang);
                            let hasil = await sq.transaction(async t =>{
                                let data = await penjualanBarang.create({id:uuid_v4(),qty_barang, harga_barang, harga_barang_custom, harga_pokok_barang, keterangan_penjualan_barang, status_penjualan_barang, penjualan_id, ms_barang_id},{transaction:t});     
                                await penjualan.update({harga_total_barang, discount, tax, total_penjualan},{where:{id:penjualan_id},transaction:t})
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
        const { id, qty_barang, harga_barang, harga_barang_custom, harga_pokok_barang, keterangan_penjualan_barang, status_penjualan_barang, penjualan_id, ms_barang_id, harga_total_barang, discount, tax, total_penjualan } = req.body;

        try {
            let dataBarang = await sq.query(`select pb.*,p.ms_gudang_id from penjualan_barang pb join penjualan p on p.id = pb.penjualan_id where pb."deletedAt" isnull and pb.id = '${id}'`,s);
            if(dataBarang[0].status_penjualan_barang != 1){
                res.status(201).json({ status: 204, message: "status penjualan barang bukan 1" });
            }else{
                let stock = []
                let hisInv = []
                let barang = []

                if(dataBarang[0].qty_barang != qty_barang){
                    dataBarang[0].qtyUpdate = +qty_barang
                    let data = await updateStock({ms_gudang_id:dataBarang[0].ms_gudang_id,bulk_barang:dataBarang,isi:`'${dataBarang[0].ms_barang_id}'`})
                    if(data.cekHasil.length>0){
                        barang = data.cekHasil
                    }else{
                        stock= data.stock
                        hisInv= data.hisInv
                    }
                }

                if(barang.length>0){
                    res.status(201).json({status:204,message:"sukses",data:barang})
                }else{
                    await sq.transaction(async t=>{
                        await penjualanBarang.update({ qty_barang, harga_barang, harga_barang_custom, harga_pokok_barang, keterangan_penjualan_barang, status_penjualan_barang, penjualan_id, ms_barang_id }, { where: { id },transaction:t })
                        await penjualan.update({harga_total_barang, discount, tax, total_penjualan},{where:{id:penjualan_id},transaction:t})
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
        const { id, harga_total_barang, discount, tax, total_penjualan, penjualan_id } = req.body;

        try {
            let dataBarang = await sq.query(`select pb.*,p.ms_gudang_id from penjualan_barang pb join penjualan p on p.id = pb.penjualan_id where pb."deletedAt" isnull and pb.id = '${id}'`,s);

            if(dataBarang.length==0){
                res.status(201).json({ status: 204, message: "barang tidak ditemukan" });
            }else{
                if(dataBarang[0].status_penjualan_barang != 1){
                    res.status(201).json({ status: 204, message: "status penjualan barang bukan 1" });
                }else{
                    let barang = await kembaliStock({ms_gudang_id:dataBarang[0].ms_gudang_id,bulk_barang:dataBarang,isi:`'${dataBarang[0].ms_barang_id}'`})
                    await sq.transaction(async t =>{
                        await penjualan.update({harga_total_barang,discount, tax, total_penjualan},{ where: {id:penjualan_id},transaction:t })
                        await penjualanBarang.destroy({ where: {id},transaction:t })
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
            let data = await sq.query(`select pb.id as penjualan_barang_id,pb.*,mb.nama_barang,mb.kode_produk,mb.qjb,mb.harga_pokok,mb.harga_tertinggi,mb.harga_beli_terahir,
            mb.ms_jenis_obat_id,mjo.nama_jenis_obat,mb.komposisi, mb.ms_satuan_jual_id,msb.nama_satuan 
            from penjualan_barang pb 
            join ms_barang mb on mb.id = pb.ms_barang_id
            join ms_jenis_obat mjo on mjo.id = mb.ms_jenis_obat_id
            join ms_satuan_barang msb on msb.id = mb.ms_satuan_barang_id
            where pb."deletedAt" isnull order by pb."createdAt" desc`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async listPenjualanBarangByPenjualanId(req, res) {
        const {penjualan_id, order} = req.body;
        try {
            let urut = order
            if (urut != 'desc' && urut != 'asc') {
                urut = 'desc'
            }

            let data = await sq.query(` select pb.id as penjualan_barang_id,pb.*,mb.nama_barang,mb.kode_produk,mb.qjb,mb.harga_pokok,mb.harga_tertinggi,mb.harga_beli_terahir,
            mb.ms_jenis_obat_id,mjo.nama_jenis_obat,mb.komposisi, mb.ms_satuan_jual_id,msb.nama_satuan,p.ms_gudang_id,mg.nama_gudang,mg.tipe_gudang,
            (select sum(s.qty) as total_stock_barang from stock s where s."deletedAt" isnull and s.ms_gudang_id = p.ms_gudang_id and s.ms_barang_id = pb.ms_barang_id) 
            from penjualan_barang pb
            join penjualan p on p.id = pb.penjualan_id
            join ms_barang mb on mb.id = pb.ms_barang_id
            join ms_jenis_obat mjo on mjo.id = mb.ms_jenis_obat_id
            join ms_satuan_barang msb on msb.id = mb.ms_satuan_barang_id
            join ms_gudang mg on mg.id = p.ms_gudang_id
            where pb."deletedAt" isnull and pb.penjualan_id = '${penjualan_id}' order by pb."createdAt" ${urut}`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
    
    static async listPenjualanBarangByMsBarangId(req, res) {
        const {ms_barang_id} = req.body;
        try {
            let data = await sq.query(`select pb.id as penjualan_barang_id,pb.*,mb.nama_barang,mb.kode_produk,mb.qjb,mb.harga_pokok,mb.harga_tertinggi,mb.harga_beli_terahir,
            mb.ms_jenis_obat_id,mjo.nama_jenis_obat,mb.komposisi, mb.ms_satuan_jual_id,msb.nama_satuan 
            from penjualan_barang pb 
            join ms_barang mb on mb.id = pb.ms_barang_id
            join ms_jenis_obat mjo on mjo.id = mb.ms_jenis_obat_id
            join ms_satuan_barang msb on msb.id = mb.ms_satuan_barang_id
            where pb."deletedAt" isnull and pb.ms_barang_id = '${ms_barang_id}' order by pb."createdAt" desc`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async detailsById(req, res) {
        const { id } = req.params

        try {
            let data = await sq.query(`select pb.id as penjualan_barang_id,pb.*,mb.nama_barang,mb.kode_produk,mb.qjb,mb.harga_pokok,mb.harga_tertinggi,mb.harga_beli_terahir,
            mb.ms_jenis_obat_id,mjo.nama_jenis_obat,mb.komposisi, mb.ms_satuan_jual_id,msb.nama_satuan 
            from penjualan_barang pb 
            join ms_barang mb on mb.id = pb.ms_barang_id
            join ms_jenis_obat mjo on mjo.id = mb.ms_jenis_obat_id
            join ms_satuan_barang msb on msb.id = mb.ms_satuan_barang_id
            where pb."deletedAt" isnull and pb.id = '${id}'`,s);
            
            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async cobaStock (req,res){
        try {
            let bulk_barang=[
                {
                    ms_barang_id:'1054dd3d-52d5-4ace-9a76-fefdaef4a6f6',
                    qty_barang:96000,
                    penjualan_id:5,
                    nama_barang: 'Panadol'
                },
                // {
                //     ms_barang_id:'2de9d899-9a52-47e4-b782-bbd0967a97f3',
                //     qty_barang:100,
                //     penjualan_id:5,
                //     nama_barang: 'Paramex'
                // },
                // {
                //     ms_barang_id:'8e8777af-9879-4e6b-8da5-0394b4229f60',
                //     qty_barang:245,
                //     penjualan_id:5,
                //     nama_barang: 'Bodrex'
                // }
            ]
            let isi=`'1054dd3d-52d5-4ace-9a76-fefdaef4a6f6','2de9d899-9a52-47e4-b782-bbd0967a97f3','8e8777af-9879-4e6b-8da5-0394b4229f60'`
            let x = {bulk_barang,ms_gudang_id:'0fd76213-f360-4851-9ddb-6ee684fafb63',isi}

            let data = await kurangiStock(x)
            console.log("===============hasil================");
            console.log(data);
            res.status(200).json({status:200,message:"sukses",data})
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
}

module.exports = Controller