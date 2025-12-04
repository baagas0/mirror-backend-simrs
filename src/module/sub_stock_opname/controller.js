const subStockOpname = require('./model')
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };

class Controller {
    static async register(req, res) {
        const { qty_stock_opname, stock_id, stock_opname_id } = req.body;

        try {
            let hasil = await subStockOpname.create({id: uuid_v4(),qty_stock_opname, stock_id, stock_opname_id})

            res.status(200).json({ status: 200, message: "sukses", data:hasil })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static update(req, res) {
        const { id, qty_stock_opname, stock_id, stock_opname_id } = req.body;

        subStockOpname.update({ qty_stock_opname, stock_id, stock_opname_id }, { where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static delete(req, res) {
        const { id } = req.body;

        subStockOpname.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        try {
            let data = await sq.query(`select sso.id as sub_stock_opname_id,sso.*,so.*,s.kode_batch,s.ms_barang_id,mb.nama_barang,mb.kode_produk  from sub_stock_opname sso join stock_opname so on so.id = sso.stock_opname_id join stock s on s.id = sso.stock_id join ms_barang mb on mb.id = s.ms_barang_id join ms_gudang mg on mg.id = so.ms_gudang_id where sso."deletedAt" isnull order by sso."createdAt" desc`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async listSubStockOpnameByStockOpnameId(req, res) {
        const {stock_opname_id} = req.body;
        try {
            let data = await sq.query(`select sso.id as sub_stock_opname_id,sso.*,so.*,s.kode_batch,s.ms_barang_id,mb.nama_barang,mb.kode_produk  from sub_stock_opname sso join stock_opname so on so.id = sso.stock_opname_id join stock s on s.id = sso.stock_id join ms_barang mb on mb.id = s.ms_barang_id join ms_gudang mg on mg.id = so.ms_gudang_id where sso."deletedAt" isnull and sso.stock_opname_id = '${stock_opname_id}' order by sso."createdAt" desc`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async detailsById(req, res) {
        const { id } = req.params

        try {
            let data = await sq.query(`select sso.id as sub_stock_opname_id,sso.*,so.*,s.kode_batch,s.ms_barang_id,mb.nama_barang,mb.kode_produk  from sub_stock_opname sso join stock_opname so on so.id = sso.stock_opname_id join stock s on s.id = sso.stock_id join ms_barang mb on mb.id = s.ms_barang_id join ms_gudang mg on mg.id = so.ms_gudang_id where sso."deletedAt" isnull and sso.id = '${id}'`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
}

module.exports = Controller