const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const pembayaranTagihan = require('./model')
const s = { type: QueryTypes.SELECT };

class Controller {

    static async register(req, res) {
        const {jumlah_bayar_tagihan, tgl_pembayaran_tagihan, tipe_pembayaran_tagihan, tipe_kartu_tagihan, no_kartu_bank_tagihan, no_transaksi_tagihan, foto_pembayaran_tagihan, kartu_bank_pembayaran_tagihan, no_kwitansi_tagihan, tagihan_id, kas_id} = req.body;
        
        try {
            let data = await pembayaranTagihan.create({id:uuid_v4(),jumlah_bayar_tagihan, tgl_pembayaran_tagihan, tipe_pembayaran_tagihan, tipe_kartu_tagihan, no_kartu_bank_tagihan, no_transaksi_tagihan, foto_pembayaran_tagihan, kartu_bank_pembayaran_tagihan, no_kwitansi_tagihan, tagihan_id, kas_id})

            res.status(200).json({ status: 200, message: "sukses",data:data });
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async update(req, res) {
        const { id, jumlah_bayar_tagihan, tgl_pembayaran_tagihan, tipe_pembayaran_tagihan, tipe_kartu_tagihan, no_kartu_bank_tagihan, no_transaksi_tagihan, foto_pembayaran_tagihan, kartu_bank_pembayaran_tagihan, no_kwitansi_tagihan, tagihan_id, kas_id } = req.body;

        try {
            await pembayaranTagihan.update({jumlah_bayar_tagihan, tgl_pembayaran_tagihan, tipe_pembayaran_tagihan, tipe_kartu_tagihan, no_kartu_bank_tagihan, no_transaksi_tagihan, foto_pembayaran_tagihan, kartu_bank_pembayaran_tagihan, no_kwitansi_tagihan, tagihan_id, kas_id},{where:{id}})
            
            res.status(200).json({ status: 200, message: "sukses" });
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async delete(req, res) {
        const { id } = req.body;

        try {
            await pembayaranTagihan.destroy({where:{id}})
            
            res.status(200).json({ status: 200, message: "sukses"});
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async list(req, res) {
        try {
            let data = await sq.query(`select pt.id as pembayaran_tagihan_id,*,k."name" as nama_kas
            from pembayaran_tagihan pt 
            join tagihan t on t.id = pt.tagihan_id 
            join kas k on k.id = pt.kas_id 
            where pt."deletedAt" isnull order by pt."createdAt" desc`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async listPembayaranTagihanByTagihanId(req, res) {
        const {tagihan_id} = req.body;
        
        try {
            let data = await sq.query(`select pt.id as pembayaran_tagihan_id,*,k."name" as nama_kas
            from pembayaran_tagihan pt 
            join tagihan t on t.id = pt.tagihan_id 
            join kas k on k.id = pt.kas_id 
            where pt."deletedAt" isnull and pt.tagihan_id = '${tagihan_id}' order by pt."createdAt" desc`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
    
    static async listPembayaranTagihanByMsKasId(req, res) {
        const {kas_id} = req.body;
        
        try {
            let data = await sq.query(`select pt.id as pembayaran_tagihan_id,*,k."name" as nama_kas
            from pembayaran_tagihan pt 
            join tagihan t on t.id = pt.tagihan_id 
            join kas k on k.id = pt.kas_id 
            where pt."deletedAt" isnull and pt.kas_id = '${kas_id}' order by pt."createdAt" desc`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async detailsById(req, res) {
        const { id } = req.params

        try {
            let data = await sq.query(`select pt.id as pembayaran_tagihan_id,*,k."name" as nama_kas
            from pembayaran_tagihan pt 
            join tagihan t on t.id = pt.tagihan_id 
            join kas k on k.id = pt.kas_id 
            where pt."deletedAt" isnull and pt.id = '${id}'`,s);
            
            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
}

module.exports = Controller