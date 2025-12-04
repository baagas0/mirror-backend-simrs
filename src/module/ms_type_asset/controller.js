const msTypeAsset = require('./model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT }

class Controller {

    static registerValidation() {
        return {
            name: 'required',
            type_fiscal_id: 'required|exist:ms_type_fiscal,id',
            coa_fixassets: 'required',
            coa_akumulasi: 'required',
            coa_bebanpenyusutan: 'required',
        };
    }
    static async register(req, res) {
        
        const { name, type_fiscal_id, coa_fixassets, coa_akumulasi, coa_bebanpenyusutan } = req.body
        msTypeAsset.findAll({ where: { name: { [Op.iLike]: name } }}).then(async hasil1 => {
            if (hasil1.length) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            }
            else {
                await msTypeAsset.create({ id: uuid_v4(), name, type_fiscal_id, coa_fixassets, coa_akumulasi, coa_bebanpenyusutan }).then(hasil2 => {
                    res.status(200).json({ status: 200, message: "sukses", data: hasil2 })
                })
            }
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static updateValidation () {
        return {
            id: "required",
            name: 'required',
            type_fiscal_id: 'required',
            coa_fixassets: 'required',
            coa_akumulasi: 'required',
            coa_bebanpenyusutan: 'required',
        };
    }
    static async update(req, res) {
        const { id, name, coa_fixassets, coa_akumulasi, coa_bebanpenyusutan } = req.body
        msTypeAsset.update({ name, coa_fixassets, coa_akumulasi, coa_bebanpenyusutan }, { where: { id } }).then(hasil => {
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
                    b.id                    as type_fiscal_id,
                    b.name                  as type_fiscal_name,
                    b.masa_manfaat          as type_fiscal_masa_manfaat,
                    b.tarif_penyusutan      as type_fiscal_tarif_penyusutan,
                    b.status                as type_fiscal_status,
                    b.metode_penyusutan_id  as type_fiscal_metode_penyusutan_id
                from ms_type_asset a 
                left join ms_type_fiscal b on b.id = a.type_fiscal_id  and b."deletedAt" isnull
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
                    b.id                    as type_fiscal_id,
                    b.name                  as type_fiscal_name,
                    b.masa_manfaat          as type_fiscal_masa_manfaat,
                    b.tarif_penyusutan      as type_fiscal_tarif_penyusutan,
                    b.status                as type_fiscal_status,
                    b.metode_penyusutan_id  as type_fiscal_metode_penyusutan_id
                from ms_type_asset a 
                left join ms_type_fiscal b on b.id = a.type_fiscal_id  and b."deletedAt" isnull
                where a."deletedAt" isnull and a.id = '${id}'`
            , s)
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static delete(req, res) {
        const { id } = req.body
        msTypeAsset.destroy({ where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

}

module.exports = Controller