const HasilOperasi = require('./model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };
const moment = require('moment');
const ExcelJS = require('exceljs');

class Controller {

    static async upsert(req, res) {
        const {
            jadwal_operasi_id,
            kategori,
            jenis_anasthesi,
            operator_1_id,
            operator_2_id,
            operator_3_id,
            dokter_anastesi_id,
            dokter_anak_id,
            bidan_1_id,
            bidan_2_id,
            bidan_3_id,
            perawat_luar_id,
            instrumen_id,
            dokter_umum_id,
            pre_diagnosa_id,
            post_diagnosa_id,
            eksisi_ensisi,
            pemeriksaan_pa,
            ast_operator_1_id,
            ast_operator_2_id,
            ast_operator_3_id,
            ast_anastesi_1_id,
            ast_anastesi_2_id,
            prw_resusitasi_id,
            onloop_1_id,
            onloop_2_id,
            onloop_3_id,
            onloop_4_id,
            onloop_5_id,
            tanggal_selesai,
            laporan_operasi,
            dokter_pj_anak_id,
        } = req.body;

        try {
            const check = await HasilOperasi.findOne({
                attributes: ['id'],
                where: { jadwal_operasi_id }
            })
            
            const data = {
                kategori, jenis_anasthesi, operator_1_id, operator_2_id, operator_3_id, dokter_anastesi_id, dokter_anak_id, bidan_1_id, bidan_2_id, bidan_3_id, perawat_luar_id, instrumen_id, dokter_umum_id, pre_diagnosa_id, post_diagnosa_id, eksisi_ensisi, pemeriksaan_pa, ast_operator_1_id, ast_operator_2_id, ast_operator_3_id, ast_anastesi_1_id, ast_anastesi_2_id, prw_resusitasi_id, onloop_1_id, onloop_2_id, onloop_3_id, onloop_4_id, onloop_5_id, tanggal_selesai, laporan_operasi, dokter_pj_anak_id,
            }
            if (check !== null) {
                await HasilOperasi.update(data, { where: { jadwal_operasi_id: jadwal_operasi_id} });
            } else {
                await HasilOperasi.create({ ...data, jadwal_operasi_id, id: uuid_v4() });
            }

            res.status(200).json({ status: 200, message: "Sukses" });
        } catch (err) {
            res.status(500).json({ status: 500, message: err.message ? err.message : "Gagal", data: err });
        }
    }

    static async register(req, res) {
        const {
            jadwal_operasi_id,
            kategori,
            jenis_anasthesi,
            operator_1_id,
            operator_2_id,
            operator_3_id,
            dokter_anastesi_id,
            dokter_anak_id,
            bidan_1_id,
            bidan_2_id,
            bidan_3_id,
            perawat_luar_id,
            instrumen_id,
            dokter_umum_id,
            pre_diagnosa_id,
            post_diagnosa_id,
            eksisi_ensisi,
            pemeriksaan_pa,
            ast_operator_1_id,
            ast_operator_2_id,
            ast_operator_3_id,
            ast_anastesi_1_id,
            ast_anastesi_2_id,
            prw_resusitasi_id,
            onloop_1_id,
            onloop_2_id,
            onloop_3_id,
            onloop_4_id,
            onloop_5_id,
            tanggal_selesai,
            laporan_operasi
        } = req.body;

        try {
            const jadwalOperasi = await HasilOperasi.create({ 
                id: uuid_v4(),
                jadwal_operasi_id,
                kategori,
                jenis_anasthesi,
                operator_1_id,
                operator_2_id,
                operator_3_id,
                dokter_anastesi_id,
                dokter_anak_id,
                bidan_1_id,
                bidan_2_id,
                bidan_3_id,
                perawat_luar_id,
                instrumen_id,
                dokter_umum_id,
                pre_diagnosa_id,
                post_diagnosa_id,
                eksisi_ensisi,
                pemeriksaan_pa,
                ast_operator_1_id,
                ast_operator_2_id,
                ast_operator_3_id,
                ast_anastesi_1_id,
                ast_anastesi_2_id,
                prw_resusitasi_id,
                onloop_1_id,
                onloop_2_id,
                onloop_3_id,
                onloop_4_id,
                onloop_5_id,
                tanggal_selesai,
                laporan_operasi
            });
            res.status(200).json({ status: 200, message: "Sukses", data: jadwalOperasi });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "Gagal", data: error });
        }
    }

    static async update(req, res) {
        const { id, mapping_operasi, ...updateData } = req.body;

        try {
            await HasilOperasi.update(updateData, { where: { id } });
            res.status(200).json({ status: 200, message: "Sukses" });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "Gagal", data: error });
        }
    }

    static async update_mapping_operasi(req, res) {
        const { id, jadwal_operasi_id, mapping_operasi } = req.body;

        // CREATE OR UPDATE
        try {
            const check = await HasilOperasi.findOne({
                attributes: ['id'],
                where: { jadwal_operasi_id }
            });
            console.log('===> controller.js:167 ~ check', check);
            console.log('===> controller.js:169 ~ mapping_operasi', mapping_operasi);
            if (check !== null) {
                await HasilOperasi.update({ mapping_operasi }, { where: { jadwal_operasi_id } });
            } else {
                await HasilOperasi.create({ id: uuid_v4(), jadwal_operasi_id, mapping_operasi });
            }
            res.status(200).json({ status: 200, message: "Sukses" });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "Gagal", data: error });
        }
    }

    static async list(req, res) {
        const { halaman, jumlah, jadwal_operasi_id,
            operator_1_id,
            operator_2_id,
            operator_3_id,
            dokter_anastesi_id,
            dokter_anak_id,
            bidan_1_id,
            bidan_2_id,
            bidan_3_id,
            perawat_luar_id,
            instrumen_id,
            dokter_umum_id,
            pre_diagnosa_id,
            post_diagnosa_id, } = req.body;
        try {
            let isi = '';
            let offset = '';
            let pagination = '';
            if (halaman && jumlah) {
                offset = (+halaman - 1) * jumlah;
                pagination = `limit ${jumlah} offset ${offset}`;
            }

            if (jadwal_operasi_id) isi += ` and mb.jadwal_operasi_id = '%${jadwal_operasi_id}%'`;
            if (operator_1_id) isi += ` and mb.operator_1_id = '%${operator_1_id}%'`;
            if (operator_2_id) isi += ` and mb.operator_2_id = '%${operator_2_id}%'`;
            if (operator_3_id) isi += ` and mb.operator_3_id = '%${operator_3_id}%'`;
            if (dokter_anastesi_id) isi += ` and mb.dokter_anastesi_id = '%${dokter_anastesi_id}%'`;
            if (dokter_anak_id) isi += ` and mb.dokter_anak_id = '%${dokter_anak_id}%'`;
            if (bidan_1_id) isi += ` and mb.bidan_1_id = '%${bidan_1_id}%'`;
            if (bidan_2_id) isi += ` and mb.bidan_2_id = '%${bidan_2_id}%'`;
            if (bidan_3_id) isi += ` and mb.bidan_3_id = '%${bidan_3_id}%'`;
            if (perawat_luar_id) isi += ` and mb.perawat_luar_id = '%${perawat_luar_id}%'`;
            if (instrumen_id) isi += ` and mb.instrumen_id = '%${instrumen_id}%'`;
            if (dokter_umum_id) isi += ` and mb.dokter_umum_id = '%${dokter_umum_id}%'`;
            if (pre_diagnosa_id) isi += ` and mb.pre_diagnosa_id = '%${pre_diagnosa_id}%'`;
            if (post_diagnosa_id) isi += ` and mb.post_diagnosa_id = '%${post_diagnosa_id}%'`;

            let data = await sq.query(`
                SELECT
                    ho.id as hasil_operasi_id,
                    ho.*,

                    md1.nama_dokter as operator_1_nama,
                    md2.nama_dokter as operator_2_nama,
                    md3.nama_dokter as operator_3_nama,
                    md4.nama_dokter as dokter_anastesi_nama,
                    md5.nama_dokter as dokter_anak_nama,
                    md6.nama_dokter as bidan_1_nama,
                    md7.nama_dokter as bidan_2_nama,
                    md8.nama_dokter as bidan_3_nama,
                    md9.nama_dokter as perawat_luar_nama,
                    md10.nama_dokter as instrumen_nama,
                    md11.nama_dokter as dokter_umum_nama,
                    md12.nama_dokter as ast_operator_1_nama,
                    md13.nama_dokter as ast_operator_2_nama,
                    md14.nama_dokter as ast_operator_3_nama,
                    md15.nama_dokter as ast_anastesi_1_nama,
                    md16.nama_dokter as ast_anastesi_2_nama,
                    md17.nama_dokter as prw_resusitasi_nama,
                    md18.nama_dokter as onloop_1_nama,
                    md19.nama_dokter as onloop_2_nama,
                    md20.nama_dokter as onloop_3_nama,
                    md21.nama_dokter as onloop_4_nama,
                    md22.nama_dokter as onloop_5_nama,
                    md23.nama_dokter as dokter_pj_anak_nama,

                    pd.nama_diagnosa as pre_diagnosa_nama,
                    pd.kode_diagnosa as pre_diagnosa_kode,
                    posd.nama_diagnosa as post_diagnosa_nama,
                    posd.kode_diagnosa as post_diagnosa_kode
                FROM
                    hasil_operasi ho
                    LEFT JOIN jadwal_operasi jo ON ho.jadwal_operasi_id = jo.id
                    
                    LEFT JOIN ms_dokter md1 on md1.id = ho.operator_1_id
                    LEFT JOIN ms_dokter md2 on md2.id = ho.operator_2_id
                    LEFT JOIN ms_dokter md3 on md3.id = ho.operator_3_id
                    LEFT JOIN ms_dokter md4 on md4.id = ho.dokter_anastesi_id
                    LEFT JOIN ms_dokter md5 on md5.id = ho.dokter_anak_id
                    LEFT JOIN ms_dokter md6 on md6.id = ho.bidan_1_id
                    LEFT JOIN ms_dokter md7 on md7.id = ho.bidan_2_id
                    LEFT JOIN ms_dokter md8 on md8.id = ho.bidan_3_id
                    LEFT JOIN ms_dokter md9 on md9.id = ho.perawat_luar_id
                    LEFT JOIN ms_dokter md10 on md10.id = ho.instrumen_id
                    LEFT JOIN ms_dokter md11 on md11.id = ho.dokter_umum_id
                    LEFT JOIN ms_dokter md12 on md12.id = ho.ast_operator_1_id
                    LEFT JOIN ms_dokter md13 on md13.id = ho.ast_operator_2_id
                    LEFT JOIN ms_dokter md14 on md14.id = ho.ast_operator_3_id
                    LEFT JOIN ms_dokter md15 on md15.id = ho.ast_anastesi_1_id
                    LEFT JOIN ms_dokter md16 on md16.id = ho.ast_anastesi_2_id
                    LEFT JOIN ms_dokter md17 on md17.id = ho.prw_resusitasi_id
                    LEFT JOIN ms_dokter md18 on md18.id = ho.onloop_1_id
                    LEFT JOIN ms_dokter md19 on md19.id = ho.onloop_2_id
                    LEFT JOIN ms_dokter md20 on md20.id = ho.onloop_3_id
                    LEFT JOIN ms_dokter md21 on md21.id = ho.onloop_4_id
                    LEFT JOIN ms_dokter md22 on md22.id = ho.onloop_5_id
                    LEFT JOIN ms_dokter md23 on md23.id = ho.dokter_pj_anak_id

                    LEFT JOIN ms_diagnosa pd ON ho.pre_diagnosa_id = pd.id
                    LEFT JOIN ms_diagnosa posd ON ho.post_diagnosa_id = posd.id
        
                where ho."deletedAt" isnull${isi} 
                order by ho."createdAt" desc ${pagination}`, s);
            let jml = await sq.query(`
                select count(*) 
                from hasil_operasi ho
                    LEFT JOIN jadwal_operasi jo ON ho.jadwal_operasi_id = jo.id
                    LEFT JOIN ms_dokter md1 ON ho.operator_1_id = md1.id
                    LEFT JOIN ms_dokter md2 ON ho.operator_2_id = md2.id
                    LEFT JOIN ms_dokter md3 ON ho.operator_3_id = md3.id
                    LEFT JOIN ms_dokter mda ON ho.dokter_anastesi_id = mda.id
                    LEFT JOIN ms_dokter mdka ON ho.dokter_anak_id = mdka.id
                    LEFT JOIN ms_dokter mdb1 ON ho.bidan_1_id = mdb1.id
                    LEFT JOIN ms_dokter mdb2 ON ho.bidan_2_id = mdb2.id
                    LEFT JOIN ms_dokter mdb3 ON ho.bidan_3_id = mdb3.id
                    LEFT JOIN ms_dokter mdl ON ho.perawat_luar_id = mdl.id
                    LEFT JOIN ms_dokter mdi ON ho.instrumen_id = mdi.id
                    LEFT JOIN ms_dokter mdu ON ho.dokter_umum_id = mdu.id
                    LEFT JOIN ms_diagnosa pd ON ho.pre_diagnosa_id = pd.id
                    LEFT JOIN ms_diagnosa posd ON ho.post_diagnosa_id = posd.id
                where ho."deletedAt" isnull${isi}`, s);

            res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].count, jumlah, halaman });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error });
        }
    }

    static async detailsById(req, res) {
        const { id } = req.body;
        try {
            let data = await sq.query(`
            select 
                ho.id as hasil_operasi_id,
                ho.*,
                md1.nama_dokter as operator_1_nama,
                md2.nama_dokter as operator_2_nama,
                md3.nama_dokter as operator_3_nama,
                mda.nama_dokter as dokter_anastesi_nama,
                mdka.nama_dokter as dokter_anak_nama,
                mdb1.nama_dokter as bidan_1_nama,
                mdb2.nama_dokter as bidan_2_nama,
                mdb3.nama_dokter as bidan_3_nama,
                mdl.nama_dokter as perawat_luar_nama,
                mdi.nama_dokter as instrumen_nama,
                mdu.nama_dokter as dokter_umum_nama,
                pd.nama_diagnosa as pre_diagnosa_nama,
                pd.kode_diagnosa as pre_diagnosa_kode,
                posd.nama_diagnosa as post_diagnosa_nama,
                posd.kode_diagnosa as post_diagnosa_kode
            from hasil_operasi ho
                LEFT JOIN jadwal_operasi jo ON ho.jadwal_operasi_id = jo.id
                LEFT JOIN ms_dokter md1 ON ho.operator_1_id = md1.id
                LEFT JOIN ms_dokter md2 ON ho.operator_2_id = md2.id
                LEFT JOIN ms_dokter md3 ON ho.operator_3_id = md3.id
                LEFT JOIN ms_dokter mda ON ho.dokter_anastesi_id = mda.id
                LEFT JOIN ms_dokter mdka ON ho.dokter_anak_id = mdka.id
                LEFT JOIN ms_dokter mdb1 ON ho.bidan_1_id = mdb1.id
                LEFT JOIN ms_dokter mdb2 ON ho.bidan_2_id = mdb2.id
                LEFT JOIN ms_dokter mdb3 ON ho.bidan_3_id = mdb3.id
                LEFT JOIN ms_dokter mdl ON ho.perawat_luar_id = mdl.id
                LEFT JOIN ms_dokter mdi ON ho.instrumen_id = mdi.id
                LEFT JOIN ms_dokter mdu ON ho.dokter_umum_id = mdu.id
                LEFT JOIN ms_diagnosa pd ON ho.pre_diagnosa_id = pd.id
                LEFT JOIN ms_diagnosa posd ON ho.post_diagnosa_id = posd.id
            where ho."deletedAt" isnull and ho.id = '${id}'`, s);
            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error });
        }
    }

    static async detailsByJadwalOperasiId(req, res) {
        const { jadwal_operasi_id } = req.body;
        try {
            let data = await sq.query(`
            select 
                ho.id as hasil_operasi_id,
                ho.*,
                
                md1.nama_dokter as operator_1_nama,
                md2.nama_dokter as operator_2_nama,
                md3.nama_dokter as operator_3_nama,
                md4.nama_dokter as dokter_anastesi_nama,
                md5.nama_dokter as dokter_anak_nama,
                md6.nama_dokter as bidan_1_nama,
                md7.nama_dokter as bidan_2_nama,
                md8.nama_dokter as bidan_3_nama,
                md9.nama_dokter as perawat_luar_nama,
                md10.nama_dokter as instrumen_nama,
                md11.nama_dokter as dokter_umum_nama,
                md12.nama_dokter as ast_operator_1_nama,
                md13.nama_dokter as ast_operator_2_nama,
                md14.nama_dokter as ast_operator_3_nama,
                md15.nama_dokter as ast_anastesi_1_nama,
                md16.nama_dokter as ast_anastesi_2_nama,
                md17.nama_dokter as prw_resusitasi_nama,
                md18.nama_dokter as onloop_1_nama,
                md19.nama_dokter as onloop_2_nama,
                md20.nama_dokter as onloop_3_nama,
                md21.nama_dokter as onloop_4_nama,
                md22.nama_dokter as onloop_5_nama,
                md23.nama_dokter as dokter_pj_anak_nama,
                
                pd.nama_diagnosa as pre_diagnosa_nama,
                pd.kode_diagnosa as pre_diagnosa_kode,
                posd.nama_diagnosa as post_diagnosa_nama,
                posd.kode_diagnosa as post_diagnosa_kode
            from hasil_operasi ho
                LEFT JOIN jadwal_operasi jo ON ho.jadwal_operasi_id = jo.id
                
                LEFT JOIN ms_dokter md1 on md1.id = ho.operator_1_id
                LEFT JOIN ms_dokter md2 on md2.id = ho.operator_2_id
                LEFT JOIN ms_dokter md3 on md3.id = ho.operator_3_id
                LEFT JOIN ms_dokter md4 on md4.id = ho.dokter_anastesi_id
                LEFT JOIN ms_dokter md5 on md5.id = ho.dokter_anak_id
                LEFT JOIN ms_dokter md6 on md6.id = ho.bidan_1_id
                LEFT JOIN ms_dokter md7 on md7.id = ho.bidan_2_id
                LEFT JOIN ms_dokter md8 on md8.id = ho.bidan_3_id
                LEFT JOIN ms_dokter md9 on md9.id = ho.perawat_luar_id
                LEFT JOIN ms_dokter md10 on md10.id = ho.instrumen_id
                LEFT JOIN ms_dokter md11 on md11.id = ho.dokter_umum_id
                LEFT JOIN ms_dokter md12 on md12.id = ho.ast_operator_1_id
                LEFT JOIN ms_dokter md13 on md13.id = ho.ast_operator_2_id
                LEFT JOIN ms_dokter md14 on md14.id = ho.ast_operator_3_id
                LEFT JOIN ms_dokter md15 on md15.id = ho.ast_anastesi_1_id
                LEFT JOIN ms_dokter md16 on md16.id = ho.ast_anastesi_2_id
                LEFT JOIN ms_dokter md17 on md17.id = ho.prw_resusitasi_id
                LEFT JOIN ms_dokter md18 on md18.id = ho.onloop_1_id
                LEFT JOIN ms_dokter md19 on md19.id = ho.onloop_2_id
                LEFT JOIN ms_dokter md20 on md20.id = ho.onloop_3_id
                LEFT JOIN ms_dokter md21 on md21.id = ho.onloop_4_id
                LEFT JOIN ms_dokter md22 on md22.id = ho.onloop_5_id
                LEFT JOIN ms_dokter md23 on md23.id = ho.dokter_pj_anak_id
                
                LEFT JOIN ms_diagnosa pd ON ho.pre_diagnosa_id = pd.id
                LEFT JOIN ms_diagnosa posd ON ho.post_diagnosa_id = posd.id
            where ho."deletedAt" isnull and ho.jadwal_operasi_id = '${jadwal_operasi_id}'`, s);
            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error });
        }
    }

    static async delete(req, res) {
        const { id } = req.body;
        try {
            await HasilOperasi.destroy({ where: { id } });
            res.status(200).json({ status: 200, message: "sukses" });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error });
        }
    }

    // Laporan Operasi - Rekap Data Hasil Operasi
    static async laporanRekap(req, res) {
        const {
            halaman,
            jumlah,
            tanggal_mulai,
            tanggal_selesai,
            ms_ruang_id,
            ms_dokter_id,
            kategori,
            jenis_anasthesi,
            cari
        } = req.body

        try {
            let offset = ''
            let pagination = ''
            if (halaman && jumlah) {
                offset = (+halaman - 1) * jumlah;
                pagination = `limit ${jumlah} offset ${offset}`
            }

            let whereClause = '';

            // Filter berdasarkan tanggal operasi
            if (tanggal_mulai && tanggal_selesai) {
                whereClause += ` and jo.tanggal_operasi::date >= '${tanggal_mulai}' and jo.tanggal_operasi::date <= '${tanggal_selesai}'`;
            } else if (tanggal_mulai) {
                whereClause += ` and jo.tanggal_operasi::date >= '${tanggal_mulai}'`;
            } else if (tanggal_selesai) {
                whereClause += ` and jo.tanggal_operasi::date <= '${tanggal_selesai}'`;
            }

            // Filter berdasarkan ruangan
            if (ms_ruang_id) {
                whereClause += ` and jo.ms_ruang_id = '${ms_ruang_id}'`;
            }

            // Filter berdasarkan dokter operator utama
            if (ms_dokter_id) {
                whereClause += ` and ho.operator_1_id = '${ms_dokter_id}'`;
            }

            // Filter berdasarkan kategori operasi
            if (kategori) {
                whereClause += ` and ho.kategori = '${kategori}'`;
            }

            // Filter berdasarkan jenis anestesi
            if (jenis_anasthesi) {
                whereClause += ` and ho.jenis_anasthesi ilike '%${jenis_anasthesi}%'`;
            }

            // Pencarian berdasarkan nama pasien atau kode booking
            if (cari) {
                whereClause += ` and (lower(p.nama) like lower('%${cari}%') or lower(jo.kode_booking) like lower('%${cari}%'))`;
            }

            // Hanya yang sudah ada hasil operasi dan selesai

            let data = await sq.query(`
                select
                    jo.id as jadwal_operasi_id,
                    jo.kode_booking,
                    jo.tanggal_operasi,
                    jo.waktu_mulai,
                    jo.waktu_selesai,
                    jo.status,
                    -- Data pasien
                    p.id as pasien_id,
                    p.no_rm,
                    p.nama as nama_pasien,
                    p.tanggal_lahir,
                    p.jenis_kelamin,
                    p.umur as umur_pasien,
                    -- Data registrasi
                    r.id as registrasi_id,
                    r.no_registrasi,
                    -- Data ruangan dan fasilitas
                    ru.nama_ruang,
                    k.nama_kelas,
                    -- Data hasil operasi
                    ho.id as hasil_operasi_id,
                    ho.kategori as kategori_operasi,
                    ho.jenis_anasthesi,
                    ho.eksisi_ensisi,
                    ho.pemeriksaan_pa,
                    ho.tanggal_selesai as tanggal_selesai_operasi,
                    ho.laporan_operasi,
                    -- Data dokter operator
                    d1.nama_dokter as operator_1_nama,
                    d2.nama_dokter as operator_2_nama,
                    d3.nama_dokter as operator_3_nama,
                    -- Data dokter anestesi
                    da.nama_dokter as dokter_anestesi_nama,
                    -- Data diagnosa
                    pd.kode_diagnosa as pre_diagnosa_kode,
                    pd.nama_diagnosa as pre_diagnosa_nama,
                    pod.kode_diagnosa as post_diagnosa_kode,
                    pod.nama_diagnosa as post_diagnosa_nama,
                    -- Data poliklinik
                    pol.nama_poliklinik,
                    -- Durasi operasi dalam menit
                    EXTRACT(EPOCH FROM (ho.tanggal_selesai - jo.tanggal_operasi))/60 as durasi_menit,
                    -- Label status
                    case
                        when jo.status = 3 then 'Selesai'
                        else 'Lainnya'
                    end as status_label,
                    -- Umur pasien dalam tahun
                    EXTRACT(YEAR FROM AGE(p.tanggal_lahir)) as umur_tahun,
                    -- Hitung jumlah tim medis
                    (
                        select count(*)
                        from unnest(ARRAY[
                            ho.operator_1_id, ho.operator_2_id, ho.operator_3_id,
                            ho.dokter_anastesi_id, ho.dokter_anak_id, ho.bidan_1_id,
                            ho.bidan_2_id, ho.bidan_3_id, ho.perawat_luar_id,
                            ho.instrumen_id, ho.dokter_umum_id
                        ]) as tim_id
                        where tim_id is not null
                    ) as jumlah_tim_medis
                from hasil_operasi ho
                inner join jadwal_operasi jo on ho.jadwal_operasi_id = jo.id
                inner join registrasi r on jo.registrasi_id = r.id
                inner join pasien p on r.pasien_id = p.id
                left join ms_ruang ru on jo.ms_ruang_id = ru.id
                left join ms_kelas_kamar k on jo.ms_kelas_kamar_id = k.id
                left join ms_poliklinik pol on jo.ms_poliklinik_id = pol.id
                left join ms_dokter d1 on ho.operator_1_id = d1.id
                left join ms_dokter d2 on ho.operator_2_id = d2.id
                left join ms_dokter d3 on ho.operator_3_id = d3.id
                left join ms_dokter da on ho.dokter_anastesi_id = da.id
                left join ms_diagnosa pd on ho.pre_diagnosa_id = pd.id
                left join ms_diagnosa pod on ho.post_diagnosa_id = pod.id
                where ho."deletedAt" isnull and jo."deletedAt" isnull ${whereClause}
                order by jo.tanggal_operasi desc, jo.waktu_mulai desc
                ${pagination}
            `, s)

            let jml = await sq.query(`
                select count(*)
                from hasil_operasi ho
                inner join jadwal_operasi jo on ho.jadwal_operasi_id = jo.id
                inner join registrasi r on jo.registrasi_id = r.id
                inner join pasien p on r.pasien_id = p.id
                left join ms_ruang ru on jo.ms_ruang_id = ru.id
                left join ms_kelas_kamar k on jo.ms_kelas_kamar_id = k.id
                left join ms_poliklinik pol on jo.ms_poliklinik_id = pol.id
                left join ms_dokter d1 on ho.operator_1_id = d1.id
                left join ms_dokter da on ho.dokter_anastesi_id = da.id
                where ho."deletedAt" isnull and jo."deletedAt" isnull ${whereClause}
            `, s)

            // Get summary statistics
            let summary = await sq.query(`
                select
                    count(*) as total_operasi,
                    count(distinct ho.operator_1_id) as total_dokter,
                    count(distinct jo.ms_ruang_id) as total_ruang,
                    count(distinct jo.tanggal_operasi::date) as total_hari,
                    avg(EXTRACT(EPOCH FROM (ho.tanggal_selesai - jo.tanggal_operasi))/60) as rata_durasi_menit,
                    count(case when ho.kategori = 'Besar' then 1 end) as operasi_besar,
                    count(case when ho.kategori = 'Kecil' then 1 end) as operasi_kecil,
                    count(case when ho.pemeriksaan_pa = 'Ya' then 1 end) as pemeriksaan_pa,
                    min(jo.tanggal_operasi) as tanggal_awal,
                    max(jo.tanggal_operasi) as tanggal_akhir
                from hasil_operasi ho
                inner join jadwal_operasi jo on ho.jadwal_operasi_id = jo.id
                where ho."deletedAt" isnull and jo."deletedAt" isnull ${whereClause}
            `, s)

            res.status(200).json({
                status: 200,
                message: "sukses",
                data,
                summary: summary[0],
                count: jml[0].count,
                jumlah,
                halaman
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    // Export Laporan Operasi ke Excel
    static async laporanRekapExport(req, res) {
        const {
            tanggal_mulai,
            tanggal_selesai,
            ms_ruang_id,
            ms_dokter_id,
            kategori,
            jenis_anasthesi,
            cari,
            format = 'excel'
        } = req.body

        try {
            let whereClause = '';

            // Filter berdasarkan tanggal operasi
            if (tanggal_mulai && tanggal_selesai) {
                whereClause += ` and jo.tanggal_operasi::date >= '${tanggal_mulai}' and jo.tanggal_operasi::date <= '${tanggal_selesai}'`;
            } else if (tanggal_mulai) {
                whereClause += ` and jo.tanggal_operasi::date >= '${tanggal_mulai}'`;
            } else if (tanggal_selesai) {
                whereClause += ` and jo.tanggal_operasi::date <= '${tanggal_selesai}'`;
            }

            // Filter berdasarkan ruangan
            if (ms_ruang_id) {
                whereClause += ` and jo.ms_ruang_id = '${ms_ruang_id}'`;
            }

            // Filter berdasarkan dokter operator utama
            if (ms_dokter_id) {
                whereClause += ` and ho.operator_1_id = '${ms_dokter_id}'`;
            }

            // Filter berdasarkan kategori operasi
            if (kategori) {
                whereClause += ` and ho.kategori = '${kategori}'`;
            }

            // Filter berdasarkan jenis anestesi
            if (jenis_anasthesi) {
                whereClause += ` and ho.jenis_anasthesi ilike '%${jenis_anasthesi}%'`;
            }

            // Pencarian berdasarkan nama pasien atau kode booking
            if (cari) {
                whereClause += ` and (lower(p.nama) like lower('%${cari}%') or lower(jo.kode_booking) like lower('%${cari}%'))`;
            }

            // Hanya yang sudah ada hasil operasi dan selesai
            // whereClause += ` and jo.status = 3 and ho.id is not null`;

            console.log(`select
                    jo.kode_booking,
                    jo.tanggal_operasi,
                    jo.waktu_mulai,
                    jo.waktu_selesai,
                    p.no_rm,
                    p.nama_lengkap as nama_pasien,
                    p.jenis_kelamin,
                    extract(year from AGE(p.tgl_lahir)) as umur_tahun,
                    r.no_kunjungan as no_registrasi,
                    ru.nama_ruang,
                    k.nama_kelas_kamar as nama_kelas,
                    pol.nama_poliklinik,
                    ho.kategori as kategori_operasi,
                    ho.jenis_anasthesi,
                    ho.eksisi_ensisi,
                    ho.pemeriksaan_pa,
                    ho.tanggal_selesai as tanggal_selesai_operasi,
                    d1.nama_dokter as operator_1_nama,
                    d2.nama_dokter as operator_2_nama,
                    d3.nama_dokter as operator_3_nama,
                    da.nama_dokter as dokter_anestesi_nama,
                    pd.kode_diagnosa as pre_diagnosa_kode,
                    pd.nama_diagnosa as pre_diagnosa_nama,
                    pod.kode_diagnosa as post_diagnosa_kode,
                    pod.nama_diagnosa as post_diagnosa_nama,
                    extract(EPOCH from (ho.tanggal_selesai - jo.tanggal_operasi))/ 60 as durasi_menit,
                    ho.laporan_operasi
                from jadwal_operasi jo
                left join hasil_operasi ho on ho.jadwal_operasi_id = jo.id
                inner join registrasi r on jo.registrasi_id = r.id
                join pasien p on r.pasien_id = p.id
                left join ms_ruang ru on jo.ms_ruang_id = ru.id
                left join ms_kelas_kamar k on jo.ms_kelas_kamar_id = k.id
                left join ms_poliklinik pol on jo.ms_poliklinik_id = pol.id
                left join ms_dokter d1 on ho.operator_1_id = d1.id
                left join ms_dokter d2 on ho.operator_2_id = d2.id
                left join ms_dokter d3 on ho.operator_3_id = d3.id
                left join ms_dokter da on ho.dokter_anastesi_id = da.id
                left join ms_diagnosa pd on ho.pre_diagnosa_id = pd.id
                left join ms_diagnosa pod on ho.post_diagnosa_id = pod.id
                where ho."deletedAt" isnull and jo."deletedAt" isnull ${whereClause}
                order by jo.tanggal_operasi desc, jo.waktu_mulai desc`)

            let data = await sq.query(`
                select
                    jo.kode_booking,
                    jo.tanggal_operasi,
                    jo.waktu_mulai,
                    jo.waktu_selesai,
                    p.no_rm,
                    p.nama_lengkap as nama_pasien,
                    p.jenis_kelamin,
                    extract(year from AGE(p.tgl_lahir)) as umur_tahun,
                    r.no_kunjungan as no_registrasi,
                    ru.nama_ruang,
                    k.nama_kelas_kamar as nama_kelas,
                    pol.nama_poliklinik,
                    ho.kategori as kategori_operasi,
                    ho.jenis_anasthesi,
                    ho.eksisi_ensisi,
                    ho.pemeriksaan_pa,
                    ho.tanggal_selesai as tanggal_selesai_operasi,
                    d1.nama_dokter as operator_1_nama,
                    d2.nama_dokter as operator_2_nama,
                    d3.nama_dokter as operator_3_nama,
                    da.nama_dokter as dokter_anestesi_nama,
                    pd.kode_diagnosa as pre_diagnosa_kode,
                    pd.nama_diagnosa as pre_diagnosa_nama,
                    pod.kode_diagnosa as post_diagnosa_kode,
                    pod.nama_diagnosa as post_diagnosa_nama,
                    extract(EPOCH from (ho.tanggal_selesai - jo.tanggal_operasi))/ 60 as durasi_menit,
                    ho.laporan_operasi
                from jadwal_operasi jo
                left join hasil_operasi ho on ho.jadwal_operasi_id = jo.id
                inner join registrasi r on jo.registrasi_id = r.id
                join pasien p on r.pasien_id = p.id
                left join ms_ruang ru on jo.ms_ruang_id = ru.id
                left join ms_kelas_kamar k on jo.ms_kelas_kamar_id = k.id
                left join ms_poliklinik pol on jo.ms_poliklinik_id = pol.id
                left join ms_dokter d1 on ho.operator_1_id = d1.id
                left join ms_dokter d2 on ho.operator_2_id = d2.id
                left join ms_dokter d3 on ho.operator_3_id = d3.id
                left join ms_dokter da on ho.dokter_anastesi_id = da.id
                left join ms_diagnosa pd on ho.pre_diagnosa_id = pd.id
                left join ms_diagnosa pod on ho.post_diagnosa_id = pod.id
                where ho."deletedAt" isnull and jo."deletedAt" isnull ${whereClause}
                order by jo.tanggal_operasi desc, jo.waktu_mulai desc
            `, s)

            if (data.length === 0) {
                return res.status(404).json({ status: 404, message: "Tidak ada data untuk diekspor" })
            }

            // Buat workbook Excel
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Laporan Hasil Operasi');

            // Set headers
            const headers = [
                'No', 'Kode Booking', 'Tanggal Operasi', 'Waktu Mulai', 'Waktu Selesai',
                'No RM', 'Nama Pasien', 'Jenis Kelamin', 'Umur', 'No Registrasi',
                'Ruang Operasi', 'Kelas', 'Poliklinik', 'Kategori Operasi', 'Jenis Anestesi',
                'Eksisi/Ensisi', 'Pemeriksaan PA', 'Tanggal Selesai', 'Operator 1',
                'Operator 2', 'Operator 3', 'Dokter Anestesi', 'Pre Diagnosa Kode',
                'Pre Diagnosa', 'Post Diagnosa Kode', 'Post Diagnosa', 'Durasi (Menit)',
                'Laporan Operasi'
            ];

            worksheet.addRow(headers);

            // Style header
            const headerRow = worksheet.getRow(1);
            headerRow.font = { bold: true };
            headerRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE6E6FA' }
            };
            headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
            headerRow.height = 25;

            // Add data rows
            data.forEach((item, index) => {
                worksheet.addRow([
                    index + 1,
                    item.kode_booking || '',
                    moment(item.tanggal_operasi).format('DD-MM-YYYY'),
                    item.waktu_mulai || '',
                    item.waktu_selesai || '',
                    item.no_rm || '',
                    item.nama_pasien || '',
                    item.jenis_kelamin || '',
                    item.umur_tahun || 0,
                    item.no_registrasi || '',
                    item.nama_ruang || '',
                    item.nama_kelas || '',
                    item.nama_poliklinik || '',
                    item.kategori_operasi || '',
                    item.jenis_anasthesi || '',
                    item.eksisi_ensisi || '',
                    item.pemeriksaan_pa || '',
                    moment(item.tanggal_selesai_operasi).format('DD-MM-YYYY HH:mm'),
                    item.operator_1_nama || '',
                    item.operator_2_nama || '',
                    item.operator_3_nama || '',
                    item.dokter_anestesi_nama || '',
                    item.pre_diagnosa_kode || '',
                    item.pre_diagnosa_nama || '',
                    item.post_diagnosa_kode || '',
                    item.post_diagnosa_nama || '',
                    Math.round(item.durasi_menit || 0),
                    item.laporan_operasi || ''
                ]);
            });

            // Auto-fit columns
            worksheet.columns.forEach(column => {
                let maxLength = 0;
                column.eachCell({ includeEmpty: false }, cell => {
                    let columnLength = cell.value ? cell.value.toString().length : 0;
                    if (columnLength > maxLength) {
                        maxLength = columnLength;
                    }
                });
                column.width = maxLength < 10 ? 10 : maxLength + 2;
            });

            // Add borders to all cells
            worksheet.eachRow((row, rowNumber) => {
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            });

            // Generate filename
            const filename = `Laporan_Hasil_Operasi_${moment().format('DD-MM-YYYY_HH-mm-ss')}.xlsx`;

            // Set response headers
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

            // Send file
            await workbook.xlsx.write(res);
            res.end();

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal mengekspor data", data: error })
        }
    }
}

module.exports = Controller;
