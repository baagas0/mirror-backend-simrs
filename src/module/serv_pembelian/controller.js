const servPembelian = require('./model')
const subServPembelian = require('../sub_serv_pembelian/model')
const pembelian = require('../pembelian/model')
const pembayaranPembelian = require('../pembayaran_pembelian/model')
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };
const ExcelJS = require("exceljs");
const excelToJson = require('convert-excel-to-json');
const moment = require('moment');
const fs = require('fs');

class Controller {
    static async registerPembayaranExcel(req, res) {
        const { tanggal_serv_pembelian, tipe_pembayaran, kas_id, keterangan } = req.body;

        const t = await sq.transaction()
        try {
            let file_name = ''
            if (req.files) {
                if (req.files.file1) {
                    file_name = req.files.file1[0].filename
                }
            }
            const path_excel = `./asset/file/${file_name}`
            const result = excelToJson({
                sourceFile: path_excel,
            });
            fs.unlink(path_excel, (err) => { if (err) console.log("error"); });
            
            let faktur = result.Sheet1
            let nf = ''
            for (let i = 0; i < faktur.length; i++) {
                nf += `'${faktur[i].A}'` + ','
            }
            let no_faktur = nf.slice(0, -1)
            let cek_pembelian = await sq.query(`select p.id as "pembelian_id", p.no_faktur ,ms.nama_supplier ,mg.nama_gudang ,p.total_pembelian ,p.sisa_pembayaran 
            from pembelian p 
            join ms_gudang mg on mg.id = p.ms_gudang_id 
            join ms_supplier ms on ms.id = p.ms_suplier_id 
            where p."deletedAt" isnull and p.status_pembelian = 3 and p.sisa_pembayaran <> 0 and p.no_faktur in (${no_faktur})`, s)
            
            let bulk_sub = []
            let bulk_pembelian = []
            let bulk_pembayaran = []
            let id_serv = uuid_v4()

            let jumlah = 0
            let jumlah_terproses = 0

            for (let j = 0; j < cek_pembelian.length; j++) {
                jumlah += cek_pembelian[j].total_pembelian
                jumlah_terproses += cek_pembelian[j].sisa_pembayaran
                cek_pembelian[j].keterangan = keterangan

                let obj_sub = {
                    id: uuid_v4(),
                    serv_pembelian_id: id_serv,
                    pembelian_id: cek_pembelian[j].pembelian_id,
                    status_sub_serv_pembelian: 1
                }
                bulk_sub.push(obj_sub)

                let obj_pembelian = {
                    id: cek_pembelian[j].pembelian_id,
                    sisa_pembayaran: 0
                }
                bulk_pembelian.push(obj_pembelian)

                let obj_pembayaran = {
                    id: uuid_v4(),
                    pembelian_id: cek_pembelian[j].pembelian_id,
                    kas_id: kas_id,
                    tanggal_pembayaran: tanggal_serv_pembelian,
                    jumlah_bayar: cek_pembelian[j].sisa_pembayaran,
                    tipe_bayar: tipe_pembayaran 
                }
                bulk_pembayaran.push(obj_pembayaran)
            }
            let data_serv = await servPembelian.create({id: id_serv, kas_id, tanggal_serv_pembelian, tipe_pembayaran, keterangan, file_name, status_serv_pembelian: 1, is_processed: 2, jumlah, jumlah_terproses})
            
            await subServPembelian.bulkCreate(bulk_sub, {transaction: t})
            await pembayaranPembelian.bulkCreate(bulk_pembayaran, {transaction: t})
            await pembelian.bulkCreate(bulk_pembelian, {updateOnDuplicate: ["sisa_pembayaran"], transaction: t})

            let hasil = []
            hasil.push({
                data_pembelian: cek_pembelian, 
                data_pembayaran: data_serv
            })
            await t.commit()

            res.status(200).json({ status: 200, message: "sukses", data: hasil });
        } catch (err) {
            await t.rollback()
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async list(req, res) {
        const { kode_serv_pembelian, tipe_pembayaran, kas_id } = req.body;

        try {
            let isi = ''
            if (kode_serv_pembelian) {
                isi += ` and sp.kode_serv_pembelian = ${kode_serv_pembelian} `
            }
            if (tipe_pembayaran) {
                isi += ` and sp.tipe_pembayaran = '${tipe_pembayaran}' `
            }
            if (kas_id) {
                isi += ` and sp.kas_id = '${kas_id}' `
            }

            let data = await sq.query(`select sp.id as "serv_pembelian_id", * from serv_pembelian sp 
            join kas k on k.id = sp.kas_id 
            where sp."deletedAt" isnull and k."deletedAt" isnull ${isi} 
            order by sp."createdAt" desc `, s)

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listPerHalaman(req, res) {
        const { halaman, jumlah, kode_serv_pembelian, tipe_pembayaran, kas_id } = req.body;

        try {
            let isi = ''
            let offset = (+halaman - 1) * jumlah;
            if (kode_serv_pembelian) {
                isi += ` and sp.kode_serv_pembelian = ${kode_serv_pembelian} `
            }
            if (tipe_pembayaran) {
                isi += ` and sp.tipe_pembayaran = '${tipe_pembayaran}' `
            }
            if (kas_id) {
                isi += ` and sp.kas_id = '${kas_id}' `
            }

            let data = await sq.query(`select sp.id as "serv_pembelian_id", * from serv_pembelian sp 
            join kas k on k.id = sp.kas_id 
            where sp."deletedAt" isnull and k."deletedAt" isnull ${isi} 
            order by sp."createdAt" desc 
            limit ${jumlah} offset ${offset}`, s)

            let jml = await sq.query(`select count(*) as "total" from serv_pembelian sp 
            join kas k on k.id = sp.kas_id 
            where sp."deletedAt" isnull and k."deletedAt" isnull ${isi}`, s)

            res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].total, jumlah, halaman })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listPembelianByKodeServPembelian(req, res) {
        const { kode_serv_pembelian } = req.body;

        try {
            let data = await sq.query(`select ssp.id as "sub_serv_pembelian_id", * 
            from sub_serv_pembelian ssp 
            join pembelian p on p.id = ssp.pembelian_id 
            join ms_gudang mg on mg.id = p.ms_gudang_id 
            join ms_supplier ms on ms.id = p.ms_suplier_id 
            join serv_pembelian sp on sp.id = ssp.serv_pembelian_id 
            join kas k on k.id = sp.kas_id 
            where ssp."deletedAt" isnull and p."deletedAt" isnull and sp."deletedAt" isnull and sp.kode_serv_pembelian = ${kode_serv_pembelian} `, s)

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }
    
}

module.exports = Controller