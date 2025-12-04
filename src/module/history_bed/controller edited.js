const historyBed = require('./model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');
const msHargaFasilitas = require('../ms_harga_fasilitas/model');


const s = { type: QueryTypes.SELECT }


class Controller {

    static register(req, res) {
        const { tgl_mulai, tgl_selesai, status_checkout, status_monitoring, keterangan_history_bed, registrasi_id, ms_bed_id } = req.body
        tgl_mulai = tgl_mulai ? tgl_mulai : new Date();

        historyBed.create({ id: uuid_v4(), tgl_mulai, tgl_selesai, status_checkout, status_monitoring, keterangan_history_bed, registrasi_id, ms_bed_id }).then(data => {
            res.status(200).json({ status: 200, message: "sukses", data })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static update(req, res) {
        const { id, tgl_mulai, tgl_selesai, status_checkout, status_monitoring, keterangan_history_bed, registrasi_id, ms_bed_id } = req.body

        historyBed.update({ tgl_mulai, tgl_selesai, status_checkout, status_monitoring, keterangan_history_bed, registrasi_id, ms_bed_id }, {
            where: { id }
        }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async list(req, res) {
        const { halaman, jumlah, status_monitoring, status_checkout } = req.body

        try {
            let isi = ''
            let offset = ''
            let pagination = ''

            if (halaman && jumlah) {
                offset = (+halaman - 1) * jumlah;
                pagination = `limit ${jumlah} offset ${offset}`
            }

            if (status_monitoring) {
                isi += ` and hb.status_monitoring= ${status_monitoring}`
            }
            if (status_checkout) {
                isi += ` and hb.status_checkout=${status_checkout}`
            }

            let data = await sq.query(`select hb.id as "history_bed_id", * from history_bed hb join registrasi r on r.id = hb.registrasi_id join ms_bed mb on mb.id = hb.ms_bed_id where hb."deletedAt" isnull and r."deletedAt" isnull and mb."deletedAt" isnull${isi} order by hb."createdAt" desc ${pagination}`, s)
            let jml = await sq.query(`select count(*) from history_bed hb join registrasi r on r.id = hb.registrasi_id join ms_bed mb on mb.id = hb.ms_bed_id where hb."deletedAt" isnull and r."deletedAt" isnull and mb."deletedAt" isnull${isi} `, s)

            res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].count, jumlah, halaman })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }


    static async detailsById(req, res) {
        const { id } = req.body
        try {
            let data = await sq.query(`select hb.id as "history_bed_id", * from history_bed hb join registrasi r on r.id = hb.registrasi_id join ms_bed mb on mb.id = hb.ms_bed_id where hb."deletedAt" isnull and r."deletedAt" isnull and mb."deletedAt" isnull and hb.id = '${id}'`, s);

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static delete(req, res) {
        const { id } = req.body

        historyBed.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })

    }
    static async listWithParam(req, res) {
        const { status_monitoring, status_checkout, ms_bed_id, registrasi_id, no_rm, no_kunjungan, nama_lengkap, tgl_awal, tgl_akhir, halaman, jumlah } = req.body;
        let query = '';

        query += status_checkout ? ` and hb.status_checkout=${status_checkout}` : '';


        query += status_monitoring ? ` and hb.status_monitoring=${status_monitoring}` : '';


        query += ms_bed_id ? ` and hb.ms_bed_id='${ms_bed_id}'` : '';
        query += registrasi_id ? ` and hb.registrasi_id='${registrasi_id}'` : '';
        query += no_rm ? ` and p.no_rm='${no_rm}'` : '';
        query += no_kunjungan ? ` and r.no_kunjungan='${no_kunjungan}'` : '';
        query += nama_lengkap ? ` and p.nama_lengkap='${nama_lengkap}'` : '';
        query += tgl_awal ? ` and hb.tgl_masuk >= '${tgl_awal}' ` : '';
        query += tgl_akhir ? ` and hb.tgl_masuk <= '${tgl_akhir}' ` : '';
        // console.log(query);
        try {
            let offset = (+halaman - 1) * jumlah;
            let data = await sq.query(`select hb.id as "history_bed_id", * from history_bed hb
            join registrasi r on r.id = hb.registrasi_id 
            join ms_bed mb on mb.id = hb.ms_bed_id
            join pasien p on p.id = r.pasien_id 
            where hb."deletedAt" isnull and r."deletedAt" isnull and mb."deletedAt" isnull${query} order by hb."createdAt" desc limit ${jumlah} offset ${offset}`, s);
            let jml = await sq.query(`select count(*) as total from history_bed hb
            join registrasi r on r.id = hb.registrasi_id 
            join ms_bed mb on mb.id = hb.ms_bed_id
            join pasien p on p.id = r.pasien_id 
            where hb."deletedAt" isnull and r."deletedAt" isnull and mb."deletedAt" isnull${query}`, s)
            res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].total, jumlah, halaman })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }
    static async alihBed(req, res) {
        // console.log(req.body)
        const t = await sq.transaction();
        let { tgl_mulai, tgl_selesai, status_checkout, status_monitoring, keterangan_history_bed, registrasi_id, ms_bed_id } = req.body;
        let cekBed = await sq.query(`select * from history_bed hb where hb."deletedAt" isnull and hb.status_checkout = 0 and hb.ms_bed_id='${ms_bed_id}'`, s);
        if (cekBed.length > 0) {
            res.status(201).json({ status: 204, message: "Bed sudah terpakai" });
        }

        tgl_mulai = tgl_mulai ? tgl_mulai : new Date();

        // ===============================================================
        // START TRANSAKSI PENJUALAN FASILITAS
        // ===============================================================
        const bd = await sq.query(`
            select mkk.*
            from ms_bed mb
            join ms_kelas_kamar mkk on mkk.id = mb.ms_kelas_kamar_id 
            where mb.id = '${ms_bed_id}'
        `, s);
        if (bd.length === 0) res.status(201).json({ status: 204, message: "Tidak dapat menemukan bed yang dipilih." });
        const bed = bd[0]

        const penjualan = await sq.query(`
            select
                p.id as penjualan_id,
                p.kelas_kunjungan_id,
                p.ms_asuransi_id,
                kk.ms_tarif_id,
                ma.ms_harga_id,
                p.status_penjualan,
                p.harga_total_fasilitas,
                p.total_penjualan
            from penjualan p 
            join kelas_kunjungan kk on kk.id = p.kelas_kunjungan_id 
            join ms_asuransi ma on ma.id = p.ms_asuransi_id 
            where p.registrasi_id = '${registrasi_id}'
            order by p."createdAt" asc
            limit 1
        `, s)

        if (penjualan.length === 0) res.status(201).json({ status: 204, message: "Tidak dapat menemukan tarif dan harga untuk kunjungan ini." });
        const pen = penjualan[0]
        if (pen.status_penjualan === 1) res.status(201).json({ status: 204, message: "Tidak dapat beralih bed, status penjualan telah dikunci" });
        if (pen.status_penjualan === 2) res.status(201).json({ status: 204, message: "Tidak dapat beralih bed, status penjualan telah ditutup" });

        console.log('where', {
            ms_fasilitas_id: bed.ms_fasilitas_id,
            ms_tarif_id: pen.ms_tarif_id,
            ms_harga_id: pen.ms_harga_id,
        })
        const harga = await msHargaFasilitas.findOne({
            where: {
                ms_fasilitas_id: bed.ms_fasilitas_id,
                ms_tarif_id: pen.ms_tarif_id,
                ms_harga_id: pen.ms_harga_id,
            }
        })
        console.log(harga)

        const data_pen = {
            qty_fasilitas: 1,
            harga_fasilitas: 0,
            harga_fasilitas_custom: 0,
            keterangan_penjualan_fasilitas: 'Automation Alih Bed by sistem',
            status_penjualan_fasilitas: '1',
            penjualan_id: pen.penjualan_id,
            ms_fasilitas_id: bed.ms_fasilitas_id,

            harga_total_fasilitas: pen.harga_total_fasilitas + harga.harga_jual,
            discount: 0,
            tax: 0,
            total_penjualan: pen.total_penjualan + harga.harga_jual
        }
        console.log('data_pen', data_pen)

        await penjualanFasilitas.create({ 
            id: uuid_v4(), 
            qty_fasilitas:                  data_pen.qty_fasilitas, 
            harga_fasilitas:                data_pen.harga_fasilitas, 
            harga_fasilitas_custom:         data_pen.harga_fasilitas_custom, 
            keterangan_penjualan_fasilitas: data_pen.keterangan_penjualan_fasilitas, 
            status_penjualan_fasilitas:     data_pen.status_penjualan_fasilitas, 
            penjualan_id:                   data_pen.penjualan_id, 
            ms_fasilitas_id:                data_pen.ms_fasilitas_id 
        }, { transaction: t });
        await penjualan.update(
            { 
                harga_total_fasilitas: data_pen.harga_total_fasilitas, 
                // discount, 
                // tax, 
                total_penjualan: data_pen.total_penjualan
            }, 
            { 
                where: { id: penjualan_id },
                transaction: t 
            }
        )

        // ===============================================================
        // END TRANSAKSI PENJUALAN FASILITAS
        // ===============================================================

        console.log(tgl_mulai);

        // await historyBed.update({ status_checkout:1, tgl_selesai:new Date()}, {
        //     where: { registrasi_id,status_checkout:0 }
        // }, { transaction: t })

        //  historyBed.create({ id: uuid_v4(), tgl_mulai, tgl_selesai, status_checkout, status_monitoring, keterangan_history_bed, registrasi_id, ms_bed_id }, { transaction: t }).then(data => {
        //     // t.commit()
        //     res.status(200).json({ status: 200, message: "sukses", data })

        // }).catch(error => {
        //     console.log(error);
        //     res.status(500).json({ status: 500, message: "gagal", data: error })
        // })
    }
    static async checkout(req, res) {
        const t = await sq.transaction();
        let { id } = req.body;
        await historyBed.update({ status_checkout: 1, tgl_selesai: new Date() }, {
            where: { id }
        }, { transaction: t })
        t.commit()
        res.status(200).json({ status: 200, message: "sukses" })
    }
}

module.exports = Controller