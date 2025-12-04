const msDepreciationMethod = require('./model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT }
const {valid} = require("../../helper/validation");

class Controller {
    static registerValidation() {
        return {
            name: 'required',
            code: 'required|uniq:ms_depreciation_method,code',
            remark: 'nullable',
            status: 'min:0|max:10',
        };
    }
    static async register(req, res) {

        const { name, code, remark, status } = req.body
        msDepreciationMethod.findAll({ where: { code: { [Op.iLike]: code } }}).then(async hasil1 => {
            if (hasil1.length) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            }
            else {
                await msDepreciationMethod.create({ id: uuid_v4(), name, code, remark, status }).then(hasil2 => {
                    res.status(200).json({ status: 200, message: "sukses", data: hasil2 })
                })
            }
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static updateValidation(req, res) {
        console.log(req)
        return {
            id: "required",
            name: 'required',
            code: `required|uniq:ms_depreciation_method,code,id,${req.body.id}`,
            remark: 'nullable',
            status: 'min:0|max:10',
        };
    }
    static async update(req, res) {

        const { id, name, code, remark, status } = req.body
        msDepreciationMethod.update({ name, code, remark, status }, { where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async list(req, res) {

        try {
            let data = await sq.query(`select * from ms_depreciation_method mb where mb."deletedAt" isnull`, s)
            // console.log(data);
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static async detailsById(req, res) {
        const { id } = req.params
        try {
            let data = await sq.query(`select * from ms_depreciation_method mb where mb."deletedAt" isnull and mb.id = '${id}'`, s)
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static delete(req, res) {
        const { id } = req.body
        msDepreciationMethod.destroy({ where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log("error");
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

}

module.exports = Controller