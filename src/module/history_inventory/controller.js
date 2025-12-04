const stock = require('./model')
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };

class Controller {
    static async register(req, res) {
        const { tipe_transaksi, debit_kredit, id_transaksi, stok_awal_per_gudang, stok_akhir_per_gudang, stok_awal_per_batch, stok_akhir_per_batch, qty, harga_pokok_awal, harga_pokok_akhir, tgl_transaksi, ms_gudang_id, stock_id, gudang_tambahan_id, ms_barang_id } = req.body;

        try {
            let hasil = await stock.create({id: uuid_v4(), tipe_transaksi, debit_kredit,  id_transaksi, stok_awal_per_gudang, stok_akhir_per_gudang, stok_awal_per_batch, stok_akhir_per_batch, qty, harga_pokok_awal, harga_pokok_akhir, tgl_transaksi, ms_gudang_id, stock_id, gudang_tambahan_id, ms_barang_id})

            res.status(200).json({ status: 200, message: "sukses", data:hasil })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static update(req, res) {
        const { id, tipe_transaksi, debit_kredit, id_transaksi, stok_awal_per_gudang, stok_akhir_per_gudang, stok_awal_per_batch, stok_akhir_per_batch, qty, harga_pokok_awal, harga_pokok_akhir, tgl_transaksi, ms_gudang_id, stock_id, gudang_tambahan_id, ms_barang_id } = req.body;

        stock.update({ tipe_transaksi, debit_kredit,  id_transaksi, stok_awal_per_gudang, stok_akhir_per_gudang, stok_awal_per_batch, stok_akhir_per_batch, qty, harga_pokok_awal, harga_pokok_akhir, tgl_transaksi, ms_gudang_id, stock_id, gudang_tambahan_id, ms_barang_id }, { where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static delete(req, res) {
        const { id } = req.body;

        stock.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        try {
            let data = await sq.query(`select hi.id as history_inventory_id,hi.*,mg.*,s.*,mb.*,mg2.nama_gudang as nama_gudang_tambahan , mg2.tipe_gudang as tipe_gudang_tambahan,mg2.is_utama as is_utama_tambahan
            from history_inventory hi 
            join ms_gudang mg on mg.id = hi.ms_gudang_id 
            join stock s on s.id = hi.stock_id 
            join ms_gudang mg2 on mg2.id = hi.gudang_tambahan_id 
            join ms_barang mb on mb.id = hi.ms_barang_id 
            where hi."deletedAt" isnull order by hi."createdAt" desc`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async detailsById(req, res) {
        const { id } = req.params

        try {
            let data = await sq.query(`select hi.id as history_inventory_id,hi.*,mg.*,s.*,mb.*,mg2.nama_gudang as nama_gudang_tambahan , mg2.tipe_gudang as tipe_gudang_tambahan,mg2.is_utama as is_utama_tambahan
            from history_inventory hi 
            join ms_gudang mg on mg.id = hi.ms_gudang_id 
            join stock s on s.id = hi.stock_id 
            join ms_gudang mg2 on mg2.id = hi.gudang_tambahan_id 
            join ms_barang mb on mb.id = hi.ms_barang_id 
            where hi."deletedAt" isnull and hi.id = '${id}'`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async listPerHalaman(req, res) {
        const { kode_batch, nama_barang, nama_gudang, ms_gudang_id, ms_barang_id, tgl_awal, tgl_akhir, halaman, jumlah } = req.body

        try {
            let isi = ''
            let offset = (+halaman - 1) * jumlah;

            if (kode_batch) {
                isi += ` and s.kode_batch = '${kode_batch}' `
            }
            if (nama_barang) {
                isi += ` and mb.nama_barang ilike '%${nama_barang}%' `
            }
            if (nama_gudang) {
                isi += ` and mg.nama_gudang ilike '%${nama_gudang}%' `
            }
            if (ms_gudang_id) {
                isi += ` and hi.ms_gudang_id = '${ms_gudang_id}' `
            }
            if (ms_barang_id) {
                isi += ` and hi.ms_barang_id = '${ms_barang_id}' `
            }
            if (tgl_awal) {
                isi += ` and hi.tgl_transaksi >= '${tgl_awal}' `
            }
            if (tgl_akhir) {
                isi += ` and hi.tgl_transaksi <= '${tgl_akhir}' `
            }

            let data = await sq.query(`select hi.id as "history_inventory_id", * from history_inventory hi 
            join ms_gudang mg on mg.id = hi.ms_gudang_id 
            join ms_barang mb on mb.id = hi.ms_barang_id 
            join stock s on s.id = hi.stock_id 
            where hi."deletedAt" isnull and mg."deletedAt" isnull and mb."deletedAt" isnull and s."deletedAt" isnull ${isi} 
            order by hi."createdAt" desc limit ${jumlah} offset ${offset}`, s)

            let jml = await sq.query(`select count(*) as "total" from history_inventory hi 
            join ms_gudang mg on mg.id = hi.ms_gudang_id 
            join ms_barang mb on mb.id = hi.ms_barang_id 
            join stock s on s.id = hi.stock_id 
            where hi."deletedAt" isnull and mg."deletedAt" isnull and mb."deletedAt" isnull and s."deletedAt" isnull ${isi}`, s)

            res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].total, jumlah, halaman });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }
}

module.exports = Controller