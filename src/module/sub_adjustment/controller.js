const subAdjustment = require('./model')
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };

class Controller {
    static async register(req, res) {
        const { qty_stock_adjustment, adjustment_id, stock_id } = req.body;

        try {
            let data_adjustment = await subAdjustment.create({ id: uuid_v4(), qty_stock_adjustment, adjustment_id, stock_id })
            res.status(200).json({ status: 200, message: "sukses", data: data_adjustment })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static update(req, res) {
        const { id, qty_stock_adjustment, adjustment_id, stock_id } = req.body;

        subAdjustment.update({ qty_stock_adjustment, adjustment_id, stock_id }, { where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static delete(req, res) {
        const { id } = req.body;

        subAdjustment.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        try {
            let data = await sq.query(`select sa.id as "sub_adjustment_id", * from sub_adjustment sa 
            join adjustment a on a.id = sa.adjustment_id 
            join stock s on s.id = sa.stock_id 
            where sa."deletedAt" isnull and a."deletedAt" isnull and s."deletedAt" isnull 
            order by sa."createdAt" desc`, s)

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
            let data = await sq.query(`select sa.id as "sub_adjustment_id", * from sub_adjustment sa 
            join adjustment a on a.id = sa.adjustment_id 
            join stock s on s.id = sa.stock_id 
            where sa."deletedAt" isnull and a."deletedAt" isnull and s."deletedAt" isnull and sa.id = '${id}'`, s)

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async listSubAdjustmentByAdjustmentId(req, res) {
        const { adjustment_id } = req.body

        try {
            let data = await sq.query(`select sa.id as "sub_adjustment_id", * 
            from sub_adjustment sa 
            join stock s on s.id = sa.stock_id 
            join ms_barang mb on mb.id = s.ms_barang_id 
            join ms_gudang mg on mg.id = s.ms_gudang_id 
            where sa."deletedAt" isnull and sa.adjustment_id = '${adjustment_id}' 
            order by sa."createdAt" desc `, s)

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
}

module.exports = Controller