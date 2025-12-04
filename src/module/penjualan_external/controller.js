const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const penjualanExternal = require('./model')
const s = { type: QueryTypes.SELECT };

class Controller {

    static async register(req, res) {
        const {nama_penjualan_external, alamat_penjualan_external, keterangan_penjualan_external, pasien_id} = req.body;
        
        try {
            let data = await penjualanExternal.create({id:uuid_v4(),nama_penjualan_external, alamat_penjualan_external, keterangan_penjualan_external, pasien_id});     
                
            res.status(200).json({ status: 200, message: "sukses", data:data })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static update(req, res) {
        const { id, nama_penjualan_external, alamat_penjualan_external, keterangan_penjualan_external, pasien_id } = req.body;

        penjualanExternal.update({ nama_penjualan_external, alamat_penjualan_external, keterangan_penjualan_external, pasien_id }, { where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static delete(req, res) {
        const { id } = req.body;

        penjualanExternal.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        try {
            let data = await sq.query(`select pe.id as penjualan_external_id, pe.*,p.* 
            from penjualan_external pe
            left join pasien p on p.id = pe.pasien_id  
            where pe."deletedAt" isnull order by pe."createdAt" desc`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async detailsById(req, res) {
        const { id } = req.params

        try {
            let data = await sq.query(`select pe.id as penjualan_external_id, pe.*,p.* 
            from penjualan_external pe
            left join pasien p on p.id = pe.pasien_id  
            where pe."deletedAt" isnull and pe.id = '${id}'`,s);
            
            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
}

module.exports = Controller