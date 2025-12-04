const pembelian = require('./model')
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };

class Controller {
    static async register(req, res) {
        const { total_qty_satuan_simpan, pembelian_id, ms_barang_id } = req.body;

        try {
            let hasil = await pembelian.create({id: uuid_v4(),total_qty_satuan_simpan, pembelian_id, ms_barang_id})

            res.status(200).json({ status: 200, message: "sukses", data:hasil })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static update(req, res) {
        const { id, total_qty_satuan_simpan, pembelian_id, ms_barang_id } = req.body;

        pembelian.update({ total_qty_satuan_simpan, pembelian_id, ms_barang_id }, { where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static delete(req, res) {
        const { id } = req.body;

        pembelian.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        try {
            let data = await sq.query(`select sp.id as sub_po_id,* from sub_po sp 
            join pembelian p on p.id = sp.pembelian_id 
            join ms_barang mb on mb.id = sp.ms_barang_id 
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
            let data = await sq.query(`select sp.id as sub_po_id,* from sub_po sp 
            join pembelian p on p.id = sp.pembelian_id 
            join ms_barang mb on mb.id = sp.ms_barang_id 
            where sp."deletedAt" isnull and sp.id = '${id}'`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async getByIdPembelian(req,res){
        const {pembelian_id} = req.body;
        console.log(pembelian_id);
        try {
            let data = await sq.query(`select sp.id as sub_po_id,* from sub_po sp 
            left join pembelian p on p.id = sp.pembelian_id 
            left join ms_barang mb on mb.id = sp.ms_barang_id 
            where sp."deletedAt" isnull and sp.pembelian_id = '${pembelian_id}'`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
}

module.exports = Controller