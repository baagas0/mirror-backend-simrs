const pembayaranPembelian = require('./model')
const pembelian = require('../pembelian/model')
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };
const ExcelJS = require("exceljs");
const moment = require('moment');

class Controller {
    static async register(req, res) {
        const { tanggal_pembayaran, jumlah_bayar, tipe_bayar, tipe_kartu, no_kartu, no_transaksi, kas_id, pembelian_id } = req.body;

        const t = await sq.transaction()
        try {
            let cek_pembelian = await sq.query(`select * from pembelian p where p."deletedAt" isnull and p.id = '${pembelian_id}'`, s)
            
            if (jumlah_bayar > cek_pembelian[0].sisa_pembayaran) {
                res.status(201).json({ status: 204, message: "jumlah pembayaran tidak boleh melebihi sisa pembayaran" });
            } else {
                let data_pembayaran = await pembayaranPembelian.create({ id: uuid_v4(), tanggal_pembayaran, jumlah_bayar, tipe_bayar, tipe_kartu, no_kartu, no_transaksi, kas_id, pembelian_id }, { transaction: t })
                await pembelian.update({ sisa_pembayaran: cek_pembelian[0].sisa_pembayaran - jumlah_bayar }, { where: { id: pembelian_id } }, { transaction: t })
                
                await t.commit()
                res.status(200).json({ status: 200, message: "sukses", data: data_pembayaran })
            }
        } catch (err) {
            await t.rollback()
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static update(req, res) {
        const { id, tanggal_pembayaran, jumlah_bayar, tipe_bayar, tipe_kartu, no_kartu, no_transaksi, kas_id, pembelian_id } = req.body;

        pembayaranPembelian.update({ tanggal_pembayaran, jumlah_bayar, tipe_bayar, tipe_kartu, no_kartu, no_transaksi, kas_id, pembelian_id }, { where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async delete(req, res) {
        const { id } = req.body;

        // CARI PEMBELIAN
        let cek_pembayaran_pembelian = await sq.query(`select * from pembayaran_pembelian p where p."deletedAt" isnull and p.id = '${id}'`, s)
        let cek_pembelian = await sq.query(`select * from pembelian p where p."deletedAt" isnull and p.id = '${cek_pembayaran_pembelian[0].pembelian_id}'`, s)
        const sisa_pembayaran = cek_pembelian[0].sisa_pembayaran + cek_pembayaran_pembelian[0].jumlah_bayar;
        console.log(`SISA ${cek_pembelian[0].sisa_pembayaran} + ${cek_pembayaran_pembelian[0].jumlah_bayar} = ${sisa_pembayaran}`)
        // const t = await sq.transaction()
        pembayaranPembelian.destroy({ where: { id } }).then(async data => {
            // BALIKIN SISA PEMBAYARAN
            await pembelian.update({ sisa_pembayaran: sisa_pembayaran }, { where: { id: cek_pembayaran_pembelian[0].pembelian_id } });

            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(async err => {
            // await t.rollback()
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        try {
            let data = await sq.query(`select pp.id as "pembayaran_pembelian_id", * 
            from pembayaran_pembelian pp 
            join pembelian p on p.id = pp.pembelian_id 
            join kas k on k.id = pp.kas_id 
            where pp."deletedAt" isnull and p."deletedAt" isnull and k."deletedAt" isnull 
            order by pp."createdAt" desc `, s)

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
            let data = await sq.query(`select pp.id as "pembayaran_pembelian_id", * 
            from pembayaran_pembelian pp 
            join pembelian p on p.id = pp.pembelian_id 
            join kas k on k.id = pp.kas_id 
            where pp."deletedAt" isnull and p."deletedAt" isnull and k."deletedAt" isnull and pp.id = '${id}'`, s)

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async listPembayaranByPembelianId(req, res) {
        const { pembelian_id } = req.body

        try {
            let total_pembelian = 0
            let data = await sq.query(`select pp.id as "pembayaran_pembelian_id", * 
            from pembayaran_pembelian pp 
            join pembelian p on p.id = pp.pembelian_id 
            join ms_supplier ms on ms.id = p.ms_suplier_id 
            join kas k on k.id = pp.kas_id 
            where pp."deletedAt" isnull and p."deletedAt" isnull and k."deletedAt" isnull and pp.pembelian_id = '${pembelian_id}' 
            order by pp."createdAt" desc`, s)

            if (data.length == 0) {
                let data2 = await sq.query(`select p.id as "pembelian_id", * from pembelian p where p."deletedAt" isnull and p.id = '${pembelian_id}'`, s)
                total_pembelian = data2[0].total_pembelian
            } else {
                total_pembelian = data[0].total_pembelian
            }

            res.status(200).json({ status: 200, message: "sukses", data, total_pembelian });
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

}

module.exports = Controller