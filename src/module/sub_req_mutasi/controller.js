const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const subReqMutasi = require("./model");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };


class Controller {

    static register(req, res) {
        const { mutasi_id,ms_barang_id,qty_req } = req.body

        subReqMutasi.findAll({ where: { mutasi_id, ms_barang_id } }).then(data => {
            if (data.length > 0) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                subReqMutasi.create({ id: uuid_v4(), mutasi_id,ms_barang_id,qty_req }).then(data => {
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
        const { id, mutasi_id,ms_barang_id,qty_req } = req.body

        subReqMutasi.update({ mutasi_id,ms_barang_id,qty_req }, { where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static delete(req, res) {
        const { id } = req.body

        subReqMutasi.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
      try {
          let data = await sq.query(`select srm.id as sub_req_mutasi_id,* from sub_req_mutasi srm  join mutasi m on m.id = srm.mutasi_id join ms_barang mb on mb.id = srm.ms_barang_id where srm."deletedAt" isnull`,s);
          
          res.status(200).json({ status: 200, message: "sukses", data });
      } catch (err) {
        console.log(err);
        res.status(500).json({ status: 500, message: "gagal", data: err });
      }
    }

    static async detailsById(req, res) {
        const { id } = req.params

        try {
            let data = await sq.query(`select srm.id as sub_req_mutasi_id,* from sub_req_mutasi srm  join mutasi m on m.id = srm.mutasi_id join ms_barang mb on mb.id = srm.ms_barang_id where srm."deletedAt" isnull and srm.id ='${id}'`,s);
            
            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
          console.log(err);
          res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async getByMutasi(req, res) {
        const { mutasi_id } = req.body

        try {
            let data = await sq.query(`select srm.id as sub_req_mutasi_id,* from sub_req_mutasi srm  join mutasi m on m.id = srm.mutasi_id join ms_barang mb on mb.id = srm.ms_barang_id left join ms_barang mb on s.ms_barang_id=mb.id where srm."deletedAt" isnull and mb."deletedAt" isnull and srm.mutasi_id ='${mutasi_id}'`,s);
            
            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
          console.log(err);
          res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
}
module.exports = Controller;