const subPembelian = require('./model')
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };

class Controller {
    static async register(req, res) {
        const { kode_batch, qty_satuan_simpan, qty_beli, harga_per_satuan_simpan, harga_beli, total_harga_beli, tgl_kadaluarsa,total_qty_satuan_simpan, ms_pembelian_id, ms_barang_id, ms_satuan_beli_id } = req.body;

        try {
            let hasil = await subPembelian.create({id: uuid_v4(),kode_batch, qty_satuan_simpan, qty_beli, harga_per_satuan_simpan, harga_beli, total_harga_beli, tgl_kadaluarsa,total_qty_satuan_simpan, ms_pembelian_id, ms_barang_id, ms_satuan_beli_id})

            res.status(200).json({ status: 200, message: "sukses", data:hasil })

        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static update(req, res) {
        const { id, kode_batch, qty_satuan_simpan, qty_beli, harga_per_satuan_simpan, harga_beli, total_harga_beli, tgl_kadaluarsa,total_qty_satuan_simpan, ms_pembelian_id, ms_barang_id, ms_satuan_beli_id } = req.body;

        subPembelian.update({ kode_batch, qty_satuan_simpan, qty_beli, harga_per_satuan_simpan, harga_beli, total_harga_beli, tgl_kadaluarsa,total_qty_satuan_simpan, ms_pembelian_id, ms_barang_id, ms_satuan_beli_id }, { where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static delete(req, res) {
        const { id } = req.body;

        subPembelian.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        try {
            let data = await sq.query(`select sp.id as sub_pembelian_id,* 
            from  sub_pembelian sp
            join pembelian p on p.id = sp.ms_pembelian_id 
            join ms_barang mb on mb.id = sp.ms_barang_id 
            join ms_satuan_barang msb on msb.id = sp.ms_satuan_beli_id 
            where sp."deletedAt" isnull order by sp."createdAt" desc`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async detailsById(req, res) {
        const { id } = req.params

        try {
            let data = await sq.query(`select sp.id as sub_pembelian_id,* 
            from  sub_pembelian sp
            join pembelian p on p.id = sp.ms_pembelian_id 
            join ms_barang mb on mb.id = sp.ms_barang_id 
            join ms_satuan_barang msb on msb.id = sp.ms_satuan_beli_id 
            where sp."deletedAt" isnull and sp.id = '${id}'`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
    static async getByIdPembelian(req,res){
        const {ms_pembelian_id} = req.body;
        console.log(ms_pembelian_id);
        try {
            let data = await sq.query(`select sp.id as sub_pembelian_id,* from sub_pembelian sp 
            left join pembelian p on p.id = sp.ms_pembelian_id 
            left join ms_barang mb on mb.id = sp.ms_barang_id
            left join ms_satuan_barang msb on msb.id = sp.ms_satuan_beli_id 
            where sp."deletedAt" isnull and sp.ms_pembelian_id = '${ms_pembelian_id}'`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
}

module.exports = Controller