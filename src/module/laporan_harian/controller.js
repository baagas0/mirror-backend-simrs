const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT }
const { buildFilter } = require("../../helper/general");
// const ExcelJS = require("exceljs");
// const { createExcel } = require('../../helper/excel')
const exc = require('../../helper/excel')
const moment = require('moment');
class Controller {

    static async kunjungan_pasien(req, res) {
        const { tgl_awal, tgl_akhir, ms_jenis_layanan_id, kelas_kunjungan_id } = req.body
        let { jumlah, halaman } = req.body

        let pagination = {}
        if (jumlah && halaman) {
            pagination = {
                jumlah, halaman
            }
        }

        if (!jumlah) jumlah = 99999999999999;
        if (!halaman) halaman = 1;
        let offset = (+halaman - 1) * jumlah;

        let tgl_awal_filter = req.body.tgl_awal ? req.body.tgl_awal : req.body.def_tgl_awal;
        let tgl_akhir_filter = req.body.tgl_akhir ? req.body.tgl_akhir : req.body.def_tgl_akhir;
        if (req.body.bulan) {
            tgl_awal_filter = moment(req.body.bulan).format('YYYY-MM-01');
            tgl_akhir_filter = moment(req.body.bulan).endOf('month').format('YYYY-MM-DD');
        }

        try {
            let f = [
                { as: 'r', field: 'id', type: '=', value: req.body.registrasi_id },

                { as: 'r', field: 'tgl_registrasi', type: 'date >=', value: tgl_awal_filter },
                { as: 'r', field: 'tgl_registrasi', type: 'date <=', value: tgl_akhir_filter },
                // { as: 'r', field: 'tgl_registrasi', type: 'date >=', value: req.body.def_tgl_awal },
                // { as: 'r', field: 'tgl_registrasi', type: 'date <=', value: req.body.def_tgl_akhir },

                { as: 'r', field: 'status_registrasi', type: '=', value: req.body.status_registrasi },
                { as: 'r', field: 'ms_jenis_layanan_id', type: '=', value: req.body.ms_jenis_layanan_id },
                { as: 'r', field: 'kelas_kunjungan_id', type: '=', value: req.body.kelas_kunjungan_id },
                { as: 'r', field: 'pasien_id', type: '=', value: req.body.pasien_id },
                { as: 'r', field: 'ms_dokter_id', type: '=', value: req.body.ms_dokter_id },
                { as: 'r', field: 'ms_spesialis_id', type: '=', value: req.body.ms_spesialis_id },
                { as: 'r', field: 'ms_asuransi_id', type: '=', value: req.body.ms_asuransi_id },
                { as: 'r', field: 'no_kunjungan', type: '=', value: req.body.no_kunjungan },
                { as: 'r', field: 'no_asuransi_registrasi', type: '=', value: req.body.no_asuransi },

                { as: 'p', field: 'nama_lengkap', type: 'ilike', value: req.body.nama_lengkap },
                { as: 'p', field: 'no_rm', type: '=', value: req.body.no_rm },
                { as: 'p', field: 'nik', type: '=', value: req.body.nik },
                { as: 'p', field: 'golongan_darah_id', type: '=', value: req.body.golongan_darah_id },
                { as: 'p', field: 'pekerjaan_id', type: '=', value: req.body.pekerjaan_id },
                { as: 'p', field: 'pendidikan_id', type: '=', value: req.body.pendidikan_id },
                { as: 'p', field: 'etnis_id', type: '=', value: req.body.etnis_id },
                
                { as: 'md', field: 'nik_dokter', type: '=', value: req.body.nik_dokter },
                { as: 'mr', field: 'id', type: '=', value: req.body.ruangan_id },

                { as: 'mp2', field: 'id', type: '=', value: req.body.poliklinik_id },
            ]

            let filter = buildFilter(f);

            // console.log(filter)

            const query = `
                select
                    r.id as registrasi_id,
                    r.*,
                    p.*,
                    md.*,
                    ms.nama_specialist,
                    ms.kode_specialist,
                    ma.nama_asuransi,
                    ma.tipe_asuransi,
                    mjl.nama_jenis_layanan,
                    mjl.kode_bridge,
                    mjl.kode_jenis_layanan,
                    hb.status_checkout,
                    hb.tgl_mulai,
                    hb.tgl_selesai,
                    hb.status_monitoring,
                    mb.nama_bed,
                    hb.ms_bed_id,
                    hb.keterangan_history_bed,
                    mb.status_bed,
                    mk.nama_kamar,
                    mk.nama_kamar,
                    mr.id as ruangan_id,
                    mr.nama_ruang,
                    mr.keterangan_ruang,
                    mp.nama_pekerjaan,
                    mp.keterangan_pekerjaan,
                    kk.ms_tarif_id,
                    ma.ms_harga_id,
                    mgd.*,
                    mp2.id as poliklinik_id,
                    mp2.nama_poliklinik,
                    (
                        select 
                            jsonb_agg(
                                json_build_object(
                                    'kode_diagnosa', dd.kode_diagnosa,
                                    'nama_diagnosa', dd.nama_diagnosa,
                                    'tipe', dd.tipe
                                ) 
                            ) 
                        from data_diagnosa dd where dd.registrasi_id = r.id
                    ) as data_diagnosa
                from
                    registrasi r
                    join kelas_kunjungan kk on kk.id = r.kelas_kunjungan_id
                    join pasien p on p.id = r.pasien_id
                    join ms_dokter md on md.id = r.ms_dokter_id
                    left join ms_specialist ms on ms.id = r.ms_spesialis_id
                    left join ms_asuransi ma on ma.id = r.ms_asuransi_id
                    join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
                    left join history_bed hb on hb.registrasi_id = r.id
                    left join ms_bed mb on mb.id = hb.ms_bed_id
                    left join ms_kamar mk on mk.id = mb.ms_kamar_id
                    left join ms_ruang mr on mr.id = mk.ms_ruang_id
                    left join ms_pekerjaan mp on mp.id = p.pekerjaan_id
                    left join ms_golongan_darah mgd on mgd.id = p.golongan_darah_id

                    left join antrian_list al on al.registrasi_id = r.id
                    left join jadwal_dokter jd on jd.id = al.jadwal_dokter_id
                    left join ms_poliklinik mp2 on mp2.id = jd.ms_poliklinik_id
                where
                    true
                    and r."deletedAt" isnull
                    and r.tgl_registrasi is not null
                    ${filter}
                order by
                    r.tgl_registrasi desc
                limit ${jumlah} offset ${offset}
            `
            console.log(query)
            const query_count = `
                select
                    count(*) as count
                from
                    registrasi r
                    join kelas_kunjungan kk on kk.id = r.kelas_kunjungan_id
                    join pasien p on p.id = r.pasien_id
                    join ms_dokter md on md.id = r.ms_dokter_id
                    left join ms_specialist ms on ms.id = r.ms_spesialis_id
                    left join ms_asuransi ma on ma.id = r.ms_asuransi_id
                    join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
                    left join history_bed hb on hb.registrasi_id = r.id
                    left join ms_bed mb on mb.id = hb.ms_bed_id
                    left join ms_kamar mk on mk.id = mb.ms_kamar_id
                    left join ms_ruang mr on mr.id = mk.ms_ruang_id
                    left join ms_pekerjaan mp on mp.id = p.pekerjaan_id
                    left join ms_golongan_darah mgd on mgd.id = p.golongan_darah_id

                    left join antrian_list al on al.registrasi_id = r.id
                    left join jadwal_dokter jd on jd.id = al.jadwal_dokter_id
                    left join ms_poliklinik mp2 on mp2.id = jd.ms_poliklinik_id
                where
                    true
                    and r."deletedAt" isnull
                    and r.tgl_registrasi is not null
                    ${filter}
            `

            let data = await sq.query(query, s);
            let jml = await sq.query(query_count, s);
            // let jml = [ { count: 10 } ]

            

            res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].count, ...pagination });
        } catch (error) {
            console.log(error)
        }
    }

    static async kunjungan_pasien_excel(req, res) {
        const { tgl_awal, tgl_akhir, ms_jenis_layanan_id, kelas_kunjungan_id } = req.body
        let { jumlah, halaman } = req.body

        if (!jumlah) jumlah = 99999999999999;
        if (!halaman) halaman = 1;
        let offset = (+halaman - 1) * jumlah;

        let tgl_awal_filter = req.body.tgl_awal ? req.body.tgl_awal : req.body.def_tgl_awal;
        let tgl_akhir_filter = req.body.tgl_akhir ? req.body.tgl_akhir : req.body.def_tgl_akhir;
        if (req.body.bulan) {
            tgl_awal_filter = moment(req.body.bulan).format('YYYY-MM-01');
            tgl_akhir_filter = moment(req.body.bulan).endOf('month').format('YYYY-MM-DD');
        }

        try {
            let filter = buildFilter([
                { as: 'r', field: 'id', type: '=', value: req.body.registrasi_id },
                { as: 'r', field: 'tgl_registrasi', type: 'date >=', value: tgl_awal_filter },
                { as: 'r', field: 'tgl_registrasi', type: 'date <=', value: tgl_akhir_filter },
                { as: 'r', field: 'status_registrasi', type: '=', value: req.body.status_registrasi },
                { as: 'r', field: 'ms_jenis_layanan_id', type: '=', value: req.body.ms_jenis_layanan_id },
                { as: 'r', field: 'kelas_kunjungan_id', type: '=', value: req.body.kelas_kunjungan_id },
                { as: 'r', field: 'pasien_id', type: '=', value: req.body.pasien_id },
                { as: 'r', field: 'ms_dokter_id', type: '=', value: req.body.ms_dokter_id },
                { as: 'r', field: 'ms_spesialis_id', type: '=', value: req.body.ms_spesialis_id },
                { as: 'r', field: 'ms_asuransi_id', type: '=', value: req.body.ms_asuransi_id },
                { as: 'r', field: 'no_kunjungan', type: '=', value: req.body.no_kunjungan },
                { as: 'r', field: 'no_asuransi_registrasi', type: '=', value: req.body.no_asuransi },

                { as: 'p', field: 'nama_lengkap', type: 'ilike', value: req.body.nama_lengkap },
                { as: 'p', field: 'no_rm', type: '=', value: req.body.no_rm },
                { as: 'p', field: 'nik', type: '=', value: req.body.nik_pasien },
                { as: 'p', field: 'golongan_darah_id', type: '=', value: req.body.golongan_darah_id },
                { as: 'p', field: 'pekerjaan_id', type: '=', value: req.body.pekerjaan_id },
                { as: 'p', field: 'pendidikan_id', type: '=', value: req.body.pendidikan_id },
                { as: 'p', field: 'etnis_id', type: '=', value: req.body.etnis_id },
                
                { as: 'md', field: 'nik_dokter', type: '=', value: req.body.nik_dokter },
                { as: 'mr', field: 'id', type: '=', value: req.body.ruangan_id },

                { as: 'mp2', field: 'id', type: '=', value: req.body.poliklinik_id },
            ]);

            const query = `
                select
                    r.id as registrasi_id,
                    r.*,
                    p.*,
                    md.*,
                    ms.nama_specialist,
                    ms.kode_specialist,
                    ma.nama_asuransi,
                    ma.tipe_asuransi,
                    mjl.nama_jenis_layanan,
                    mjl.kode_bridge,
                    mjl.kode_jenis_layanan,
                    hb.status_checkout,
                    hb.tgl_mulai,
                    hb.tgl_selesai,
                    hb.status_monitoring,
                    mb.nama_bed,
                    hb.ms_bed_id,
                    hb.keterangan_history_bed,
                    mb.status_bed,
                    mk.nama_kamar,
                    mk.nama_kamar,
                    mr.id as ruangan_id,
                    mr.nama_ruang,
                    mr.keterangan_ruang,
                    mp.nama_pekerjaan,
                    mp.keterangan_pekerjaan,
                    kk.ms_tarif_id,
                    ma.ms_harga_id,
                    mgd.*,
                    mp2.id as poliklinik_id,
                    mp2.nama_poliklinik,
                    (
                        select 
                            jsonb_agg(
                                json_build_object(
                                    'kode_diagnosa', dd.kode_diagnosa,
                                    'nama_diagnosa', dd.nama_diagnosa,
                                    'tipe', dd.tipe
                                ) 
                            ) 
                        from data_diagnosa dd where dd.registrasi_id = r.id
                    ) as data_diagnosa
                from
                    registrasi r
                    join kelas_kunjungan kk on kk.id = r.kelas_kunjungan_id
                    join pasien p on p.id = r.pasien_id
                    join ms_dokter md on md.id = r.ms_dokter_id
                    left join ms_specialist ms on ms.id = r.ms_spesialis_id
                    left join ms_asuransi ma on ma.id = r.ms_asuransi_id
                    join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
                    left join history_bed hb on hb.registrasi_id = r.id
                    left join ms_bed mb on mb.id = hb.ms_bed_id
                    left join ms_kamar mk on mk.id = mb.ms_kamar_id
                    left join ms_ruang mr on mr.id = mk.ms_ruang_id
                    left join ms_pekerjaan mp on mp.id = p.pekerjaan_id
                    left join ms_golongan_darah mgd on mgd.id = p.golongan_darah_id

                    left join antrian_list al on al.registrasi_id = r.id
                    left join jadwal_dokter jd on jd.id = al.jadwal_dokter_id
                    left join ms_poliklinik mp2 on mp2.id = jd.ms_poliklinik_id
                where
                    true
                    and r."deletedAt" isnull
                    and r.tgl_registrasi is not null
                    ${filter}
                order by
                    r.tgl_registrasi desc
                limit ${jumlah} offset ${offset}
            `

            let data = await sq.query(query, s);
            data = data.map((x, index) => {
                let diagnosa = ''
                if (x.data_diagnosa && x.data_diagnosa.length) {
                    for (let i = 0; i < x.data_diagnosa.length; i++) {
                        const e = x.data_diagnosa[i];
                        diagnosa += `${i+1}. ${e.nama_diagnosa} \n`
                    }
                }

                return {
                    no: index+1,
                    jk: x.jenis_kelamin === 'L' ? 'Laki - Laki' : 'Perempuan',
                    diagnosa: diagnosa,
                    ...x
                }
            })
            // console.log(data[0])
            console.log(req.body)
            const column = [];
            column.push({ width: 10, label: 'No', key: 'no' });
            column.push({ width: 25, label: 'Tanggal Registrasi', key: 'tgl_registrasi' });
            column.push({ width: 25, label: 'Jenis Layanan', key: 'nama_jenis_layanan' });
            if (req.body.dengan_nama_poliklinik) column.push({ width: 25, label: 'Nama Poliklinik', key: 'nama_poliklinik' });
            column.push({ width: 25, label: 'Nama Pasien', key: 'nama_lengkap' });
            column.push({ width: 10, label: 'No Kunjungan', key: 'no_kunjungan' });
            column.push({ width: 10, label: 'No RM', key: 'no_rm' });
            column.push({ width: 10, label: 'NIK', key: 'nik' });
            column.push({ width: 25, label: 'Jenis Kelamin', key: 'jk' });
            column.push({ width: 25, label: 'Asuransi', key: 'nama_asuransi' });
            column.push({ width: 25, label: 'Agama', key: 'agama' });
            column.push({ width: 25, label: 'No Asuransi', key: 'no_asuransi_registrasi' });
            column.push({ width: 35, label: 'Dokter', key: 'nama_dokter' });
            column.push({ width: 35, label: 'Spesialis', key: 'nama_specialist' });
            column.push({ width: 100, label: 'Diagnosa', key: 'diagnosa' });

            console.log(column);
            const buffer = await exc.createExcel('Data.xlsx', req.body.judul || 'Laporan Harian - Kunjungan Pasien', column, data);

            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader("Content-Disposition", "attachment; filename=" + 'Data.xlsx');
            // await workbook.xlsx.write(res);
            res.end(Buffer.from(buffer, 'binary'));

        } catch (error) {
            console.log(error)
        }
    }

    static async kunjungan_pasien_bpjs(req, res) {
        const { tgl_awal, tgl_akhir, ms_jenis_layanan_id, kelas_kunjungan_id } = req.body
        let { jumlah, halaman } = req.body

        let pagination = {}
        if (jumlah && halaman) {
            pagination = {
                jumlah, halaman
            }
        }

        if (!jumlah) jumlah = 99999999999999;
        if (!halaman) halaman = 1;
        let offset = (+halaman - 1) * jumlah;

        try {
            let filter = buildFilter([
                // Static
                { as: 'ma', field: 'nama_asuransi', type: '=', value: 'BPJS' },
                
                { as: 'r', field: 'id', type: '=', value: req.body.registrasi_id },
                

                { as: 'r', field: 'tgl_registrasi', type: 'date >=', value: req.body.tgl_awal ? req.body.tgl_awal : req.body.def_tgl_awal },
                { as: 'r', field: 'tgl_registrasi', type: 'date <=', value: req.body.tgl_akhir ? req.body.tgl_akhir : req.body.def_tgl_akhir },

                { as: 'r', field: 'status_registrasi', type: '=', value: req.body.status_registrasi },
                { as: 'r', field: 'ms_jenis_layanan_id', type: '=', value: req.body.ms_jenis_layanan_id },
                { as: 'r', field: 'kelas_kunjungan_id', type: '=', value: req.body.kelas_kunjungan_id },
                { as: 'r', field: 'pasien_id', type: '=', value: req.body.pasien_id },
                { as: 'r', field: 'ms_dokter_id', type: '=', value: req.body.ms_dokter_id },
                { as: 'r', field: 'ms_spesialis_id', type: '=', value: req.body.ms_spesialis_id },
                { as: 'r', field: 'ms_asuransi_id', type: '=', value: req.body.ms_asuransi_id },
                { as: 'r', field: 'no_kunjungan', type: '=', value: req.body.no_kunjungan },
                { as: 'r', field: 'no_asuransi_registrasi', type: '=', value: req.body.no_asuransi },

                { as: 'p', field: 'nama_lengkap', type: 'ilike', value: req.body.nama_lengkap },
                { as: 'p', field: 'no_rm', type: '=', value: req.body.no_rm },
                { as: 'p', field: 'nik', type: '=', value: req.body.nik },
                { as: 'p', field: 'golongan_darah_id', type: '=', value: req.body.golongan_darah_id },
                { as: 'p', field: 'pekerjaan_id', type: '=', value: req.body.pekerjaan_id },
                { as: 'p', field: 'pendidikan_id', type: '=', value: req.body.pendidikan_id },
                { as: 'p', field: 'etnis_id', type: '=', value: req.body.etnis_id },
                
                { as: 'md', field: 'nik_dokter', type: '=', value: req.body.nik_dokter },
                { as: 'mr', field: 'id', type: '=', value: req.body.ruangan_id },
            ]);

            // console.log(filter)

            const query = `
                select
                    r.id as registrasi_id,
                    r.*,
                    p.*,
                    md.*,
                    ms.nama_specialist,
                    ms.kode_specialist,
                    ma.nama_asuransi,
                    ma.tipe_asuransi,
                    mjl.nama_jenis_layanan,
                    mjl.kode_bridge,
                    mjl.kode_jenis_layanan,
                    hb.status_checkout,
                    hb.tgl_mulai,
                    hb.tgl_selesai,
                    hb.status_monitoring,
                    mb.nama_bed,
                    hb.ms_bed_id,
                    hb.keterangan_history_bed,
                    mb.status_bed,
                    mk.nama_kamar,
                    mk.nama_kamar,
                    mr.id as ruangan_id,
                    mr.nama_ruang,
                    mr.keterangan_ruang,
                    mp.nama_pekerjaan,
                    mp.keterangan_pekerjaan,
                    kk.ms_tarif_id,
                    ma.ms_harga_id,
                    mgd.*,
                    (
                        select 
                            jsonb_agg(
                                json_build_object(
                                    'kode_diagnosa', dd.kode_diagnosa,
                                    'nama_diagnosa', dd.nama_diagnosa,
                                    'tipe', dd.tipe
                                ) 
                            ) 
                        from data_diagnosa dd where dd.registrasi_id = r.id
                    ) as data_diagnosa
                from
                    registrasi r
                    join kelas_kunjungan kk on kk.id = r.kelas_kunjungan_id
                    join pasien p on p.id = r.pasien_id
                    join ms_dokter md on md.id = r.ms_dokter_id
                    left join ms_specialist ms on ms.id = r.ms_spesialis_id
                    left join ms_asuransi ma on ma.id = r.ms_asuransi_id
                    join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
                    left join history_bed hb on hb.registrasi_id = r.id
                    left join ms_bed mb on mb.id = hb.ms_bed_id
                    left join ms_kamar mk on mk.id = mb.ms_kamar_id
                    left join ms_ruang mr on mr.id = mk.ms_ruang_id
                    left join ms_pekerjaan mp on mp.id = p.pekerjaan_id
                    left join ms_golongan_darah mgd on mgd.id = p.golongan_darah_id
                where
                    true
                    and r."deletedAt" isnull
                    and r.tgl_registrasi is not null
                    ${filter}
                order by
                    r.tgl_registrasi desc
                limit ${jumlah} offset ${offset}
            `
            const query_count = `
                select
                    count(*) as count
                from
                    registrasi r
                    join kelas_kunjungan kk on kk.id = r.kelas_kunjungan_id
                    join pasien p on p.id = r.pasien_id
                    join ms_dokter md on md.id = r.ms_dokter_id
                    left join ms_specialist ms on ms.id = r.ms_spesialis_id
                    left join ms_asuransi ma on ma.id = r.ms_asuransi_id
                    join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
                    left join history_bed hb on hb.registrasi_id = r.id
                    left join ms_bed mb on mb.id = hb.ms_bed_id
                    left join ms_kamar mk on mk.id = mb.ms_kamar_id
                    left join ms_ruang mr on mr.id = mk.ms_ruang_id
                    left join ms_pekerjaan mp on mp.id = p.pekerjaan_id
                    left join ms_golongan_darah mgd on mgd.id = p.golongan_darah_id
                where
                    true
                    and r."deletedAt" isnull
                    and r.tgl_registrasi is not null
                    ${filter}
            `

            let data = await sq.query(query, s);
            let jml = await sq.query(query_count, s);
            // let jml = [ { count: 10 } ]

            

            res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].count, ...pagination });
        } catch (error) {
            console.log(error)
        }
    }

    static async kunjungan_pasien_bpjs_excel(req, res) {
        const { tgl_awal, tgl_akhir, ms_jenis_layanan_id, kelas_kunjungan_id } = req.body
        let { jumlah, halaman } = req.body

        if (!jumlah) jumlah = 99999999999999;
        if (!halaman) halaman = 1;
        let offset = (+halaman - 1) * jumlah;

        try {
            let filter = buildFilter([
                // Static
                { as: 'ma', field: 'nama_asuransi', type: '=', value: 'BPJS' },
                
                { as: 'r', field: 'id', type: '=', value: req.body.registrasi_id },
                { as: 'r', field: 'tgl_registrasi', type: 'date >=', value: req.body.tgl_awal },
                { as: 'r', field: 'tgl_registrasi', type: 'date <=', value: req.body.tgl_akhir },
                { as: 'r', field: 'status_registrasi', type: '=', value: req.body.status_registrasi },
                { as: 'r', field: 'ms_jenis_layanan_id', type: '=', value: req.body.ms_jenis_layanan_id },
                { as: 'r', field: 'kelas_kunjungan_id', type: '=', value: req.body.kelas_kunjungan_id },
                { as: 'r', field: 'pasien_id', type: '=', value: req.body.pasien_id },
                { as: 'r', field: 'ms_dokter_id', type: '=', value: req.body.ms_dokter_id },
                { as: 'r', field: 'ms_spesialis_id', type: '=', value: req.body.ms_spesialis_id },
                { as: 'r', field: 'ms_asuransi_id', type: '=', value: req.body.ms_asuransi_id },
                { as: 'r', field: 'no_kunjungan', type: '=', value: req.body.no_kunjungan },
                { as: 'r', field: 'no_asuransi_registrasi', type: '=', value: req.body.no_asuransi },

                { as: 'p', field: 'nama_lengkap', type: 'ilike', value: req.body.nama_lengkap },
                { as: 'p', field: 'no_rm', type: '=', value: req.body.no_rm },
                { as: 'p', field: 'nik', type: '=', value: req.body.nik_pasien },
                { as: 'p', field: 'golongan_darah_id', type: '=', value: req.body.golongan_darah_id },
                { as: 'p', field: 'pekerjaan_id', type: '=', value: req.body.pekerjaan_id },
                { as: 'p', field: 'pendidikan_id', type: '=', value: req.body.pendidikan_id },
                { as: 'p', field: 'etnis_id', type: '=', value: req.body.etnis_id },
                
                { as: 'md', field: 'nik_dokter', type: '=', value: req.body.nik_dokter },
                { as: 'mr', field: 'id', type: '=', value: req.body.ruangan_id },
            ]);

            const query = `
                select
                    r.id as registrasi_id,
                    r.*,
                    p.*,
                    md.*,
                    ms.nama_specialist,
                    ms.kode_specialist,
                    ma.nama_asuransi,
                    ma.tipe_asuransi,
                    mjl.nama_jenis_layanan,
                    mjl.kode_bridge,
                    mjl.kode_jenis_layanan,
                    hb.status_checkout,
                    hb.tgl_mulai,
                    hb.tgl_selesai,
                    hb.status_monitoring,
                    mb.nama_bed,
                    hb.ms_bed_id,
                    hb.keterangan_history_bed,
                    mb.status_bed,
                    mk.nama_kamar,
                    mk.nama_kamar,
                    mr.id as ruangan_id,
                    mr.nama_ruang,
                    mr.keterangan_ruang,
                    mp.nama_pekerjaan,
                    mp.keterangan_pekerjaan,
                    kk.ms_tarif_id,
                    ma.ms_harga_id,
                    mgd.*,
                    (
                        select 
                            jsonb_agg(
                                json_build_object(
                                    'kode_diagnosa', dd.kode_diagnosa,
                                    'nama_diagnosa', dd.nama_diagnosa,
                                    'tipe', dd.tipe
                                ) 
                            ) 
                        from data_diagnosa dd where dd.registrasi_id = r.id
                    ) as data_diagnosa
                from
                    registrasi r
                    join kelas_kunjungan kk on kk.id = r.kelas_kunjungan_id
                    join pasien p on p.id = r.pasien_id
                    join ms_dokter md on md.id = r.ms_dokter_id
                    left join ms_specialist ms on ms.id = r.ms_spesialis_id
                    left join ms_asuransi ma on ma.id = r.ms_asuransi_id
                    join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
                    left join history_bed hb on hb.registrasi_id = r.id
                    left join ms_bed mb on mb.id = hb.ms_bed_id
                    left join ms_kamar mk on mk.id = mb.ms_kamar_id
                    left join ms_ruang mr on mr.id = mk.ms_ruang_id
                    left join ms_pekerjaan mp on mp.id = p.pekerjaan_id
                    left join ms_golongan_darah mgd on mgd.id = p.golongan_darah_id
                where
                    true
                    and r."deletedAt" isnull
                    and r.tgl_registrasi is not null
                    ${filter}
                order by
                    r.tgl_registrasi desc
                limit ${jumlah} offset ${offset}
            `

            let data = await sq.query(query, s);
            data = data.map((x, index) => {
                let diagnosa = ''
                if (x.data_diagnosa && x.data_diagnosa.length) {
                    for (let i = 0; i < x.data_diagnosa.length; i++) {
                        const e = x.data_diagnosa[i];
                        diagnosa += `${i+1}. ${e.nama_diagnosa} \n`
                    }
                }

                return {
                    no: index+1,
                    jk: x.jenis_kelamin === 'L' ? 'Laki - Laki' : 'Perempuan',
                    diagnosa: diagnosa,
                    ...x
                }
            })
            console.log(data[0])
            const buffer = await exc.createExcel('Data.xlsx', 'Laporan Harian - Kunjungan Pasien BPJS', [
                { width: 10, label: 'No', key: 'no' },
                { width: 25, label: 'Tanggal Registrasi', key: 'tgl_registrasi' },
                { width: 25, label: 'Jenis Layanan', key: 'nama_jenis_layanan' },
                { width: 25, label: 'Nama Pasien', key: 'nama_lengkap' },
                { width: 10, label: 'No Kunjungan', key: 'no_kunjungan' },
                { width: 10, label: 'No RM', key: 'no_rm' },
                { width: 10, label: 'NIK', key: 'nik' },
                { width: 25, label: 'Jenis Kelamin', key: 'jk' },
                { width: 25, label: 'Asuransi', key: 'nama_asuransi' },
                { width: 25, label: 'Agama', key: 'agama' },
                { width: 25, label: 'No Asuransi', key: 'no_asuransi_registrasi' },
                { width: 35, label: 'Dokter', key: 'nama_dokter' },
                { width: 35, label: 'Spesialis', key: 'nama_specialist' },
                { width: 100, label: 'Diagnosa', key: 'diagnosa' },
            ], data);

            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader("Content-Disposition", "attachment; filename=" + 'Data.xlsx');
            // await workbook.xlsx.write(res);
            res.end(Buffer.from(buffer, 'binary'));

        } catch (error) {
            console.log(error)
        }
    }

    static async penyakit(req,res) {

        let { jumlah, halaman } = req.body

        let pagination = {}
        if (jumlah && halaman) {
            pagination = {
                jumlah, halaman
            }
        }

        if (!jumlah) jumlah = 99999999999999;
        if (!halaman) halaman = 1;
        let offset = (+halaman - 1) * jumlah;

        try {
            let filter = buildFilter([
                { as: 'dd', field: 'kode_diagnosa', type: '=', value: req.body.kode_diagnosa },
                { as: 'dd', field: 'kode_diagnosa', type: 'in', value: req.body.bulk_kode_diagnosa },

                { as: 'r', field: 'tgl_registrasi', type: 'date >=', value: req.body.tgl_awal },
                { as: 'r', field: 'tgl_registrasi', type: 'date <=', value: req.body.tgl_akhir },
            ]);

            const query = `
                SELECT
                    dd.kode_diagnosa,
                    dd.nama_diagnosa,
                    sum(CASE WHEN p.jenis_kelamin = 'L' THEN 1 else 0 END) AS jumlah_laki_laki,
                    sum(CASE WHEN p.jenis_kelamin = 'P' THEN 1 else 0 END) AS jumlah_perempuan,
                    sum(1) as jumlah_total
                FROM
                    data_diagnosa dd
                    JOIN registrasi r ON r.id = dd.registrasi_id
                    JOIN pasien p ON p.id = r.pasien_id

                WHERE true
                    ${filter}
                    
                GROUP BY
                    dd.kode_diagnosa, dd.nama_diagnosa
                limit ${jumlah} offset ${offset}
            `

            const query_count = `
                SELECT
                    count(*) over() as count
                FROM
                    data_diagnosa dd
                    JOIN registrasi r ON r.id = dd.registrasi_id
                    JOIN pasien p ON p.id = r.pasien_id

                WHERE true
                    ${filter}
                    
                GROUP BY
                    dd.kode_diagnosa, dd.nama_diagnosa
            `

            let data = await sq.query(query, s);
            let jml = await sq.query(query_count, s);

            res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].count, ...pagination });
        } catch (error) {
            console.log(error)
        }
    }

    static async penyakit_excel(req,res) {

        try {
            let filter = buildFilter([
                { as: 'dd', field: 'kode_diagnosa', type: '=', value: req.body.kode_diagnosa },
                { as: 'dd', field: 'kode_diagnosa', type: 'in', value: req.body.bulk_kode_diagnosa },

                { as: 'r', field: 'tgl_registrasi', type: 'date >=', value: req.body.tgl_awal },
                { as: 'r', field: 'tgl_registrasi', type: 'date <=', value: req.body.tgl_akhir },
            ]);

            const query = `
                SELECT
                    dd.kode_diagnosa,
                    dd.nama_diagnosa,
                    sum(CASE WHEN p.jenis_kelamin = 'L' THEN 1 else 0 END) AS jumlah_laki_laki,
                    sum(CASE WHEN p.jenis_kelamin = 'P' THEN 1 else 0 END) AS jumlah_perempuan,
                    sum(1) as jumlah_total
                FROM
                    data_diagnosa dd
                    JOIN registrasi r ON r.id = dd.registrasi_id
                    JOIN pasien p ON p.id = r.pasien_id

                WHERE true
                    ${filter}
                    
                GROUP BY
                    dd.kode_diagnosa, dd.nama_diagnosa
            `

            let data = await sq.query(query, s);
            data = data.map((x, index) => {
                return {
                    no: index+1,
                    jk: x.jenis_kelamin === 'L' ? 'Laki - Laki' : 'Perempuan',
                    ...x
                }
            })
            
            const buffer = await exc.createExcel('Data.xlsx', 'Laporan Harian - Penyakit', [
                { width: 10, label: 'No', key: 'no' },
                { width: 25, label: 'Kode Diagnosa', key: 'kode_diagnosa' },
                { width: 25, label: 'Nama Diagnosa', key: 'nama_diagnosa' },
                { width: 35, label: 'Jumlah Laki Laki', key: 'jumlah_laki_laki' },
                { width: 35, label: 'Jumlah Perempuan', key: 'jumlah_perempuan' },
                { width: 35, label: 'Total', key: 'jumlah_total' },
            ], data);

            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader("Content-Disposition", "attachment; filename=" + 'Data.xlsx');
            res.end(Buffer.from(buffer, 'binary'));

        } catch (error) {
            console.log(error)
        }
    }

    static async pemeriksaan_medis(req, res) {
        try {
            let filter = buildFilter([
                { as: 'mttm', field: 'id', type: '=', value: req.body.ms_tipe_tenaga_medis_id },
                { as: 'r', field: 'ms_dokter_id', type: '=', value: req.body.ms_dokter_id },

                { as: 'r', field: 'tgl_registrasi', type: 'date >=', value: req.body.tgl_awal },
                { as: 'r', field: 'tgl_registrasi', type: 'date <=', value: req.body.tgl_akhir },
            ]);

            const query = `
                with data as (
                    select
                        'assesment_medis_igd' as type,
                        ami.registrasi_id,
                        ami."createdAt" as tanggal,
                        r.ms_dokter_id,
                        md.nama_dokter,
                        mttm.nama_tipe_tenaga_medis
                    from assesment_medis_igd ami
                    join registrasi r on r.id = ami.registrasi_id
                    join ms_dokter md on md.id = r.ms_dokter_id
                    join ms_tipe_tenaga_medis mttm on mttm.id = md.ms_tipe_tenaga_medis_id 
                    
                    where true ${filter}
                    
                    union all
                    
                    select
                        'assesment_medis_rjalan' as type,
                        amr.registrasi_id,
                        amr."createdAt" as tanggal,
                        r.ms_dokter_id,
                        md.nama_dokter,
                        mttm.nama_tipe_tenaga_medis
                    from assesment_medis_rjalan amr
                    join registrasi r on r.id = amr.registrasi_id
                    join ms_dokter md on md.id = r.ms_dokter_id
                    join ms_tipe_tenaga_medis mttm on mttm.id = md.ms_tipe_tenaga_medis_id 
                    
                    where true ${filter}
                    
                    union all
                    
                    select
                        'cppt' as type,
                        c.registrasi_id,
                        c.tanggal_cppt as tanggal,
                        r.ms_dokter_id,
                        md.nama_dokter,
                        mttm.nama_tipe_tenaga_medis
                    from cppt c 
                    join registrasi r on r.id = c.registrasi_id 
                    join ms_dokter md on md.id = r.ms_dokter_id
                    join ms_tipe_tenaga_medis mttm on mttm.id = md.ms_tipe_tenaga_medis_id 
                    
                    where true ${filter}
                )
                
                select
                    md.id as ms_dokter_id,
                    md.nama_dokter,
                    mttm.id as ms_tipe_tenaga_medis_id,
                    mttm.nama_tipe_tenaga_medis,
                    count(*) as jml_pemeriksaan
                from data
                join ms_dokter md on md.id = data.ms_dokter_id
                join ms_tipe_tenaga_medis mttm on mttm.id = md.ms_tipe_tenaga_medis_id 
                group by md.id, mttm.id
                        
            `

            let data = await sq.query(query, s);
            data = data.map((x, index) => {
                return {
                    no: index+1,
                    ...x
                }
            })

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (error) {
            console.log(error)
        }
    }

    static async pemeriksaan_medis_excel(req, res) {
        try {
            let filter = buildFilter([
                { as: 'mttm', field: 'id', type: '=', value: req.body.ms_tipe_tenaga_medis_id },
                { as: 'r', field: 'ms_dokter_id', type: '=', value: req.body.ms_dokter_id },

                { as: 'r', field: 'tgl_registrasi', type: 'date >=', value: req.body.tgl_awal },
                { as: 'r', field: 'tgl_registrasi', type: 'date <=', value: req.body.tgl_akhir },
            ]);

            const query = `
                with data as (
                    select
                        'assesment_medis_igd' as type,
                        ami.registrasi_id,
                        ami."createdAt" as tanggal,
                        r.ms_dokter_id,
                        md.nama_dokter,
                        mttm.nama_tipe_tenaga_medis
                    from assesment_medis_igd ami
                    join registrasi r on r.id = ami.registrasi_id
                    join ms_dokter md on md.id = r.ms_dokter_id
                    join ms_tipe_tenaga_medis mttm on mttm.id = md.ms_tipe_tenaga_medis_id 
                    
                    where true ${filter}
                    
                    union all
                    
                    select
                        'assesment_medis_rjalan' as type,
                        amr.registrasi_id,
                        amr."createdAt" as tanggal,
                        r.ms_dokter_id,
                        md.nama_dokter,
                        mttm.nama_tipe_tenaga_medis
                    from assesment_medis_rjalan amr
                    join registrasi r on r.id = amr.registrasi_id
                    join ms_dokter md on md.id = r.ms_dokter_id
                    join ms_tipe_tenaga_medis mttm on mttm.id = md.ms_tipe_tenaga_medis_id 
                    
                    where true ${filter}
                    
                    union all
                    
                    select
                        'cppt' as type,
                        c.registrasi_id,
                        c.tanggal_cppt as tanggal,
                        r.ms_dokter_id,
                        md.nama_dokter,
                        mttm.nama_tipe_tenaga_medis
                    from cppt c 
                    join registrasi r on r.id = c.registrasi_id 
                    join ms_dokter md on md.id = r.ms_dokter_id
                    join ms_tipe_tenaga_medis mttm on mttm.id = md.ms_tipe_tenaga_medis_id 
                    
                    where true ${filter}
                )
                
                select
                    md.id as ms_dokter_id,
                    md.nama_dokter,
                    mttm.id as ms_tipe_tenaga_medis_id,
                    mttm.nama_tipe_tenaga_medis,
                    count(*) as jml_pemeriksaan
                from data
                join ms_dokter md on md.id = data.ms_dokter_id
                join ms_tipe_tenaga_medis mttm on mttm.id = md.ms_tipe_tenaga_medis_id 
                group by md.id, mttm.id
                        
            `

            let data = await sq.query(query, s);
            data = data.map((x, index) => {
                return {
                    no: index+1,
                    ...x
                }
            })

            const buffer = await exc.createExcel('Data.xlsx', 'Laporan Harian - Pemeriksaan Medis', [
                { width: 10, label: 'No', key: 'no' },
                { width: 25, label: 'Nama Dokter', key: 'nama_dokter' },
                { width: 25, label: 'Tenaga Medis', key: 'nama_tipe_tenaga_medis' },
                { width: 35, label: 'Jumlah Pemeriksaan', key: 'jml_pemeriksaan' },
            ], data);

            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader("Content-Disposition", "attachment; filename=" + 'Data.xlsx');
            res.end(Buffer.from(buffer, 'binary'));

            // res.status(200).json({ status: 200, message: "sukses", data });
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = Controller