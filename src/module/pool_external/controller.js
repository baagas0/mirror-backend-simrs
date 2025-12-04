const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const poolExternal = require('./model')
const poolRegistrasi = require('../pool_registrasi/model')

const s = { type: QueryTypes.SELECT };

class Controller {

    static async register(req, res) {
        const {penjualan_id,tagihan_id} = req.body;
        
        try {
            let cekPoolRegistrasi = await poolRegistrasi.findAll({where:{tagihan_id}})

            if(cekPoolRegistrasi.length>0){
                res.status(201).json({ status: 204, message: "tagihan ada di pool registrasi" });
            }else{
                const [user, created] = await poolExternal.findOrCreate({where: { penjualan_id,tagihan_id },defaults: {id:uuid_v4(),penjualan_id,tagihan_id}});

                if(!created){
                    res.status(201).json({ status: 204, message: "data sudah ada" });
                }else{
                    res.status(200).json({ status: 200, message: "sukses",data:user });
                }
            }
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async update(req, res) {
        const { id, penjualan_id,tagihan_id } = req.body;

        try {
            let data = await poolExternal.update({penjualan_id,tagihan_id},{where:{id}})

            res.status(200).json({ status: 200, message: "sukses"});
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async delete(req, res) {
        const { id } = req.body;

        try {
            let data = await poolExternal.destroy({where:{id}})

            res.status(200).json({ status: 200, message: "sukses"});
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async list(req, res) {
        try {
            let data = await sq.query(`select pe.id as pool_external_id,pe.*,p.tgl_penjualan,p.jenis_rawat,p."NIK",
            p.nama,p.kode_penjualan,t.tgl_tagihan,t.kode_tagihan 
            from pool_external pe 
            join penjualan p on p.id = pe.penjualan_id 
            join tagihan t on t.id = pe.tagihan_id
            where pe."deletedAt" isnull order by pe."createdAt" desc`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async listPoolExternalByPenjualanId(req, res) {
        const {penjualan_id} = req.body;
        try {
            let data = await sq.query(`select pe.id as pool_external_id,pe.*,p.tgl_penjualan,p.jenis_rawat,p."NIK",
            p.nama,p.kode_penjualan,t.tgl_tagihan,t.kode_tagihan,pe2.*,p2.no_rm
            from pool_external pe 
            join penjualan p on p.id = pe.penjualan_id
            join penjualan_external pe2 on pe2.id = p.penjualan_external_id
            left join pasien p2 on p2.id = pe2.pasien_id
            join tagihan t on t.id = pe.tagihan_id
            where pe."deletedAt" isnull and pe.penjualan_id = '${penjualan_id}' order by pe."createdAt" desc`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
    
    static async listPoolExternalByTagihanId(req, res) {
        const {tagihan_id} = req.body;
        try {
            let data = await sq.query(`select pe.id as pool_external_id,pe.*,p.tgl_penjualan,p.jenis_rawat,p."NIK",
            p.nama,p.kode_penjualan,t.tgl_tagihan,t.kode_tagihan,pe2.*,p2.no_rm
            from pool_external pe 
            join penjualan p on p.id = pe.penjualan_id
            join penjualan_external pe2 on pe2.id = p.penjualan_external_id
            left join pasien p2 on p2.id = pe2.pasien_id
            join tagihan t on t.id = pe.tagihan_id
            where pe."deletedAt" isnull and pe.tagihan_id = '${tagihan_id}' order by pe."createdAt" desc`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async detailsById(req, res) {
        const { id } = req.params

        try {
            let data = await sq.query(`select pe.id as pool_external_id,pe.*,p.tgl_penjualan,p.jenis_rawat,p."NIK",
            p.nama,p.kode_penjualan,t.tgl_tagihan,t.kode_tagihan 
            from pool_external pe 
            join penjualan p on p.id = pe.penjualan_id 
            join tagihan t on t.id = pe.tagihan_id
            where pe."deletedAt" isnull and pe.id = '${id}'`,s);
            
            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
}

module.exports = Controller