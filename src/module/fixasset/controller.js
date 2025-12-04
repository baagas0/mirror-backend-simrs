const fixAsset = require('./model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT }
const {valid} = require("../../helper/validation");

class Controller {
    static async registerValidation(req, res) {
        return {
            idgl: "required",
            name: "required",
            code: "required",
            nofaktur: "required",
            tgl_pembelian: "required|date",
            tgl_pemakaian: "required|date",
            tgl_akhirpenyusutan: "nullable",
            perkiraan_umur_thn: "required|integer",
            perkiraan_umur_bln: "required|integer",

            nilai_asset: "required|numeric",
            nilai_penyusutan: "nullable|numeric",
            nilai_sisaditaksir: "nullable|numeric",
            total_penyusutan: "nullable|numeric",
            total_cicilan: "nullable|numeric",
            
            sisa_pemby: "nullable|numeric",
            is_asetberwujud: "boolean",
            is_perhitungansusut: "boolean",
            status: "numeric",
            gudang_id: "nullable",
            produsen_id: "nullable",
            supplier_id: "nullable",
            type_asset_id: "required",
            coa_fixassets: "required",
            coa_akumulasi: "required",
            coa_bebanpenyusutan: "required",
            type_fiscal_id: "nullable",
            masa_manfaat: "required|numeric",
            tarif_penyusutan: "required|numeric",
            metode_penyusutan_id: "nullable",
            tingkatasset_id: "required",
            remark: "required",
        };
    }
    static async register(req, res) {
        try {
            const { idgl, name, code, nofaktur, tgl_pembelian, tgl_pemakaian, tgl_akhirpenyusutan, perkiraan_umur_thn, perkiraan_umur_bln, nilai_asset, is_asetberwujud, is_perhitungansusut, status, gudang_id, produsen_id, supplier_id, type_asset_id, coa_fixassets, coa_akumulasi, coa_bebanpenyusutan, type_fiscal_id, masa_manfaat, tarif_penyusutan, metode_penyusutan_id, tingkatasset_id, remark, } = req.body
            console.log('tesssss')
            const nilai_sisaditaksir = nilai_asset;
            let nilai_penyusutan = 0;
            let total_penyusutan = 0;
            let total_cicilan = 0;
            let sisa_pemby = 0;

            let type_fiscal = await sq.query(`select a.bulan from ms_type_fiscal a where a.id = '${type_fiscal_id}'`, s);

            if(type_fiscal[0]) {
                nilai_penyusutan = Math.ceil(nilai_asset / type_fiscal[0]['bulan']);
            } else {
                throw "ms_type_fiscal not available!";
            }

            fixAsset.findAll({ where: { name: { [Op.iLike]: name } }}).then(async hasil1 => {
                if (hasil1.length) {
                    res.status(201).json({ status: 204, message: "data sudah ada" });
                }
                else {
                    await fixAsset.create({ id: uuid_v4(), idgl, name, code, nofaktur, tgl_pembelian, tgl_pemakaian, tgl_akhirpenyusutan, perkiraan_umur_thn, perkiraan_umur_bln, nilai_sisaditaksir, nilai_asset, nilai_penyusutan, total_penyusutan, total_cicilan, sisa_pemby, is_asetberwujud, is_perhitungansusut, status, gudang_id, produsen_id, supplier_id, type_asset_id, coa_fixassets, coa_akumulasi, coa_bebanpenyusutan, type_fiscal_id, masa_manfaat, tarif_penyusutan, metode_penyusutan_id, tingkatasset_id, remark, }).then(hasil2 => {
                        res.status(200).json({ status: 200, message: "sukses", data: hasil2 })
                    })
                }
            }).catch(error => {
                console.log(error);
                res.status(500).json({ status: 500, message: "gagal", data: error })
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: error })
        }
        
    }
    static updateValidation() {
        return {
            id: "required",
            idgl: "required",
            name: "required",
            code: "required",
            nofaktur: "required",
            tgl_pembelian: "required|date",
            tgl_pemakaian: "required|date",
            tgl_akhirpenyusutan: "nullable",
            perkiraan_umur_thn: "required|integer",
            perkiraan_umur_bln: "required|integer",

            nilai_asset: "required|numeric",
            nilai_penyusutan: "nullable|numeric",
            nilai_sisaditaksir: "nullable|numeric",
            total_penyusutan: "nullable|numeric",
            total_cicilan: "nullable|numeric",
            
            sisa_pemby: "nullable|numeric",
            is_asetberwujud: "boolean",
            is_perhitungansusut: "boolean",
            status: "numeric",
            gudang_id: "nullable",
            produsen_id: "nullable",
            supplier_id: "nullable",
            type_asset_id: "required",
            // coa_fixassets: "required",
            coa_akumulasi: "required",
            coa_bebanpenyusutan: "required",
            type_fiscal_id: "nullable",
            masa_manfaat: "required|numeric",
            tarif_penyusutan: "required|numeric",
            metode_penyusutan_id: "nullable",
            tingkatasset_id: "required",
            remark: "required",
        };
    }
    static async update(req, res) {
        try {
            console.log('here 0')
            const { nilai_asset, id, idgl, name, code, nofaktur, tgl_pembelian, tgl_pemakaian, tgl_akhirpenyusutan, perkiraan_umur_thn, perkiraan_umur_bln, total_penyusutan, total_cicilan, sisa_pemby, is_asetberwujud, is_perhitungansusut, status, gudang_id, produsen_id, supplier_id, type_asset_id, coa_fixassets, coa_akumulasi, coa_bebanpenyusutan, type_fiscal_id, masa_manfaat, tarif_penyusutan, metode_penyusutan_id, tingkatasset_id, remark, } = req.body
        
            const nilai_sisaditaksir = nilai_asset;
            let nilai_penyusutan = 0;

            let type_fiscal = await sq.query(`select a.bulan from ms_type_fiscal a where a.id = '${type_fiscal_id}'`, s);

            if(type_fiscal[0]) {
                nilai_penyusutan = Math.ceil(nilai_asset / type_fiscal[0]['bulan']);
            } else {
                throw "ms_type_fiscal not available!";
            }
            console.log('here 1')
            fixAsset.update({ idgl, name, code, nofaktur, tgl_pembelian, tgl_pemakaian, tgl_akhirpenyusutan, perkiraan_umur_thn, perkiraan_umur_bln, nilai_sisaditaksir, nilai_asset, nilai_penyusutan, total_penyusutan, total_cicilan, sisa_pemby, is_asetberwujud, is_perhitungansusut, status, gudang_id, produsen_id, supplier_id, type_asset_id, coa_fixassets, coa_akumulasi, coa_bebanpenyusutan, type_fiscal_id, masa_manfaat, tarif_penyusutan, metode_penyusutan_id, tingkatasset_id, remark, }, { where: { id } }).then(hasil => {
                res.status(200).json({ status: 200, message: "sukses" })
            }).catch(error => {
                console.log(error);
                res.status(500).json({ status: 500, message: "gagal", data: error })
            })
            
        } catch (error) {
            console.log(error)
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
        
        
    }

    static async list(req, res) {

        try {
            let data = await sq.query(`
            select * 
            from fixasset mb 
            where mb."deletedAt" isnull`, s)
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
            let data = await sq.query(`select * from fixasset mb where mb."deletedAt" isnull and mb.id = '${id}'`, s)
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static delete(req, res) {
        const { id } = req.body
        fixAsset.destroy({ where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

}

module.exports = Controller