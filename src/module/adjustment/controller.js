const adjustment = require('./model')
const historyInventory = require('../history_inventory/model')
const stock = require('../stock/model')
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };
const moment = require('moment');

class Controller {
    static async register(req, res) {
        const { tgl_adjustment, kode_adjustment, idgl_tambah, idgl_kurang, status_adjustment, ms_gudang_id } = req.body;

        try {
            let adjustment_id = uuid_v4()
            let data_adjustment = await adjustment.create({ id: adjustment_id, tgl_adjustment, kode_adjustment, idgl_tambah, idgl_kurang, status_adjustment, ms_gudang_id, user_id: "admin" })

            res.status(200).json({ status: 200, message: "sukses", data: data_adjustment })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static update(req, res) {
        const { id, tgl_adjustment, kode_adjustment, idgl_tambah, idgl_kurang, status_adjustment, ms_gudang_id } = req.body;

        adjustment.update({ tgl_adjustment, kode_adjustment, idgl_tambah, idgl_kurang, status_adjustment, ms_gudang_id }, { where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static delete(req, res) {
        const { id } = req.body;

        adjustment.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        try {
            let data = await sq.query(`select a.id as "adjustment_id", * from adjustment a 
            join ms_gudang mg on mg.id = a.ms_gudang_id 
            join users u on u.id = a.user_id 
            where a."deletedAt" isnull and mg."deletedAt" isnull and u."deletedAt" isnull 
            order by a."createdAt" desc `, s)

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async detailsById(req, res) {
        const { id } = req.params

        try {
            let data = await sq.query(`select a.id as "adjustment_id", * from adjustment a 
            join ms_gudang mg on mg.id = a.ms_gudang_id 
            join users u on u.id = a.user_id 
            where a."deletedAt" isnull and mg."deletedAt" isnull and u."deletedAt" isnull and a.id = '${id}'`, s)

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async simpanAdjustment(req, res) {
        const { adjustment_id } = req.body

        const t = await sq.transaction()

        try {
            let data = await sq.query(`select sa.id as "sub_adjustment_id", sa.stock_id ,sa.qty_stock_adjustment ,s.qty , s.ms_barang_id ,mb.nama_barang ,mb.harga_pokok , s.ms_gudang_id ,s.kode_batch ,sa.adjustment_id 
            from sub_adjustment sa 
            join adjustment a on a.id = sa.adjustment_id 
            join stock s on s.id = sa.stock_id 
            join ms_barang mb on mb.id = s.ms_barang_id 
            where sa."deletedAt" isnull and a."deletedAt" isnull and s."deletedAt" isnull and mb."deletedAt" isnull 
            and sa.adjustment_id = '${adjustment_id}'`, s)

            let data2 = await sq.query(`select s.id as "stock_id", s.kode_batch ,s.qty ,s.ms_barang_id ,mb.nama_barang ,
            (select sum(s2.qty) as "jumlah" from stock s2 join ms_barang mb2 on mb2.id = s2.ms_barang_id and mb2.id = s.ms_barang_id 
            where s2."deletedAt" isnull and mb."deletedAt" isnull and s2.ms_gudang_id = '${data[0].ms_gudang_id}' ) 
			from stock s 
            join ms_barang mb on mb.id = s.ms_barang_id 
            join ms_gudang mg on mg.id = s.ms_gudang_id 
            where s."deletedAt" isnull and mb."deletedAt" isnull and mg."deletedAt" isnull and s.ms_gudang_id = '${data[0].ms_gudang_id}'`, s)

            let bulk = []
            let bulk_stok = []
            for (let i = 0; i < data.length; i++) {
                let tgl = moment().format()
                let obj = {
                    id: uuid_v4(),
                    ms_gudang_id: data[i].ms_gudang_id,
                    ms_barang_id: data[i].ms_barang_id,
                    tgl_transaksi: tgl,
                    tipe_transaksi: 'adjustment',
                    transaksi_id: adjustment_id,
                    stock_id: data[i].stock_id,
                    harga_pokok_awal: data[i].harga_pokok,
                    harga_pokok_akhir: data[i].harga_pokok,
                    stok_awal_per_gudang: 0,
                    stok_akhir_per_gudang: 0,
                    stok_awal_per_batch: data[i].qty,
                    stok_akhir_per_batch: 0,
                    qty: 0
                }
                let obj2 = {
                    id: data[i].stock_id,
                    qty: 0
                }
                for (let j = 0; j < data2.length; j++) {
                    if (data2[j].stock_id == data[i].stock_id) {
                        obj.stok_awal_per_gudang = data2[j].jumlah
                        if (data[i].qty_stock_adjustment > data2[j].qty) {
                            let jml = data[i].qty_stock_adjustment - data2[j].qty
                            obj.qty = jml
                            obj.stok_akhir_per_gudang = obj.stok_awal_per_gudang + jml
                            obj.stok_akhir_per_batch = data2[j].qty + jml
                            obj.debit_kredit = 'd'
                            obj2.qty = data2[j].qty + jml
                        }
                        if (data[i].qty_stock_adjustment < data2[j].qty) {
                            let jml = data2[j].qty - data[i].qty_stock_adjustment
                            obj.qty = jml
                            obj.stok_akhir_per_gudang = obj.stok_awal_per_gudang - jml
                            obj.stok_akhir_per_batch = data2[j].qty - jml
                            obj.debit_kredit = 'k'
                            obj2.qty = data2[j].qty - jml
                        }
                    }
                }
                bulk.push(obj)
                bulk_stok.push(obj2)
            }

            await stock.bulkCreate(bulk_stok, { updateOnDuplicate: ["qty"], transaction: t })
            await historyInventory.bulkCreate(bulk, { transaction: t })
            await adjustment.update({ status_adjustment: 2 }, { where: { id: adjustment_id }, transaction: t })

            await t.commit()
            res.status(200).json({ status: 200, message: "sukses" });
        } catch (err) {
            await t.rollback()
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
}

module.exports = Controller