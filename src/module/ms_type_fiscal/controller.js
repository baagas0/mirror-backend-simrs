const msTypeFiscal = require('./model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT }

class Controller {
    static registerValidation(req, res) {
        return {
            name: 'required',
            masa_manfaat: 'required|numeric',
            tarif_penyusutan: 'required|numeric',
            metode_penyusutan_id: 'required|exist:ms_depreciation_method,id',
            // status: 'in:0,1',
        };
    }
    static async register(req, res) {
        const { name, masa_manfaat, tarif_penyusutan, metode_penyusutan_id, status } = req.body
        const bulan = masa_manfaat * 12;

        msTypeFiscal.findAll({ where: { name: { [Op.iLike]: name } }}).then(async hasil1 => {
            if (hasil1.length) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
                return;
            }
            else {
                await msTypeFiscal.create({ id: uuid_v4(), name, masa_manfaat, bulan, tarif_penyusutan, metode_penyusutan_id, status }).then(hasil2 => {
                    res.status(200).json({ status: 200, message: "sukses", data: hasil2 })
                })
            }
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static updateValidation(req, res) {
        return {
            id: "required",
            name: 'required',
            masa_manfaat: 'required|numeric',
            tarif_penyusutan: 'required|numeric',
            metode_penyusutan_id: 'required',
            // status: 'in:0,1',
        };
    }
    static async update(req, res) {
        const { id, name, masa_manfaat, tarif_penyusutan, metode_penyusutan_id, status } = req.body
        const bulan = masa_manfaat * 12;

        msTypeFiscal.update({ name, masa_manfaat, bulan, tarif_penyusutan, metode_penyusutan_id, status }, { where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async list(req, res) {

        try {
            let data = await sq.query(`
                select 
                    a.*,
                    b.id as metode_penyusutan_id,
                    b.code as metode_penyusutan_code,
                    b.name as metode_penyusutan_name,
                    b.remark as metode_penyusutan_remark,
                    b.status as metode_penyusutan_status
                from ms_type_fiscal a
                left join ms_depreciation_method b on b.id = a.metode_penyusutan_id and b."deletedAt" isnull
                where a."deletedAt" isnull`
            , s)
            
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static async detailsById(req, res) {
        const { id } = req.params
        try {
            let data = await sq.query(`
                select 
                    a.*,
                    b.id as metode_penyusutan_id,
                    b.code as metode_penyusutan_code,
                    b.name as metode_penyusutan_name,
                    b.remark as metode_penyusutan_remark,
                    b.status as metode_penyusutan_status
                from ms_type_fiscal a
                left join ms_depreciation_method b on b.id = a.metode_penyusutan_id and b."deletedAt" isnull
                where a."deletedAt" isnull and a.id = '${id}'`
            , s)

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static delete(req, res) {
        const { id } = req.body
        msTypeFiscal.destroy({ where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

}

module.exports = Controller