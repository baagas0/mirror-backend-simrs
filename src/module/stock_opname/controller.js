const stockOpname = require('./model')
const stock = require('../stock/model')
const subStockOpname = require('../sub_stock_opname/model')
const historyInventory = require('../history_inventory/model')
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };
const ExcelJS = require("exceljs");
const excelToJson = require('convert-excel-to-json');
const moment = require('moment');
const fs = require('fs');


class Controller {
    
    static async register(req, res) {
        const { tgl_stock_opname, kode_stock_opname, status_stock_opname, ms_gudang_id, idgl_tambah, idgl_kurang } = req.body;

        try {
            let hasil = await stockOpname.create({id: uuid_v4(), tgl_stock_opname, kode_stock_opname, status_stock_opname, ms_gudang_id, idgl_tambah, idgl_kurang, user_id:req.dataUsers.id})

            res.status(200).json({ status: 200, message: "sukses", data:hasil })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static update(req, res) {
        const { id, tgl_stock_opname, kode_stock_opname, status_stock_opname, ms_gudang_id, idgl_tambah, idgl_kurang } = req.body;

        stockOpname.update({ tgl_stock_opname, kode_stock_opname, status_stock_opname, ms_gudang_id, idgl_tambah, idgl_kurangidgl_tambah, idgl_kurang, user_id :req.dataUsers.id }, { where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async delete(req, res) {
        const { id } = req.body;

        const t = await sq.transaction();
        try {
            let cekStatus = stockOpname.findAll({where:{id}})
            if(cekStatus[0].status_stock_opname!=1){
                res.status(201).json({ status: 204, message: "status bukan 1" });
            }else{
                await stockOpname.destroy({where:{id},transaction:t})
                await subStockOpname.destroy({where:{stock_opname_id:id},transaction:t})
                await t.commit();
                res.status(200).json({ status: 200, message: "sukses" });
            }
        } catch (err) {
            await t.rollback();
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async list(req, res) {
        try {
            let data = await sq.query(`select so.id as stock_opname_id,so.*, mg.*, u.username from stock_opname so join users u on u.id = so.user_id join ms_gudang mg on mg.id = so.ms_gudang_id where so."deletedAt" isnull order by so."createdAt" desc`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async listStockOpnameByGudangId(req, res) {
        const {ms_gudang_id} = req.body;
        try {
            let data = await sq.query(`select so.id as stock_opname_id,so.*, mg.*, u.username from stock_opname so join users u on u.id = so.user_id join ms_gudang mg on mg.id = so.ms_gudang_id where so."deletedAt" isnull and so.ms_gudang_id = '${ms_gudang_id}' order by so."createdAt" desc`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async detailsById(req, res) {
        const { id } = req.params

        try {
            let data = await sq.query(`select so.id as stock_opname_id,so.*, mg.*, u.username from stock_opname so join users u on u.id = so.user_id join ms_gudang mg on mg.id = so.ms_gudang_id where so."deletedAt" isnull and so.id = '${id}'`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
    
    static async downloadStockByGudangId(req, res) {
        const { ms_gudang_id,tgl_stock_opname } = req.query

        try {
            let satu = []
            let data = await sq.query(`select s.id as stock_id, s.ms_barang_id, mb.nama_barang, mb.kode_produk, s.kode_batch, s.qty, date(s.tgl_kadaluarsa) as tgl_kadaluarsa, mg.nama_gudang from stock s
            join ms_barang mb on mb.id = s.ms_barang_id 
            join ms_gudang mg on mg.id = s.ms_gudang_id 
            where s."deletedAt" isnull and s.ms_gudang_id = '${ms_gudang_id}' order by mb.nama_barang,date(s.tgl_kadaluarsa)`, s);

            for (let i = 0; i < data.length; i++) {
                if(data[i].qty>0){
                    satu.push(data[i])
                }
            }

            let workbook = new ExcelJS.Workbook();
            let sheet1 = workbook.addWorksheet("sheet1");
            let sheet2 = workbook.addWorksheet("sheet2");

            let x= [
                { header: "stock id", key: "stock_id", width: 40, style:{alignment:{horizontal: 'center'}} },
                { header: "nama gudang", key: "nama_gudang", width: 30, style:{alignment:{horizontal: 'center'}} },
                { header: "nama barang", key: "nama_barang", width: 30, style:{alignment:{horizontal: 'center'}} },
                { header: "kode produk", key: "kode_produk", width: 20, style:{alignment:{horizontal: 'center'}} },
                { header: "kode batch", key: "kode_batch", width: 20, style:{alignment:{horizontal: 'center'}} },
                { header: "tanggal kadaluarsa", key: "tgl_kadaluarsa", width: 25, style:{alignment:{horizontal: 'center'}} },
                { header: "qty", key: "qty", width: 10, style:{alignment:{horizontal: 'center'}} },
            ];
            let y= [
                { header: "stock id", key: "stock_id", width: 40, style:{alignment:{horizontal: 'center'}} },
                { header: "nama gudang", key: "nama_gudang", width: 30, style:{alignment:{horizontal: 'center'}} },
                { header: "nama barang", key: "nama_barang", width: 30, style:{alignment:{horizontal: 'center'}} },
                { header: "kode produk", key: "kode_produk", width: 20, style:{alignment:{horizontal: 'center'}} },
                { header: "kode batch", key: "kode_batch", width: 20, style:{alignment:{horizontal: 'center'}} },
                { header: "tanggal kadaluarsa", key: "tgl_kadaluarsa", width: 25, style:{alignment:{horizontal: 'center'}} },
                { header: "qty", key: "qty", width: 10, style:{alignment:{horizontal: 'center'}} },
            ];

            sheet1.columns = x;
            sheet2.columns = y;
            sheet1.addRows(satu);
            sheet2.addRows(data);

            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.setHeader("Content-Disposition", "attachment; filename=" + `stockopname_${moment(tgl_stock_opname).format('YYYYMMDD')}.xlsx`);

            await workbook.xlsx.write(res);
            res.end();
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async uploadExcel(req, res) {
        const {stock_opname_id,gudang_id} = req.body;
        const t = await sq.transaction();
        try {
            let tidakAdaDiExcel = []
            let gagalUpload = []
            let bulkSubStockOpname = []
            const path_excel = `./asset/file/${req.files.file1[0].filename}`
            const result = excelToJson({sourceFile: path_excel, header:{rows: 1}, columnToKey: {A:'stock_id',B:'nama_gudang',C:'nama_barang',D:'kode_produk',E:'kode_batch:',F:'tgl_kadaluarsa',G:'qty'},sheets: ['sheet1']});
            fs.unlink(path_excel,(err)=>{if(err)console.log("error");});
            let dataStock = await sq.query(`select s.id as stock_id, s.ms_barang_id, mb.nama_barang, mb.kode_produk, s.kode_batch, s.qty, date(s.tgl_kadaluarsa) as tgl_kadaluarsa, mg.nama_gudang from stock s join ms_barang mb on mb.id = s.ms_barang_id join ms_gudang mg on mg.id = s.ms_gudang_id where s."deletedAt" isnull and s.ms_gudang_id = '${gudang_id}' order by mb.nama_barang, date(s.tgl_kadaluarsa)`,s)
            let dataExcel = result.sheet1
            let cekStockOpname = await stockOpname.findAll({where:{id:stock_opname_id}})
            if(cekStockOpname[0].status_stock_opname != 1){
                res.status(201).json({status:204,message:"status stockopname bukan 1",dataSelisih:tidakAdaDiExcel,dataGagal:gagalUpload,data:[]})
            }else{
                for (let i = 0; i < dataExcel.length; i++) {
                    let cekStock = false
                    dataExcel[i].keterangan = ''
                    if(typeof dataExcel[i].stock_id != 'string' || typeof dataExcel[i].qty != 'number'){
                        let keterangan = ''
                        keterangan += typeof dataExcel[i].stock_id != 'string'? ',stock_id tidak sesuai ':""
                        keterangan += typeof dataExcel[i].qty != 'number'? ',qty bukan number ':""
                        dataExcel[i].keterangan = keterangan.substring(1)
                        gagalUpload.push(dataExcel[i])
                    }
                    for (let j = 0; j < dataStock.length; j++) {
                        if(dataExcel[i].stock_id == dataStock[j].stock_id){
                            cekStock = true
                        }
                    }
                    if(!cekStock){
                        tidakAdaDiExcel.push(dataExcel[i])
                    }
                    bulkSubStockOpname.push({id:uuid_v4(),stock_opname_id:stock_opname_id,qty_stock_opname:dataExcel[i].qty,stock_id:dataExcel[i].stock_id})
                }
    
                if(tidakAdaDiExcel.length==0 && gagalUpload.length ==0){
                    await subStockOpname.destroy({where:{stock_opname_id},transaction:t, force: true})
                    let data = await subStockOpname.bulkCreate(bulkSubStockOpname,{transaction:t})
                    await t.commit();
                    res.status(200).json({status:200,message:"sukses",dataSelisih:tidakAdaDiExcel,dataGagal:gagalUpload,data:dataExcel})
                }else{
                    res.status(201).json({status:204,message:"data tidak sesuai",dataSelisih:tidakAdaDiExcel,dataGagal:gagalUpload,data:[]})
                }
            }
           
        } catch (err) {
            await t.rollback();
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async simpanStockOpname(req, res) {
        const {stock_opname_id} = req.body;

        const t = await sq.transaction();
        try {
            let cekStockOpname = await sq.query(`select sso.id as sub_stock_opname_id, sso.*, so.*, s.ms_barang_id from sub_stock_opname sso join stock_opname so on so.id = sso.stock_opname_id join stock s on s.id = sso.stock_id where sso."deletedAt" isnull and so."deletedAt" isnull and sso.stock_opname_id  = '${stock_opname_id}'`,s);

            if(cekStockOpname.length==0){
                res.status(201).json({status:204,message:"stockopname id tidak ada"})
            }else{
                if(cekStockOpname[0].status_stock_opname != 1){
                    res.status(201).json({status:204,message:"status stockopname bukan 1"})
                }else{
                    let historyInv = [];
                    let inv = []
                    let dataStock = await sq.query(`select s.id as stock_id,s.*,mb.* from stock s join ms_barang mb on s.ms_barang_id = mb.id where s."deletedAt" isnull and s.ms_gudang_id = '${cekStockOpname[0].ms_gudang_id}'`,s);
                    let total = await sq.query(`select s.ms_barang_id, sum(s.qty) as total from stock s where s."deletedAt" isnull and s.ms_gudang_id = '${cekStockOpname[0].ms_gudang_id}' group by s.ms_barang_id`,s)
                    
                    for (let i = 0; i < dataStock.length; i++) {
                        let sama = false
                        let x = {}
                        x.id = uuid_v4()
                        x.tipe_transaksi= 'stock opname'
                        x.debit_kredit= ''
                        x.qty= 0
                        x.harga_pokok_awal= dataStock[i].harga_pokok
                        x.harga_pokok_akhir= dataStock[i].harga_pokok
                        x.tgl_transaksi= cekStockOpname[0].tgl_stock_opname
                        x.ms_gudang_id= dataStock[i].ms_gudang_id
                        x.stock_id= dataStock[i].stock_id
                        x.ms_barang_id= dataStock[i].ms_barang_id
                        x.transaksi_id= stock_opname_id
                        x.stok_awal_per_gudang= 0
                        x.stok_akhir_per_gudang= 0
                        x.stok_awal_per_batch= dataStock[i].qty
                        x.stok_akhir_per_batch= 0
                        for (let j = 0; j < cekStockOpname.length; j++) {
                            if(cekStockOpname[j].stock_id == dataStock[i].stock_id ){
                                if(cekStockOpname[j].qty_stock_opname == dataStock[i].qty){
                                    sama = true
                                }else if(cekStockOpname[j].qty_stock_opname > dataStock[i].qty){
                                    x.debit_kredit= 'd'
                                    x.qty= cekStockOpname[j].qty_stock_opname - dataStock[i].qty
                                    x.stok_akhir_per_batch = cekStockOpname[j].qty_stock_opname
                                    inv.push({id:dataStock[i].stock_id, qty:cekStockOpname[j].qty_stock_opname})
                                }else{
                                    x.debit_kredit= 'k'
                                    x.qty= dataStock[i].qty - cekStockOpname[j].qty_stock_opname
                                    x.stok_akhir_per_batch = cekStockOpname[j].qty_stock_opname
                                    inv.push({id:dataStock[i].stock_id, qty:cekStockOpname[j].qty_stock_opname})
                                }
                            }
                        }
                        for (let k = 0; k < total.length; k++) {
                            if(total[k].ms_barang_id == dataStock[i].ms_barang_id){
                                x.stok_awal_per_gudang= total[k].total
                                if(x.debit_kredit == 'k'){
                                    x.stok_akhir_per_gudang= total[k].total- x.qty
                                    total[k].total=- x.qty
                                    
                                }else if (x.debit_kredit == 'd'){
                                    x.stok_akhir_per_gudang= total[k].total+ x.qty
                                    total[k].total+= x.qty
                                }
                            }
                        }
                        if(!sama)(
                            historyInv.push(x)
                        )
                    }
                    await stockOpname.update({status_stock_opname:2},{where:{id:stock_opname_id},transaction:t})
                    await stock.bulkCreate(inv,{updateOnDuplicate:['qty'],transaction:t})
                    await historyInventory.bulkCreate(historyInv,{transaction:t})
                    await t.commit();

                    res.status(200).json({status:200,message:"sukses"})
                }
            }
        } catch (err) {
            await t.rollback();
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
}

module.exports = Controller