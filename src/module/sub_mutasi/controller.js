const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const subMutasi = require("./model");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };


class Controller {

    static register(req, res) {
        const { mutasi_id,stock_id,qty_sub } = req.body

        subMutasi.findAll({ where: { mutasi_id, stock_id } }).then(data => {
            if (data.length > 0) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                subMutasi.create({ id: uuid_v4(), mutasi_id, stock_id,qty_sub }).then(data => {
                    res.status(200).json({ status: 200, message: "sukses", data });
                }).catch(err => {
                    console.log(req.body);
                    console.log(err);
                    res.status(500).json({ status: 500, message: "gagal", data: err });
                })
            }
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static update(req, res) {
        const { id, mutasi_id,stock_id,qty_sub } = req.body

        subMutasi.update({ mutasi_id,stock_id,qty_sub }, { where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static delete(req, res) {
        const { id } = req.body

        subMutasi.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
      try {
          let data = await sq.query(`select sm.id as sub_mutasi_id,* from sub_mutasi sm join mutasi m on m.id = sm.mutasi_id join stock s on s.id = sm.stock_id where sm."deletedAt" isnull`,s);
          
          res.status(200).json({ status: 200, message: "sukses", data });
      } catch (err) {
        console.log(err);
        res.status(500).json({ status: 500, message: "gagal", data: err });
      }
    }

    static async detailsById(req, res) {
        const { id } = req.params

        try {
            let data = await sq.query(`select sm.id as sub_mutasi_id,* from sub_mutasi sm join mutasi m on m.id = sm.mutasi_id join stock s on s.id = sm.stock_id where sm."deletedAt" isnull and sm.id ='${id}'`,s);
            
            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
          console.log(err);
          res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async getByMutasi(req, res) {
        const { mutasi_id } = req.body

        try {
            let data = await sq.query(`select sm.id as sub_mutasi_id,* from sub_mutasi sm join mutasi m on m.id = sm.mutasi_id join stock s on s.id = sm.stock_id where sm."deletedAt" isnull and m."deletedAt" isnull and s."deletedAt" isnull and sm.mutasi_id ='${mutasi_id}'`,s);
            
            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
          console.log(err);
          res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
}
module.exports = Controller;