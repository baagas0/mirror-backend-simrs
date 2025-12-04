const historyBed = require('./model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');

const s = { type: QueryTypes.SELECT }
const moment = require('moment');

const msHargaFasilitas = require('../ms_harga_fasilitas/model')
const penjualanFasilitas = require('../penjualan_fasilitas/model')
const penjualan = require('../penjualan/model');
const msBed = require('../ms_bed/model');
const registrasi = require('../registrasi/model');
class Controller {

    static register(req, res) {
        let { tipe_kelas_kamar, tgl_mulai, tgl_selesai, status_checkout, status_monitoring, keterangan_history_bed, registrasi_id, ms_bed_id } = req.body
        tgl_mulai= tgl_mulai?tgl_mulai:new Date();

        historyBed.update({ tgl_selesai: tgl_mulai }, {
            where: {
                registrasi_id,
                tgl_selesai: { [Op.is]: null }
            }
        }).then((c) => {

            historyBed.create({ id: uuid_v4(), tgl_mulai, tgl_selesai, status_checkout, status_monitoring, keterangan_history_bed, registrasi_id, ms_bed_id }).then(async data => {
                await registrasi.update({ tipe_kelas_kamar }, { where: { id: registrasi_id } })
                res.status(200).json({ status: 200, message: "sukses", data })
            }).catch(error => {
                console.log(error);
                res.status(500).json({ status: 500, message: "gagal", data: error })
            })

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
        const {halaman,jumlah,status_monitoring,status_checkout} = req.body

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

             if(status_monitoring){
                isi+= ` and hb.status_monitoring= ${status_monitoring}`
            }
            if(status_checkout){
                isi+= ` and hb.status_checkout=${status_checkout}`
            }

            let data = await sq.query(`select
                hb.id as "history_bed_id", *
                from history_bed hb 
                join registrasi r on r.id = hb.registrasi_id 
                join ms_bed mb on mb.id = hb.ms_bed_id 
                left join ms_kelas_kamar mkk on mkk.id = mb.ms_kelas_kamar_id
                left join ms_kamar mk on mk.id = mb.ms_kamar_id
                left join ruang_aplicares ra on ra.id = mb.ruang_aplicares_id
                left join ms_golongan_kelas_aplicares mgka on mgka.id = mb.golongan_kelas_aplicares_id
                left join ms_kelas_kamar_sironline mkks on mkks.id = mb.kelas_kamar_sirsonline_id
                where hb."deletedAt" isnull and r."deletedAt" isnull and mb."deletedAt" isnull${isi} order by hb."createdAt" desc ${pagination}
            `, s)
            
            const mappedData = data.map((x) => {
                const start = moment(x.tgl_mulai);
                const end = moment(x.tgl_selesai);

                const diff_day = end.diff(start);
                return {
                    ...x,
                    diff_day: diff_day ? `${diff_day} Hari` : '-'
                }
            })

            let jml = await sq.query(`select count(*) as count
                from history_bed hb 
                join registrasi r on r.id = hb.registrasi_id 
                join ms_bed mb on mb.id = hb.ms_bed_id 
                left join ms_kelas_kamar mkk on mkk.id = mb.ms_kelas_kamar_id
                left join ms_kamar mk on mk.id = mb.ms_kamar_id
                left join ruang_aplicares ra on ra.id = mb.ruang_aplicares_id
                left join ms_golongan_kelas_aplicares mgka on mgka.id = mb.golongan_kelas_aplicares_id
                left join ms_kelas_kamar_sironline mkks on mkks.id = mb.kelas_kamar_sirsonline_id
                where hb."deletedAt" isnull and r."deletedAt" isnull and mb."deletedAt" isnull${isi} `,s)

            res.status(200).json({ status: 200, message: "sukses",data: mappedData,count: Number(jml[0].count), jumlah, halaman:2 })
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
        const {status_monitoring,status_checkout,ms_bed_id,registrasi_id,no_rm,no_kunjungan,nama_lengkap,tgl_awal,tgl_akhir,halaman,jumlah, order_asc}=req.body;
        let query='';
        
        query+=status_checkout?` and hb.status_checkout=${status_checkout}`:'';
        
        
        query+=status_monitoring?` and hb.status_monitoring=${status_monitoring}`:'';
        
        
        query+=ms_bed_id?` and hb.ms_bed_id='${ms_bed_id}'`:'';
        query+=registrasi_id?` and hb.registrasi_id='${registrasi_id}'`:'';
        query+=no_rm?` and p.no_rm='${no_rm}'`:'';
        query+=no_kunjungan?` and r.no_kunjungan='${no_kunjungan}'`:'';
        query+=nama_lengkap?` and p.nama_lengkap='${nama_lengkap}'`:'';
        query += tgl_awal?` and hb.tgl_masuk >= '${tgl_awal}' `:'';
        query += tgl_akhir?` and hb.tgl_masuk <= '${tgl_akhir}' `:'';
        // console.log(query);
        try {
            let offset = (+halaman - 1) * jumlah;
            let data = await sq.query(`select hb.id as "history_bed_id", * from history_bed hb
            join registrasi r on r.id = hb.registrasi_id 
            join ms_bed mb on mb.id = hb.ms_bed_id
            join pasien p on p.id = r.pasien_id 
            left join ms_kelas_kamar mkk on mkk.id = mb.ms_kelas_kamar_id
            left join ms_kamar mk on mk.id = mb.ms_kamar_id
            left join ruang_aplicares ra on ra.id = mb.ruang_aplicares_id
            left join ms_golongan_kelas_aplicares mgka on mgka.id = mb.golongan_kelas_aplicares_id
            left join ms_kelas_kamar_sironline mkks on mkks.id = mb.kelas_kamar_sirsonline_id
            where hb."deletedAt" isnull and r."deletedAt" isnull and mb."deletedAt" isnull${query} order by hb."createdAt" ${order_asc ? 'asc' : 'desc'} limit ${jumlah} offset ${offset}`, s);
            let jml = await sq.query(`select count(*) as total from history_bed hb
            join registrasi r on r.id = hb.registrasi_id 
            join ms_bed mb on mb.id = hb.ms_bed_id
            join pasien p on p.id = r.pasien_id 
            left join ms_kelas_kamar mkk on mkk.id = mb.ms_kelas_kamar_id
            left join ms_kamar mk on mk.id = mb.ms_kamar_id
            left join ruang_aplicares ra on ra.id = mb.ruang_aplicares_id
            left join ms_golongan_kelas_aplicares mgka on mgka.id = mb.golongan_kelas_aplicares_id
            left join ms_kelas_kamar_sironline mkks on mkks.id = mb.kelas_kamar_sirsonline_id
            where hb."deletedAt" isnull and r."deletedAt" isnull and mb."deletedAt" isnull${query}`, s)
            res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].total, jumlah, halaman })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }
    static async alihBed(req, res) {
        const t = await sq.transaction();
        let { tgl_mulai, tgl_selesai, status_checkout, status_monitoring, keterangan_history_bed, registrasi_id, ms_bed_id } = req.body;
        let cekBed = await sq.query(`select * from history_bed hb where hb."deletedAt" isnull and hb.status_checkout = 0 and hb.ms_bed_id='${ms_bed_id}'`, s);
        if(cekBed.length>0){
            res.status(500).json({ status: 500, message: "Bed sudah terpakai" });
        }
        
        tgl_mulai= tgl_mulai?tgl_mulai:new Date();

        // ===============================================================
        // START TRANSAKSI PENJUALAN FASILITAS BED
        // ===============================================================
        const bd = await sq.query(`
            select mkk.*
            from ms_bed mb
            join ms_kelas_kamar mkk on mkk.id = mb.ms_kelas_kamar_id 
            where mb.id = '${ms_bed_id}'
        `, s);
        if (bd.length === 0) res.status(500).json({ status: 500, message: "Tidak dapat menemukan bed yang dipilih." });
        const bed = bd[0]

        const p = await sq.query(`
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

        if (p.length === 0) res.status(500).json({ status: 500, message: "Tidak dapat menemukan tarif dan harga untuk kunjungan ini." });
        const pen = p[0]
        if (pen.status_penjualan === 2) res.status(500).json({ status: 500, message: "Tidak dapat beralih bed, status penjualan telah dikunci" });
        if (pen.status_penjualan === 3) res.status(500).json({ status: 500, message: "Tidak dapat beralih bed, status penjualan telah ditutup" });

        const history_bed_lama = await historyBed.findOne({
            where: {
                registrasi_id: registrasi_id,
                status_checkout: 0,
                tgl_selesai: {
                    [Op.is]: null
                }
            },
            order: [
                ['createdAt', 'desc']
            ]
        })
        if (!history_bed_lama.id) res.status(500).json({ status: 500, message: "Tidak dapat menemukan bed lama untuk kunjungan ini." });

        const harga = await msHargaFasilitas.findOne({
            where: {
                ms_fasilitas_id: bed.ms_fasilitas_id,
                ms_tarif_id: pen.ms_tarif_id,
                ms_harga_id: pen.ms_harga_id,
            }
        })

        let detail = {
            id: history_bed_lama.id,
            // tes: history_bed_lama.tgl_mulai,
            tgl_mulai: moment.tz(history_bed_lama.tgl_mulai, 'Asia/Jakarta'),
            // tgl_mulai: moment.tz('2024-03-28 17:00:00.000 +0700', 'Asia/Jakarta'),
            tgl_selesai: moment.tz(tgl_mulai, 'Asia/Jakarta'), // Tanggal mulai bed baru merupakan tanggal selesai bed lama
            selisih_waktu: 0,
            selisih_hari: 0,

            harga_jual: harga.harga_jual,
            total_harga_jual : 0
        }
        if (detail.tgl_selesai.isBefore(detail.tgl_mulai)) res.status(500).json({ status: 500, message: "Tanggal masuk tidak boleh lebih besar dari tanggal sebelumnya." });
        detail.selisih_waktu = detail.tgl_selesai.diff(detail.tgl_mulai); // Perbedaan dalam milidetik
        detail.selisih_hari = moment.duration(detail.selisih_waktu).asDays(); // Selisih dalam hari
        detail.total_harga_jual = detail.harga_jual * detail.selisih_hari
        console.log('detail', detail)

        const data_pen = {
            qty_fasilitas: detail.selisih_hari,
            harga_fasilitas: detail.harga_jual,
            harga_fasilitas_custom: detail.harga_jual,
            keterangan_penjualan_fasilitas: 'Automation Alih Bed by sistem',
            status_penjualan_fasilitas: '1',
            penjualan_id: pen.penjualan_id,
            ms_fasilitas_id: bed.ms_fasilitas_id,

            harga_total_fasilitas: pen.harga_total_fasilitas + detail.total_harga_jual,
            discount: 0,
            tax: 0,
            total_penjualan: pen.total_penjualan + detail.total_harga_jual
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

        // Kurang perhitungan tax penjualan
        await penjualan.update(
            { 
                harga_total_fasilitas: data_pen.harga_total_fasilitas, 
                // discount, 
                // tax, 
                total_penjualan: data_pen.total_penjualan
            }, 
            { 
                where: { id: data_pen.penjualan_id },
                transaction: t 
            }
        )

        // ===============================================================
        // END TRANSAKSI PENJUALAN FASILITAS BED
        // ===============================================================

        await historyBed.update({ status_checkout:1, tgl_selesai:new Date()}, {
            where: { registrasi_id,status_checkout:0 }
        }, { transaction: t })
    
         historyBed.create({ id: uuid_v4(), tgl_mulai, tgl_selesai, status_checkout, status_monitoring, keterangan_history_bed, registrasi_id, ms_bed_id }, { transaction: t }).then(data => {
            t.commit()
            res.status(200).json({ status: 200, message: "sukses", data })
            
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }
    static async checkout(req, res) {
        const t = await sq.transaction();
        let { id } = req.body;

        const history_bed = await historyBed.findOne({ where: { id } })
        // const bed = await msBed.findOne({ where: { id: history_bed.ms_bed_id } })
        const bd = await sq.query(`
            select mkk.*
            from ms_bed mb
            join ms_kelas_kamar mkk on mkk.id = mb.ms_kelas_kamar_id 
            where mb.id = '${history_bed.ms_bed_id}'
        `, s);
        if (bd.length === 0) res.status(500).json({ status: 500, message: "Tidak dapat menemukan bed yang dipilih." });
        const bed = bd[0]
        console.log(bed)
        // ===============================================================
        // START TRANSAKSI PENJUALAN FASILITAS BED
        // ===============================================================
        const p = await sq.query(`
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
            where p.registrasi_id = '${history_bed.registrasi_id}'
            order by p."createdAt" asc
            limit 1
        `, s)

        if (p.length === 0) res.status(500).json({ status: 500, message: "Tidak dapat menemukan tarif dan harga untuk kunjungan ini." });
        const pen = p[0]
        if (pen.status_penjualan === 2) res.status(500).json({ status: 500, message: "Tidak dapat beralih bed, status penjualan telah dikunci" });
        if (pen.status_penjualan === 3) res.status(500).json({ status: 500, message: "Tidak dapat beralih bed, status penjualan telah ditutup" });

        const harga = await msHargaFasilitas.findOne({
            where: {
                ms_fasilitas_id: bed.ms_fasilitas_id,
                ms_tarif_id: pen.ms_tarif_id,
                ms_harga_id: pen.ms_harga_id,
            }
        })

        let detail = {
            id: history_bed.id,
            // tes: history_bed.tgl_mulai,
            tgl_mulai: moment.tz(history_bed.tgl_mulai, 'Asia/Jakarta'),
            // tgl_mulai: moment.tz('2024-03-28 17:00:00.000 +0700', 'Asia/Jakarta'),
            tgl_selesai: moment.tz(new Date(), 'Asia/Jakarta'), // Tanggal mulai bed baru merupakan tanggal selesai bed lama
            selisih_waktu: 0,
            selisih_hari: 0,

            harga_jual: harga.harga_jual,
            total_harga_jual : 0
        }

        if (detail.tgl_selesai.isBefore(detail.tgl_mulai)) res.status(500).json({ status: 500, message: "Tanggal masuk tidak boleh lebih besar dari tanggal sebelumnya." });
        detail.selisih_waktu = detail.tgl_selesai.diff(detail.tgl_mulai); // Perbedaan dalam milidetik
        detail.selisih_hari = moment.duration(detail.selisih_waktu).asDays(); // Selisih dalam hari
        detail.total_harga_jual = detail.harga_jual * detail.selisih_hari
        console.log('detail', detail)

        const data_pen = {
            qty_fasilitas: detail.selisih_hari,
            harga_fasilitas: detail.harga_jual,
            harga_fasilitas_custom: detail.harga_jual,
            keterangan_penjualan_fasilitas: 'Automation Checkout Bed by sistem',
            status_penjualan_fasilitas: '1',
            penjualan_id: pen.penjualan_id,
            ms_fasilitas_id: bed.ms_fasilitas_id,

            harga_total_fasilitas: pen.harga_total_fasilitas + detail.total_harga_jual,
            discount: 0,
            tax: 0,
            total_penjualan: pen.total_penjualan + detail.total_harga_jual
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

        // Kurang perhitungan tax penjualan
        await penjualan.update(
            { 
                harga_total_fasilitas: data_pen.harga_total_fasilitas, 
                // discount, 
                // tax, 
                total_penjualan: data_pen.total_penjualan
            }, 
            { 
                where: { id: data_pen.penjualan_id },
                transaction: t 
            }
        )

        // ===============================================================
        // END TRANSAKSI PENJUALAN FASILITAS BED
        // ===============================================================

        await historyBed.update({ status_checkout:1, tgl_selesai:new Date()}, {
            where: { id }
        }, { transaction: t })
        t.commit()
        res.status(200).json({ status: 200, message: "sukses" })
    }

    static async checkBedRegistrasi(req, res) {
        let { registrasi_id } = req.body;

        const history_bed = await historyBed.findAll({ where: { registrasi_id, status_checkout: 0 } })

        res.status(200).json({ status: 200, message: "sukses", data: history_bed }) 
    }
}

module.exports = Controller