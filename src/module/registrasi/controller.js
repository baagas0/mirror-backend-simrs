// @collapse
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const registrasi = require("./model");
const antrianList = require("../antrian_list/model");
const historyBed = require("../history_bed/model");
const msBed = require("../ms_bed/model");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };
const moment = require("moment");
const triage = require("../triage/model");


class Controller {

    static async register(req, res) {
        const { tgl_registrasi, no_identitas_registrasi, no_hp_registrasi, no_sep, no_asuransi_registrasi, no_rujukan, no_kontrol, no_antrian, keterangan_registrasi, id_faskes_perujuk, booking_id, ms_jenis_layanan_id, kelas_kunjungan_id, pasien_id, ms_dokter_id, ms_spesialis_id, ms_asuransi_id, ms_bed_id, tanggal_mulai, kode_jenis_layanan, antrian_loket_id, initial_registrasi } = req.body

        const t = await sq.transaction()

        try {
            let tgl = moment(tgl_registrasi).format('YYYY-MM-DD')
            let cekPasien = await sq.query(`select * from registrasi r where r."deletedAt" isnull and r.status_registrasi = 0 and date(r.tgl_registrasi) = '${tgl}' and r.pasien_id = '${pasien_id}'`, s);

            let cekBed = await sq.query(`select * from history_bed hb where hb."deletedAt" isnull and hb.status_checkout = 0 and hb.ms_bed_id='${ms_bed_id}'`, s);
            if(cekBed.length>0){
                res.status(201).json({ status: 204, message: "Bed sudah terpakai" });
            }
            if (cekPasien.length > 0) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                let data = await registrasi.create({ id: uuid_v4(), tgl_registrasi, no_identitas_registrasi, no_hp_registrasi, no_sep, no_asuransi_registrasi, no_rujukan, no_kontrol, no_antrian, keterangan_registrasi, id_faskes_perujuk, booking_id, ms_jenis_layanan_id, kelas_kunjungan_id, pasien_id, ms_dokter_id, ms_spesialis_id, ms_asuransi_id, no_kunjungan, dibuat_oleh: req.dataUsers.username, antrian_loket_id, initial_registrasi }, { transaction: t })

                if (kode_jenis_layanan == 'RINAP') {
                    await historyBed.create({ id: uuid_v4(), registrasi_id: data.id, ms_bed_id, tanggal_mulai, status_checkout: 1 }, { transaction: t })
                    await msBed.update({ status_bed: 1 }, { where: { id: ms_bed_id }, transaction: t })
                }

                await t.commit()
                res.status(200).json({ status: 200, message: "sukses", data });
            }
        } catch (err) {
            await t.rollback()
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async registerRanap(req, res) {
        const { tipe_kelas_kamar, tgl_registrasi, no_identitas_registrasi, no_hp_registrasi, no_sep, no_asuransi_registrasi, no_rujukan, no_kontrol, keterangan_registrasi, id_faskes_perujuk, booking_id, ms_jenis_layanan_id, kelas_kunjungan_id, pasien_id, ms_dokter_id, ms_spesialis_id, ms_asuransi_id,ms_bed_id, antrian_loket_id, initial_registrasi } = req.body

        const t = await sq.transaction();
        try {
            let cekBed = await sq.query(`select * from history_bed hb where hb."deletedAt" isnull and hb.status_checkout = 0 and hb.ms_bed_id='${ms_bed_id}'`, s);
            if(cekBed.length>0){
                return res.status(201).json({ status: 204, message: "Bed sudah terpakai" });
            }
            let tgl = moment(tgl_registrasi).format('YYYY-MM-DD');
            let cekPasien = await sq.query(`select * from registrasi r where r."deletedAt" isnull and (r.status_registrasi = 1 or r.status_registrasi=2) and date(r.tgl_registrasi) = '${tgl}' and r.pasien_id = '${pasien_id}' and r.ms_jenis_layanan_id='${ms_jenis_layanan_id}'`, s);
            if (cekPasien.length > 0) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            }else{
                let data = await registrasi.create({ id: uuid_v4(), tipe_kelas_kamar, tgl_registrasi, no_identitas_registrasi, no_hp_registrasi, no_sep, no_asuransi_registrasi, no_rujukan, no_kontrol, keterangan_registrasi, id_faskes_perujuk, booking_id, ms_jenis_layanan_id, kelas_kunjungan_id, pasien_id, ms_dokter_id, ms_spesialis_id, ms_asuransi_id, dibuat_oleh: req.dataUsers.username, antrian_loket_id, initial_registrasi }, { transaction: t });
                
                if(ms_bed_id) {
                    let history_bed = await historyBed.create({id: uuid_v4(), tgl_mulai:tgl_registrasi, registrasi_id:data.dataValues.id, ms_bed_id }, { transaction: t })
                    console.log('history_bed')
                    console.log(history_bed)
                }
                res.status(200).json({ status: 200, message: "sukses", data });
            }
            await t.commit()
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async registerRajal (req, res) {
        const { tgl_registrasi, no_identitas_registrasi, no_hp_registrasi, no_sep, no_asuransi_registrasi, no_rujukan, no_kontrol, keterangan_registrasi, id_faskes_perujuk, booking_id, ms_jenis_layanan_id, kelas_kunjungan_id, pasien_id, ms_dokter_id, ms_spesialis_id, ms_asuransi_id, no_antrian, antrian_loket_id } = req.body

        try {
            let tgl = moment(tgl_registrasi).format('YYYY-MM-DD');
            let cekRegis = await sq.query(`select * from registrasi r where r."deletedAt" isnull and r.status_registrasi = 1 and date(r.tgl_registrasi) = '${tgl}' and r.pasien_id = '${pasien_id}' and r.ms_dokter_id = '${ms_dokter_id}'`, s);

            if (cekRegis.length > 0) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                let data = await registrasi.create({ id: uuid_v4(), tgl_registrasi, no_identitas_registrasi, no_hp_registrasi, no_sep, no_asuransi_registrasi, no_rujukan, no_kontrol, no_antrian, keterangan_registrasi, id_faskes_perujuk, booking_id, ms_jenis_layanan_id, kelas_kunjungan_id, pasien_id, ms_dokter_id, ms_spesialis_id, ms_asuransi_id, dibuat_oleh: req.dataUsers.username, antrian_loket_id });

                res.status(200).json({ status: 200, message: "sukses", data });
            }
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async registerIGD (req, res) {
        const { tgl_registrasi, no_identitas_registrasi, no_hp_registrasi, no_asuransi_registrasi, no_rujukan, keterangan_registrasi, id_faskes_perujuk, ms_jenis_layanan_id, kelas_kunjungan_id, pasien_id, ms_dokter_id, ms_spesialis_id, ms_asuransi_id, triage_id, sebab_sakit } = req.body

        try {
            let tgl = moment(tgl_registrasi).format('YYYY-MM-DD');
            let cekRegis = await sq.query(`select * from registrasi r where r."deletedAt" isnull and r.status_registrasi = 1 and date(r.tgl_registrasi) = '${tgl}' and r.pasien_id = '${pasien_id}' and r.ms_dokter_id = '${ms_dokter_id}'`, s);

            if (cekRegis.length > 0) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                await sq.transaction(async t =>{
                    let data = await registrasi.create({ id: uuid_v4(), tgl_registrasi, no_identitas_registrasi, no_hp_registrasi, no_asuransi_registrasi, no_rujukan, keterangan_registrasi, id_faskes_perujuk, ms_jenis_layanan_id, kelas_kunjungan_id, pasien_id, ms_dokter_id, ms_spesialis_id, ms_asuransi_id, dibuat_oleh: req.dataUsers.username, triage_id, sebab_sakit });
                    await triage.update({ is_registrasi: true }, { where: { id: !triage_id?null:triage_id } });
                    res.status(200).json({ status: 200, message: "sukses", data });
                })
            }
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async updateSatuSehat(req, res) {
        const { id, satu_sehat_id, satu_sehat_status, satu_sehat_last_payload, satu_sehat_condition_id, satu_sehat_observation_id, satu_sehat_request_service_id, satu_sehat_procedure_id, satu_sehat_tindak_lanjut_id, satu_sehat_clinical_impression_id, satu_sehat_diet_id, satu_sehat_kontrol_kembali_id, satu_sehat_alleri_intoleran_id } = req.body;
        try {
            // Create an empty object for the update fields
            let updateFields = {};
            
            // Only add fields to updateFields if they are not undefined or null
            if (satu_sehat_id !== undefined && satu_sehat_id !== null) updateFields.satu_sehat_id = satu_sehat_id;
            if (satu_sehat_status !== undefined && satu_sehat_status !== null) updateFields.satu_sehat_status = satu_sehat_status;
            if (satu_sehat_last_payload !== undefined && satu_sehat_last_payload !== null) updateFields.satu_sehat_last_payload = satu_sehat_last_payload;
            if (satu_sehat_condition_id !== undefined && satu_sehat_condition_id !== null) updateFields.satu_sehat_condition_id = satu_sehat_condition_id;
            if (satu_sehat_observation_id !== undefined && satu_sehat_observation_id !== null) updateFields.satu_sehat_observation_id = satu_sehat_observation_id;
            if (satu_sehat_request_service_id !== undefined && satu_sehat_request_service_id !== null) updateFields.satu_sehat_request_service_id = satu_sehat_request_service_id;
            if (satu_sehat_procedure_id !== undefined && satu_sehat_procedure_id !== null) updateFields.satu_sehat_procedure_id = satu_sehat_procedure_id;
            if (satu_sehat_tindak_lanjut_id !== undefined && satu_sehat_tindak_lanjut_id !== null) updateFields.satu_sehat_tindak_lanjut_id = satu_sehat_tindak_lanjut_id;
            if (satu_sehat_clinical_impression_id !== undefined && satu_sehat_clinical_impression_id !== null) updateFields.satu_sehat_clinical_impression_id = satu_sehat_clinical_impression_id;
            if (satu_sehat_diet_id !== undefined && satu_sehat_diet_id !== null) updateFields.satu_sehat_diet_id = satu_sehat_diet_id;
            if (satu_sehat_kontrol_kembali_id !== undefined && satu_sehat_kontrol_kembali_id !== null) updateFields.satu_sehat_kontrol_kembali_id = satu_sehat_kontrol_kembali_id;
            if (satu_sehat_alleri_intoleran_id !== undefined && satu_sehat_alleri_intoleran_id !== null) updateFields.satu_sehat_alleri_intoleran_id = satu_sehat_alleri_intoleran_id;
            
            // Only perform update if there are fields to update
            if (Object.keys(updateFields).length > 0) {
                let data = await registrasi.update(updateFields, { where: { id } });
                res.status(200).json({ status: 200, message: "sukses", data });
            } else {
                res.status(400).json({ status: 400, message: "Tidak ada data yang diupdate" });
            }
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static update(req, res) {
        const { id, tgl_registrasi, no_identitas_registrasi, no_hp_registrasi, no_sep, no_asuransi_registrasi, no_rujukan, no_kontrol, no_antrian,keterangan_registrasi, id_faskes_perujuk, booking_id, ms_jenis_layanan_id, kelas_kunjungan_id, pasien_id, ms_dokter_id, ms_spesialis_id, ms_asuransi_id, status_registrasi, antrian_loket_id, no_kunjungan, initial_registrasi, satu_sehat_id, satu_sehat_status, satu_sehat_last_payload, satu_sehat_condition_id, satu_sehat_observation_id, satu_sehat_request_service_id, satu_sehat_procedure_id, satu_sehat_tindak_lanjut_id, satu_sehat_clinical_impression_id } = req.body

        registrasi.update({ tgl_registrasi, no_identitas_registrasi, no_hp_registrasi, no_sep, no_asuransi_registrasi, no_rujukan, no_kontrol, no_antrian, keterangan_registrasi, id_faskes_perujuk, ms_jenis_layanan_id, kelas_kunjungan_id, pasien_id, ms_dokter_id, ms_spesialis_id, ms_asuransi_id, status_registrasi, antrian_loket_id, no_kunjungan, initial_registrasi, satu_sehat_id, satu_sehat_status, satu_sehat_last_payload, satu_sehat_condition_id, satu_sehat_observation_id, satu_sehat_request_service_id, satu_sehat_procedure_id, satu_sehat_tindak_lanjut_id, satu_sehat_clinical_impression_id }, { where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static delete(req, res) {
        const { id } = req.body

        registrasi.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        const { search, jumlah, halaman } = req.body
        try {
            let isi = ' and r.no_sep is not null '

            if(search) {
                isi += ` and p.nama_lengkap ilike '%${search}%' `
            }

            let pagination = ''
            if (jumlah && halaman) {
                let offset = (+halaman - 1) * jumlah
                pagination = ` limit ${jumlah} offset ${offset} `
            }

            let data = await sq.query(`select r.id as registrasi_id, r.*, mjl.nama_jenis_layanan, mjl.kode_jenis_layanan, kk.nama_kelas_kunjungan, md.nama_dokter, ms.nama_specialist, ms.kode_specialist,
            ma.nama_asuransi, ma.tipe_asuransi, p.nama_lengkap, p.jenis_kelamin, p.tempat_lahir, p.tgl_lahir, p.alamat_sekarang,ma.ms_harga_id,kk.ms_tarif_id , r.no_sep as no_sep, p.no_rm
            from registrasi r
            join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id 
            join kelas_kunjungan kk on kk.id = r.kelas_kunjungan_id 
            join ms_dokter md on md.id = r.ms_dokter_id 
            left join ms_specialist ms on ms.id = r.ms_spesialis_id 
            join ms_asuransi ma on ma.id = r.ms_asuransi_id 
            join pasien p on p.id = r.pasien_id 
            where r."deletedAt" isnull ${isi} order by r."createdAt" desc ${pagination}`, s);

            let total = await sq.query(`select count(*) as total from registrasi r
            join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id 
            join kelas_kunjungan kk on kk.id = r.kelas_kunjungan_id 
            join ms_dokter md on md.id = r.ms_dokter_id 
            left join ms_specialist ms on ms.id = r.ms_spesialis_id 
            join ms_asuransi ma on ma.id = r.ms_asuransi_id 
            join pasien p on p.id = r.pasien_id 
            where r."deletedAt" isnull ${isi}`, s);

            res.status(200).json({ status: 200, message: "sukses", data, count: total[0].total });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async detailsById(req, res) {
        const { id } = req.body;

        try {
            let data = await sq.query(`select r.id as registrasi_id, r.*, mjl.nama_jenis_layanan, mjl.kode_jenis_layanan, kk.nama_kelas_kunjungan, md.nama_dokter, ms.nama_specialist, ms.kode_specialist,
            ma.nama_asuransi, ma.tipe_asuransi, p.nama_lengkap, p.jenis_kelamin, p.tempat_lahir, p.tgl_lahir, p.alamat_sekarang , p.no_rm,
            r.satu_sehat_id as satu_sehat_id_registrasi,
            r.satu_sehat_condition_id as satu_sehat_condition_id_registrasi,
            r.satu_sehat_observation_id as satu_sehat_observation_id_registrasi,
            r.satu_sehat_status as satu_sehat_status_registrasi,
            p.satu_sehat_id as satu_sehat_pasien,
            md.satu_sehat_id as satu_sehat_dokter

            from registrasi r
            join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id 
            left join kelas_kunjungan kk on kk.id = r.kelas_kunjungan_id 
            left join ms_dokter md on md.id = r.ms_dokter_id 
            left join ms_specialist ms on ms.id = r.ms_spesialis_id 
            left join ms_asuransi ma on ma.id = r.ms_asuransi_id 
            join pasien p on p.id = r.pasien_id 
            where r."deletedAt" isnull and r.id = '${id}'`, s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async listKunjunganInapPerHalaman(req, res) {
        let { halaman, jumlah, no_rm, no_kunjungan, nama, tagihan_id, no_asuransi, no_sep, dibuat_oleh, tanggal_awal, tanggal_akhir, dokter_id, ruangan_id, status_registrasi } = req.body

        let isi = '';
        let offset = (+halaman - 1) * jumlah;

        if (no_rm) {
            isi += ` and p.no_rm = '${no_rm}'`
        }
        if (no_kunjungan) {
            isi += ` and r.no_kunjungan='${no_kunjungan}'`
        }
        if (nama) {
            isi += ` and  p.nama_lengkap ilike '%${nama}%'`
        }
        if (no_asuransi) {
            isi += ` and r.no_asuransi_registrasi='${no_asuransi}'`
        }
        if (dibuat_oleh) {
            isi += ` and r.dibuat_oleh ilike '%${dibuat_oleh}%'s`
        }
        if (tanggal_awal) {
            isi += ` and date(r.tgl_registrasi) >= '${tanggal_awal}'`
        }
        if (tanggal_akhir) {
            isi += ` and date(r.tgl_registrasi) <= '${tanggal_akhir}'`
        }
        if (dokter_id) {
            isi += ` and md.id = '${dokter_id}'`
        }
        if (ruangan_id) {
            isi += ` and mr.id = '${ruangan_id}'`
        }
        if (status_registrasi) {
            isi += ` and r.status_registrasi IN (${status_registrasi})`
        }

        try {
            let data = await sq.query(`select r.id as registrasi_id,r.*,p.*,md.*,ms.nama_specialist,ms.kode_specialist,ma.nama_asuransi,ma.tipe_asuransi,mjl.nama_jenis_layanan,mjl.kode_bridge,
			mjl.kode_jenis_layanan,hb.status_checkout,hb.tgl_mulai,hb.tgl_selesai,hb.status_monitoring,mb.nama_bed,hb.ms_bed_id,hb.keterangan_history_bed,mb.status_bed,mk.nama_kamar,mk.nama_kamar,mr.nama_ruang,mr.keterangan_ruang,mp.nama_pekerjaan,mp.keterangan_pekerjaan, kk.ms_tarif_id, ma.ms_harga_id
            ,mgd.*,
            r.satu_sehat_id as satu_sehat_id_registrasi,
            r.satu_sehat_condition_id as satu_sehat_condition_id_registrasi,
            r.satu_sehat_observation_id as satu_sehat_observation_id_registrasi,
            r.satu_sehat_status as satu_sehat_status_registrasi,

            p.satu_sehat_id as satu_sehat_id_pasien,
            md.satu_sehat_id as satu_sehat_id_dokter

            from registrasi r 
            join kelas_kunjungan kk ON kk.id = r.kelas_kunjungan_id 
            join pasien p on p.id = r.pasien_id 
            join ms_dokter md on md.id = r.ms_dokter_id 
            left join ms_specialist ms on ms.id = r.ms_spesialis_id 
            left join ms_asuransi ma on ma.id=r.ms_asuransi_id 
            join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
            left join history_bed hb on hb.registrasi_id =r.id and hb.tgl_selesai is null
            left join ms_bed mb on mb.id = hb.ms_bed_id 
            left join ms_kamar mk on mk.id = mb.ms_kamar_id 
            left join ms_ruang mr on mr.id = mk.ms_ruang_id
            left join ms_pekerjaan mp on mp.id = p.pekerjaan_id 
            left join ms_golongan_darah mgd on mgd.id = p.golongan_darah_id 
            where r."deletedAt" isnull and mjl.kode_jenis_layanan ='RINAP' ${isi}
            order by r.tgl_registrasi desc
            limit ${jumlah} offset ${offset}`, s)

            let jml = await sq.query(`select count(*)as total from registrasi r 
            join kelas_kunjungan kk ON kk.id = r.kelas_kunjungan_id 
            join pasien p on p.id = r.pasien_id 
            join ms_dokter md on md.id = r.ms_dokter_id 
            left join ms_specialist ms on ms.id = r.ms_spesialis_id 
            left join ms_asuransi ma on ma.id=r.ms_asuransi_id 
            join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
            left join history_bed hb on hb.registrasi_id =r.id
            left join ms_bed mb on mb.id = hb.ms_bed_id 
            left join ms_kamar mk on mk.id = mb.ms_kamar_id 
            left join ms_ruang mr on mr.id = mk.ms_ruang_id
            left join ms_pekerjaan mp on mp.id = p.pekerjaan_id 
            left join ms_golongan_darah mgd on mgd.id = p.golongan_darah_id 
            where r."deletedAt" isnull and mjl.kode_jenis_layanan ='RINAP' ${isi}`, s)

            res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].total, jumlah, halaman });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listKunjunganRajalPerHalaman(req, res) {
        let { halaman, jumlah, registrasi_id, no_rm, no_kunjungan, nama, no_asuransi, ms_asuransi_id, dibuat_oleh, tanggal_awal, tanggal_akhir, dokter_id, status_registrasi, status_antrian, ms_dokter_id, poliklinik_id } = req.body

        try {
            let isi = '';
            let offset = (+halaman - 1) * jumlah;

            if (registrasi_id) {
                isi += ` and r.id='${registrasi_id}' `
            }
            if (no_rm) {
                isi += ` and p.no_rm = '${no_rm}'`
            }
            if (no_kunjungan) {
                isi += ` and r.no_kunjungan='${no_kunjungan}' `
            }
            if (nama) {
                isi += ` and  p.nama_lengkap ilike '%${nama}%' `
            }
            if (no_asuransi) {
                isi += ` and r.no_asuransi_registrasi='${no_asuransi}' `
            }
            if (dibuat_oleh) {
                isi += ` and r.dibuat_oleh ilike '%${dibuat_oleh}%' `
            }
            if (tanggal_awal) {
                isi += ` and r.tgl_registrasi::DATE >= '${tanggal_awal}' `
            }
            if (tanggal_akhir) {
                isi += ` and r.tgl_registrasi::DATE <= '${tanggal_akhir}'`
            }
            if (dokter_id) {
                isi += ` and md.id = '${dokter_id}'`
            }
            if (status_registrasi) {
                isi += ` and r.status_registrasi IN (${status_registrasi})`
            }
            if (ms_asuransi_id) {
                isi += ` and r.ms_asuransi_id = '${ms_asuransi_id}'`
            }
            if (status_antrian) {
                isi += ` and al.status_antrian = '${status_antrian}'`
            }
            if (ms_dokter_id) {
                isi += ` and md.id = '${ms_dokter_id}'`
            }
            if (poliklinik_id) {
                isi += ` and mp2.id = '${poliklinik_id}'`
            }
            let data = await sq.query(`select r.id as registrasi_id, r.*, p.*, mjl.nama_jenis_layanan, mjl.kode_bridge, mjl.kode_jenis_layanan, md.nama_dokter, md.no_hp_dokter, md.nik_dokter,
			md.jk_dokter, b.tgl_booking, b.jenis_booking, b.status_booking, ms.nama_specialist, ms.kode_specialist, ms.nama_specialist, ms.kode_specialist, ma.*, 
			mp.nama_pekerjaan, mp.keterangan_pekerjaan, al.status_antrian, al.initial, kk.nama_kelas_kunjungan, mp2.id as ms_poliklinik_id, mp2.nama_poliklinik, kk.ms_tarif_id, jd.id as jadwal_dokter_id, mgd.*,
            r.satu_sehat_id as satu_sehat_id_registrasi,
            r.satu_sehat_condition_id as satu_sehat_condition_id_registrasi,
            r.satu_sehat_observation_id as satu_sehat_observation_id_registrasi,
            r.satu_sehat_status as satu_sehat_status_registrasi,

            r.satu_sehat_request_service_id,
            r.satu_sehat_id as satu_sehat_id,
            p.satu_sehat_id as satu_sehat_id_pasien,
            mp2.satu_sehat_id as satu_sehat_id_poliklinik,
            md.satu_sehat_id as satu_sehat_id_dokter
            
            from registrasi r 
            join pasien p on p.id = r.pasien_id 
            join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
            left join ms_dokter md on md.id = r.ms_dokter_id
            left join ms_pekerjaan mp on mp.id = p.pekerjaan_id
            left join booking b on b.id = r.booking_id 
            left join ms_specialist ms on ms.id = r.ms_spesialis_id 
            left join antrian_list al on al.registrasi_id = r.id
            left join jadwal_dokter jd on jd.id = al.jadwal_dokter_id
            left join ms_poliklinik mp2 on mp2.id = jd.ms_poliklinik_id
            left join ms_asuransi ma on ma.id = r.ms_asuransi_id 
            left join kelas_kunjungan kk on kk.id = r.kelas_kunjungan_id 
            left join ms_golongan_darah mgd on mgd.id = p.golongan_darah_id 
            where r."deletedAt" isnull and mjl.kode_jenis_layanan = 'RAJAL' ${isi}
            order by r.tgl_registrasi desc limit ${jumlah} offset ${offset}`, s)
            let jml = await sq.query(`select count(*) as total
            from registrasi r 
            join pasien p on p.id = r.pasien_id 
            join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
            left join ms_dokter md on md.id = r.ms_dokter_id
            left join ms_pekerjaan mp on mp.id = p.pekerjaan_id
            left join booking b on b.id = r.booking_id 
            left join ms_specialist ms on ms.id = r.ms_spesialis_id
            left join ms_asuransi ma on ma.id = r.ms_asuransi_id 
            left join antrian_list al on al.registrasi_id = r.id
            left join jadwal_dokter jd on jd.id = al.jadwal_dokter_id
            left join ms_poliklinik mp2 on mp2.id = jd.ms_poliklinik_id
            left join kelas_kunjungan kk on kk.id = r.kelas_kunjungan_id 
            left join ms_golongan_darah mgd on mgd.id = p.golongan_darah_id 
            where r."deletedAt" isnull and mjl.kode_jenis_layanan = 'RAJAL' ${isi}`, s)

            res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].total, jumlah, halaman });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listKunjunganIGDPerHalaman(req, res) {
        let { halaman, jumlah, no_rm, no_kunjungan, nama, no_asuransi, ms_asuransi_id, dibuat_oleh, tanggal_awal, tanggal_akhir, dokter_id, status_registrasi, search } = req.body

        try {
            let isi = '';
            let offset = (+halaman - 1) * jumlah;

            if (search) {
                isi += ` and (p.no_rm ilike '%${search}%' or p.nama_lengkap ilike '%${search}%' or CAST(r.no_kunjungan AS TEXT) ilike '%${search}%')`
            }
            if (no_rm) {
                isi += ` and p.no_rm = '${no_rm}'`
            }
            if (no_kunjungan) {
                isi += ` and r.no_kunjungan='${no_kunjungan}' `
            }
            if (nama) {
                isi += ` and  p.nama_lengkap ilike '%${nama}%' `
            }
            if (no_asuransi) {
                isi += ` and r.no_asuransi_registrasi='${no_asuransi}' `
            }
            if (dibuat_oleh) {
                isi += ` and r.dibuat_oleh ilike '%${dibuat_oleh}%' `
            }
            if (tanggal_awal) {
                isi += ` and r.tgl_registrasi::DATE >= '${tanggal_awal}'::DATE `
            }
            if (tanggal_akhir) {
                isi += ` and r.tgl_registrasi::DATE <= '${tanggal_akhir}'::DATE `
            }
            if (dokter_id) {
                isi += ` and md.id = '${dokter_id}'`
            }
            if (ms_asuransi_id) {
                isi += ` and r.ms_asuransi_id = '${ms_asuransi_id}'`
            }
            if(status_registrasi){
                isi += ` and r.status_registrasi IN (${status_registrasi})`
            }
            let data = await sq.query(`select r.id as registrasi_id, r.*, p.*, mjl.nama_jenis_layanan, mjl.kode_bridge, mjl.kode_jenis_layanan, md.nama_dokter, md.no_hp_dokter, md.nik_dokter,
			md.jk_dokter, ms.nama_specialist, ms.kode_specialist, ms.nama_specialist, ms.kode_specialist, ma.*, mp.nama_pekerjaan, mp.keterangan_pekerjaan, kk.ms_tarif_id,
            r.satu_sehat_id as satu_sehat_id_registrasi,
            r.satu_sehat_condition_id as satu_sehat_condition_id_registrasi,
            r.satu_sehat_observation_id as satu_sehat_observation_id_registrasi,
            r.satu_sehat_status as satu_sehat_status_registrasi,

            p.satu_sehat_id as satu_sehat_id_pasien,
            md.satu_sehat_id as satu_sehat_id_dokter
            
            from registrasi r 
            join pasien p on p.id = r.pasien_id 
            join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
            left join ms_dokter md on md.id = r.ms_dokter_id
            left join ms_pekerjaan mp on mp.id = p.pekerjaan_id 
            left join ms_specialist ms on ms.id = r.ms_spesialis_id 
            left join ms_asuransi ma on ma.id = r.ms_asuransi_id 
            left join kelas_kunjungan kk on kk.id = r.kelas_kunjungan_id 
            where r."deletedAt" isnull and mjl.kode_jenis_layanan = 'IGD' ${isi}
            order by r.tgl_registrasi desc limit ${jumlah} offset ${offset}`, s)
            let jml = await sq.query(`select count(*) as total
            from registrasi r 
            join pasien p on p.id = r.pasien_id 
            join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
            left join ms_dokter md on md.id = r.ms_dokter_id
            left join ms_pekerjaan mp on mp.id = p.pekerjaan_id
            left join ms_specialist ms on ms.id = r.ms_spesialis_id
            left join ms_asuransi ma on ma.id = r.ms_asuransi_id 
            left join kelas_kunjungan kk on kk.id = r.kelas_kunjungan_id 
            where r."deletedAt" isnull and mjl.kode_jenis_layanan = 'IGD' ${isi}`, s)

            res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].total, jumlah, halaman });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listKunjunganRajal(req, res) {
        let { no_rm, no_kunjungan, nama, no_asuransi, ms_asuransi_id, dibuat_oleh, tanggal_awal, tanggal_akhir, dokter_id, status_registrasi, status_antrian } = req.body

        try {
            let isi = '';
            let offset = (+halaman - 1) * jumlah;

            if (no_rm) {
                isi += ` and p.no_rm = '${no_rm}'`
            }
            if (no_kunjungan) {
                isi += ` and r.no_kunjungan='${no_kunjungan}' `
            }
            if (nama) {
                isi += ` and  p.nama_lengkap ilike '%${nama}%' `
            }
            if (no_asuransi) {
                isi += ` and r.no_asuransi_registrasi='${no_asuransi}' `
            }
            if (dibuat_oleh) {
                isi += ` and r.dibuat_oleh ilike '%${dibuat_oleh}%' `
            }
            if (tanggal_awal) {
                isi += ` and r.tgl_registrasi >= '${tanggal_awal}' `
            }
            if (tanggal_akhir) {
                isi += ` and r.tgl_registrasi <= '${tanggal_akhir}'`
            }
            if (dokter_id) {
                isi += ` and md.id = '${dokter_id}'`
            }
            if (status_registrasi) {
                isi += ` and r.status_registrasi = '${status_registrasi}'`
            }
            if (ms_asuransi_id) {
                isi += ` and r.ms_asuransi_id = '${ms_asuransi_id}'`
            }
            if (status_antrian) {
                isi += ` and al.status_antrian = '${status_antrian}'`
            }

            let data = await sq.query(`select r.id as registrasi_id, r.*, p.*, mjl.nama_jenis_layanan, mjl.kode_bridge, mjl.kode_jenis_layanan, md.nama_dokter, md.no_hp_dokter, md.nik_dokter,
			md.jk_dokter, b.tgl_booking, b.jenis_booking, b.status_booking, ms.nama_specialist, ms.kode_specialist, ms.nama_specialist, ms.kode_specialist, ma.*, mp.nama_pekerjaan, mp.keterangan_pekerjaan, al.status_antrian 
            from registrasi r 
            join pasien p on p.id = r.pasien_id 
            join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
            left join ms_dokter md on md.id = r.ms_dokter_id
            left join ms_pekerjaan mp on mp.id = p.pekerjaan_id
            left join booking b on b.id = r.booking_id 
            left join ms_specialist ms on ms.id = r.ms_spesialis_id
            left join ms_asuransi ma on ma.id = r.ms_asuransi_id 
            left join antrian_list al on al.registrasi_id = r.id 
            where r."deletedAt" isnull and mjl.kode_jenis_layanan = 'RAJAL' ${isi}
            order by r.tgl_registrasi desc limit ${jumlah} offset ${offset}`, s)

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listKunjunganRinap(req, res) {
        let { no_rm, no_kunjungan, nama, no_asuransi, dibuat_oleh, tanggal_awal, tanggal_akhir, dokter_id, ruangan_id, is_checkout } = req.body

        try {
            if (no_rm) {
                isi += ` and p.no_rm = '${no_rm}'`
            }
            if (no_kunjungan) {
                isi += ` and r.no_kunjungan='${no_kunjungan}' `
            }
            if (nama) {
                isi += ` and  p.nama_lengkap ilike '%${nama}%' `
            }
            if (no_asuransi) {
                isi += ` and r.no_asuransi_registrasi='${no_asuransi}' `
            }
            if (dibuat_oleh) {
                isi += ` and r.dibuat_oleh ilike '%${dibuat_oleh}%' `
            }
            if (tanggal_awal) {
                isi += ` and r.tgl_registrasi >= '${tanggal_awal}'  `
            }
            if (tanggal_akhir) {
                isi += ` and r.tgl_registrasi <= '${tanggal_akhir}' `
            }
            if (dokter_id) {
                isi += ` and md.id = '${dokter_id}' `
            }
            if (ruangan_id) {
                isi += ` and mr.id = '${ruangan_id}'`
            }
            if (!is_checkout) {
                isi += ` and r.status_registrasi not in (0,9)`
            }

            let data = await sq.query(`select r.id as registrasi_id,* from registrasi r 
            join kelas_kunjungan kk ON kk.id = r.kelas_kunjungan_id 
            join pasien p on p.id = r.pasien_id 
            left join ms_dokter md on md.id = r.ms_dokter_id 
            left join ms_specialist ms on ms.id = r.ms_spesialis_id 
            left join ms_asuransi ma on ma.id=r.ms_asuransi_id 
            join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
            left join history_bed hb on hb.registrasi_id =r.id
            left join ms_bed mb on mb.id = hb.ms_bed_id 
            left join ms_kamar mk on mk.id = mb.ms_kamar_id 
            left join ms_ruang mr on mr.id = mk.ms_ruang_id
            left join ms_pekerjaan mp on mp.id = p.pekerjaan_id 
            where r."deletedAt" isnull and mjl.kode_jenis_layanan = 'RINAP' ${isi} 
            order by r.tgl_registrasi desc`, s)

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listKunjunganIGD(req, res) {
        let { no_rm, no_kunjungan, nama, no_asuransi, dibuat_oleh, tanggal_awal, tanggal_akhir, dokter_id } = req.body

        try {
            let isi = ''
            if (no_rm) {
                isi += ` and p.no_rm = '${no_rm}'`
            }
            if (no_kunjungan) {
                isi += ` and r.no_kunjungan='${no_kunjungan}' `
            }
            if (nama) {
                isi += ` and  p.nama_lengkap ilike '%${nama}%' `
            }
            if (no_asuransi) {
                isi += ` and r.no_asuransi_registrasi='${no_asuransi}' `
            }
            if (dibuat_oleh) {
                isi += ` and r.dibuat_oleh ilike '%${dibuat_oleh}%' `
            }
            if (tanggal_awal) {
                isi += ` and r.tgl_registrasi >= '${tanggal_awal}'  `
            }
            if (tanggal_akhir) {
                isi += ` and r.tgl_registrasi <= '${tanggal_akhir}' `
            }
            if (dokter_id) {
                isi += ` and md.id = '${dokter_id}' `
            }

            let data = await sq.query(`select r.id as registrasi_id,* from registrasi r 
            left join kelas_kunjungan kk ON kk.id = r.kelas_kunjungan_id 
            join pasien p on p.id = r.pasien_id 
            left join ms_dokter md on md.id = r.ms_dokter_id 
            left join ms_specialist ms on ms.id = r.ms_spesialis_id 
            left join ms_asuransi ma on ma.id=r.ms_asuransi_id 
            join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id 
            left join ms_pekerjaan mp on mp.id = p.pekerjaan_id 
            where r."deletedAt" isnull and mjl.kode_jenis_layanan = 'IGD'${isi} 
            order by r.tgl_registrasi desc`, s)

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listPerHalaman(req, res) {
        let { halaman, jumlah, no_rm, no_kunjungan, nama, no_asuransi, ms_asuransi_id, dibuat_oleh, tanggal_awal, tanggal_akhir, dokter_id, status_registrasi, status_antrian, ms_jenis_layanan_id, nik, search } = req.body

        try {
            let isi = '';
            let offset = (+halaman - 1) * jumlah;

            if (no_rm) {
                isi += ` and p.no_rm = '${no_rm}'`
            }
            if (no_kunjungan) {
                isi += ` and r.no_kunjungan='${no_kunjungan}' `
            }
            if (nama) {
                isi += ` and  p.nama_lengkap ilike '%${nama}%' `
            }
            if (no_asuransi) {
                isi += ` and r.no_asuransi_registrasi='${no_asuransi}' `
            }
            if (dibuat_oleh) {
                isi += ` and r.dibuat_oleh ilike '%${dibuat_oleh}%' `
            }
            if (tanggal_awal) {
                isi += ` and r.tgl_registrasi >= '${tanggal_awal}' `
            }
            if (tanggal_akhir) {
                isi += ` and r.tgl_registrasi <= '${tanggal_akhir}'`
            }
            if (dokter_id) {
                isi += ` and md.id = '${dokter_id}'`
            }
            if (status_registrasi) {
                isi += ` and r.status_registrasi = '${status_registrasi}'`
            }
            if (ms_asuransi_id) {
                isi += ` and r.ms_asuransi_id = '${ms_asuransi_id}'`
            }
            if (status_antrian) {
                isi += ` and al.status_antrian = '${status_antrian}'`
            }
            if (ms_jenis_layanan_id) {
                isi += ` and r.ms_jenis_layanan_id = '${ms_jenis_layanan_id}'`
            }
            if (nik) {
                isi += ` and p.nik ilike '%${nik}%' ` 
            }
            if (search) {
                isi += ` and p.nama_lengkap ilike '%${search}%' or p.no_rm ilike '%${search}%' or r.no_kunjungan::TEXT ilike '%${search}%' ` 
            }

            let data = await sq.query(`select r.id as registrasi_id,r.*,p.*,mjl.nama_jenis_layanan,mjl.kode_bridge, mjl.kode_jenis_layanan, md.nama_dokter, md.no_hp_dokter, md.nik_dokter,
			md.jk_dokter, b.tgl_booking, b.jenis_booking, b.status_booking, ms.nama_specialist, ms.kode_specialist, ms.nama_specialist, ms.kode_specialist,ma.*,mp.nama_pekerjaan,mp.keterangan_pekerjaan, al.status_antrian, al.initial, ma.ms_harga_id,kk.ms_tarif_id 
            from registrasi r 
            join pasien p on p.id = r.pasien_id 
            join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
            left join ms_dokter md on md.id = r.ms_dokter_id
            left join ms_pekerjaan mp on mp.id = p.pekerjaan_id
            left join booking b on b.id = r.booking_id 
            left join ms_specialist ms on ms.id = r.ms_spesialis_id 
            left join antrian_list al on al.id = r.antrian_loket_id
            join ms_asuransi ma on ma.id = r.ms_asuransi_id
            join kelas_kunjungan kk on kk.id = r.kelas_kunjungan_id
            where r."deletedAt" isnull ${isi}
            order by (r.tgl_registrasi is null), r.tgl_registrasi desc limit ${jumlah} offset ${offset}`, s)
            let jml = await sq.query(`select count(*) as total
            from registrasi r 
            join pasien p on p.id = r.pasien_id 
            join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
            left join ms_dokter md on md.id = r.ms_dokter_id
            left join ms_pekerjaan mp on mp.id = p.pekerjaan_id
            left join booking b on b.id = r.booking_id 
            left join ms_specialist ms on ms.id = r.ms_spesialis_id
            left join antrian_list al on al.id = r.antrian_loket_id
            join ms_asuransi ma on ma.id = r.ms_asuransi_id 
            join kelas_kunjungan kk on kk.id = r.kelas_kunjungan_id
            where r."deletedAt" isnull ${isi}`, s)

            res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].total, jumlah, halaman });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listRegistrasiNonTagihanPerHalaman(req, res) {
        let { halaman, jumlah, no_rm, no_kunjungan, nama, no_asuransi, ms_asuransi_id, dibuat_oleh, tanggal_awal, tanggal_akhir, dokter_id, status_registrasi, status_antrian, ms_jenis_layanan_id, nik } = req.body

        try {
            let isi = '';
            let offset = (+halaman - 1) * jumlah;

            if (no_rm) {
                isi += ` and p.no_rm = '${no_rm}'`
            }
            if (no_kunjungan) {
                isi += ` and r.no_kunjungan='${no_kunjungan}' `
            }
            if (nama) {
                isi += ` and  p.nama_lengkap ilike '%${nama}%' `
            }
            if (no_asuransi) {
                isi += ` and r.no_asuransi_registrasi='${no_asuransi}' `
            }
            if (dibuat_oleh) {
                isi += ` and r.dibuat_oleh ilike '%${dibuat_oleh}%' `
            }
            if (tanggal_awal) {
                isi += ` and r.tgl_registrasi >= '${tanggal_awal}' `
            }
            if (tanggal_akhir) {
                isi += ` and r.tgl_registrasi <= '${tanggal_akhir}'`
            }
            if (dokter_id) {
                isi += ` and md.id = '${dokter_id}'`
            }
            if (status_registrasi) {
                isi += ` and r.status_registrasi = '${status_registrasi}'`
            }
            if (ms_asuransi_id) {
                isi += ` and r.ms_asuransi_id = '${ms_asuransi_id}'`
            }
            if (status_antrian) {
                isi += ` and al.status_antrian = '${status_antrian}'`
            }
            if (ms_jenis_layanan_id) {
                isi += ` and r.ms_jenis_layanan_id = '${ms_jenis_layanan_id}'`
            }
            if (nik) {
                isi += ` and p.nik ilike '%${nik}%' ` 
            }

            let data = await sq.query(`select r.id as registrasi_id,r.*,p.*,mjl.nama_jenis_layanan,mjl.kode_bridge, mjl.kode_jenis_layanan, md.nama_dokter, md.no_hp_dokter, md.nik_dokter,
			md.jk_dokter, b.tgl_booking, b.jenis_booking, b.status_booking, ms.nama_specialist, ms.kode_specialist, ms.nama_specialist, ms.kode_specialist,ma.*,
			mp.nama_pekerjaan,mp.keterangan_pekerjaan, al.status_antrian, al.initial, ma.ms_harga_id,kk.ms_tarif_id 
            from registrasi r 
            join pasien p on p.id = r.pasien_id 
            join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
            join penjualan p2 on p2.registrasi_id = r.id
            left join ms_dokter md on md.id = r.ms_dokter_id
            left join ms_pekerjaan mp on mp.id = p.pekerjaan_id
            left join booking b on b.id = r.booking_id 
            left join ms_specialist ms on ms.id = r.ms_spesialis_id 
            left join antrian_list al on al.id = r.antrian_loket_id
            join ms_asuransi ma on ma.id = r.ms_asuransi_id
            join kelas_kunjungan kk on kk.id = r.kelas_kunjungan_id
            where r."deletedAt" isnull and r.id not in (select pr.registrasi_id from pool_registrasi pr where pr."deletedAt" isnull) ${isi}
            group by r.id,p.id,ma.id,mjl.nama_jenis_layanan,mjl.kode_bridge, mjl.kode_jenis_layanan, md.nama_dokter, md.no_hp_dokter, md.nik_dokter,
			md.jk_dokter, b.tgl_booking, b.jenis_booking, b.status_booking, ms.nama_specialist, ms.kode_specialist, ms.nama_specialist, ms.kode_specialist,
			mp.nama_pekerjaan,mp.keterangan_pekerjaan, al.status_antrian, al.initial, ma.ms_harga_id,kk.ms_tarif_id
            order by r.tgl_registrasi desc limit ${jumlah} offset ${offset}`, s)
            let jml = await sq.query(`select count(*)as total
            from (select r.id as registrasi_id,r.*,p.*,mjl.nama_jenis_layanan,mjl.kode_bridge, mjl.kode_jenis_layanan, md.nama_dokter, md.no_hp_dokter, md.nik_dokter,
            md.jk_dokter, b.tgl_booking, b.jenis_booking, b.status_booking, ms.nama_specialist, ms.kode_specialist, ms.nama_specialist, ms.kode_specialist,ma.*,
            mp.nama_pekerjaan,mp.keterangan_pekerjaan, al.status_antrian, al.initial, ma.ms_harga_id,kk.ms_tarif_id 
            from registrasi r 
            join pasien p on p.id = r.pasien_id 
            join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
            join penjualan p2 on p2.registrasi_id = r.id
            left join ms_dokter md on md.id = r.ms_dokter_id
            left join ms_pekerjaan mp on mp.id = p.pekerjaan_id
            left join booking b on b.id = r.booking_id 
            left join ms_specialist ms on ms.id = r.ms_spesialis_id 
            left join antrian_list al on al.id = r.antrian_loket_id
            join ms_asuransi ma on ma.id = r.ms_asuransi_id
            join kelas_kunjungan kk on kk.id = r.kelas_kunjungan_id
            where r."deletedAt" isnull and r.id not in (select pr.registrasi_id from pool_registrasi pr where pr."deletedAt" isnull) ${isi}
            group by r.id,p.id,ma.id,mjl.nama_jenis_layanan,mjl.kode_bridge, mjl.kode_jenis_layanan, md.nama_dokter, md.no_hp_dokter, md.nik_dokter,
            md.jk_dokter, b.tgl_booking, b.jenis_booking, b.status_booking, ms.nama_specialist, ms.kode_specialist, ms.nama_specialist, ms.kode_specialist,
            mp.nama_pekerjaan,mp.keterangan_pekerjaan, al.status_antrian, al.initial, ma.ms_harga_id,kk.ms_tarif_id) as registrasi`, s)

            res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].total, jumlah, halaman });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }
    static async listKunjunganRajalWithResepPerHalaman(req, res) {
        let { halaman, jumlah, no_rm, no_kunjungan, nama, no_asuransi, ms_asuransi_id, dibuat_oleh, tanggal_awal, tanggal_akhir, dokter_id, status_registrasi, status_antrian, ms_jenis_layanan_id, nik, tahap_resep,poliklinik_id } = req.body

        try {
            let isi = '';
            let offset = (+halaman - 1) * jumlah;

            if (no_rm) {
                isi += ` and p.no_rm = '${no_rm}'`
            }
            if (no_kunjungan) {
                isi += ` and r.no_kunjungan='${no_kunjungan}' `
            }
            if (nama) {
                isi += ` and  p.nama_lengkap ilike '%${nama}%' `
            }
            if (no_asuransi) {
                isi += ` and r.no_asuransi_registrasi='${no_asuransi}' `
            }
            if (dibuat_oleh) {
                isi += ` and r.dibuat_oleh ilike '%${dibuat_oleh}%' `
            }
            if (tanggal_awal) {
                isi += ` and r.tgl_registrasi::date >= '${tanggal_awal}' `
            }
            if (tanggal_akhir) {
                isi += ` and r.tgl_registrasi::date <= '${tanggal_akhir}'`
            }
            if (dokter_id) {
                isi += ` and md.id = '${dokter_id}'`
            }
            if (status_registrasi) {
                isi += ` and r.status_registrasi IN (${status_registrasi})`
            }
            if (ms_asuransi_id) {
                isi += ` and r.ms_asuransi_id = '${ms_asuransi_id}'`
            }
            if (status_antrian) {
                isi += ` and al.status_antrian = '${status_antrian}'`
            }
            if (ms_jenis_layanan_id) {
                isi += ` and r.ms_jenis_layanan_id = '${ms_jenis_layanan_id}'`
            }
            if (nik) {
                isi += ` and p.nik ilike '%${nik}%' ` 
            }
            if (tahap_resep!=undefined) {
                isi += ` and rr.tahap_resep = ${tahap_resep} `
            }
            if(poliklinik_id){
                isi += ` and mp2.id = ${poliklinik_id} `
            }
            let data = await sq.query(`select r.id as registrasi_id, r.*, p.*, mjl.nama_jenis_layanan, mjl.kode_bridge, mjl.kode_jenis_layanan, md.nama_dokter, md.no_hp_dokter, md.nik_dokter,
			md.jk_dokter, b.tgl_booking, b.jenis_booking, b.status_booking, ms.nama_specialist, ms.kode_specialist, ms.nama_specialist, ms.kode_specialist, ma.*, 
			mp.nama_pekerjaan, mp.keterangan_pekerjaan, al.status_antrian, al.initial, kk.nama_kelas_kunjungan, rr.*, mp2.nama_poliklinik
            from registrasi r 
            join pasien p on p.id = r.pasien_id 
            join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
            left join ms_dokter md on md.id = r.ms_dokter_id
            left join ms_pekerjaan mp on mp.id = p.pekerjaan_id
            left join booking b on b.id = r.booking_id 
            left join ms_specialist ms on ms.id = r.ms_spesialis_id 
            left join antrian_list al on al.registrasi_id = r.id
            left join jadwal_dokter jd on jd.id = al.jadwal_dokter_id
            left join ms_poliklinik mp2 on mp2.id = jd.ms_poliklinik_id
            left join ms_asuransi ma on ma.id = r.ms_asuransi_id 
            left join kelas_kunjungan kk on kk.id = r.kelas_kunjungan_id
            join resep_rjalan rr on rr.registrasi_id = r.id 
            where r."deletedAt" isnull and mjl.kode_jenis_layanan = 'RAJAL' ${isi}
            order by r.tgl_registrasi desc limit ${jumlah} offset ${offset}`, s)
            let jml = await sq.query(`select count(*) as total
            from registrasi r 
            join pasien p on p.id = r.pasien_id 
            join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
            left join ms_dokter md on md.id = r.ms_dokter_id
            left join ms_pekerjaan mp on mp.id = p.pekerjaan_id
            left join booking b on b.id = r.booking_id 
            left join ms_specialist ms on ms.id = r.ms_spesialis_id
            left join ms_asuransi ma on ma.id = r.ms_asuransi_id 
            left join antrian_list al on al.registrasi_id = r.id
            left join jadwal_dokter jd on jd.id = al.jadwal_dokter_id
            left join ms_poliklinik mp2 on mp2.id = jd.ms_poliklinik_id
            left join kelas_kunjungan kk on kk.id = r.kelas_kunjungan_id 
            join resep_rjalan rr on rr.registrasi_id = r.id 
            where r."deletedAt" isnull and mjl.kode_jenis_layanan = 'RAJAL' ${isi}`, s)
            res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].total, jumlah, halaman });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }
    static async tutupKunjungan(req, res) {
        let { registrasi_id,tgl_pulang } = req.body
        try {
            let data = await sq.query(`update registrasi set status_registrasi = 9, tgl_pulang='${tgl_pulang}' where id = '${registrasi_id}' returning *`, s)
            await historyBed.update({ status_checkout: 1, tgl_selesai:new Date() }, { where: { registrasi_id , status_checkout:0} })
            // console.log(data)
            res.status(200).json({ status: 200, message: "sukses", data: data[0] });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }
    static async batalKunjungan(req, res) {
        let { registrasi_id } = req.body
        try {
            let data = await sq.query(`update registrasi set status_registrasi = 0 where id = '${registrasi_id}' returning *`, s)
            await historyBed.update({ status_checkout: 1, tgl_selesai:new Date() }, { where: { registrasi_id , status_checkout:0} })
            res.status(200).json({ status: 200, message: "sukses", data: data[0] });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listDiagnosaByRegistrasiId(req, res) {
        const { registrasi_id } = req.body

        try {
            let data = await sq.query(`select * from data_diagnosa dd where dd.registrasi_id = '${registrasi_id}'`, s);

            res.status(200).json({status: 200, message: 'berhasil', data: data})
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async convertRajalToRanap(req, res) {
        const {
            registrasi_id,
            ms_bed_id,
            tanggal_mulai,
            kelas_kunjungan_id,
            ms_jenis_layanan_id,
            ms_spesialis_id,
            ms_dokter_id,
            catatan_pindah
        } = req.body;

        const t = await sq.transaction();

        try {
            // 1. Cek registrasi rawat jalan yang ada
            let existingReg = await sq.query(`
                SELECT r.*, p.nama_lengkap, p.no_rm
                FROM registrasi r
                JOIN pasien p ON p.id = r.pasien_id
                WHERE r.id = '${registrasi_id}' AND r."deletedAt" IS NULL
            `, s);

            if (existingReg.length === 0) {
                await t.rollback();
                return res.status(404).json({ status: 404, message: "Registrasi tidak ditemukan" });
            }

            let regData = existingReg[0];

            // 2. Cek apakah sudah registrasi rawat inap untuk pasien yang sama di hari yang sama
            let tgl = moment(tanggal_mulai).format('YYYY-MM-DD');
            let cekExistingRanap = await sq.query(`
                SELECT r.id FROM registrasi r
                JOIN ms_jenis_layanan mjl ON mjl.id = r.ms_jenis_layanan_id
                WHERE r.pasien_id = '${regData.pasien_id}'
                AND r."deletedAt" IS NULL
                AND r.status_registrasi IN (1,2)
                AND mjl.kode_jenis_layanan = 'RINAP'
                AND DATE(r.tgl_registrasi) = '${tgl}'
            `, s);

            if (cekExistingRanap.length > 0) {
                await t.rollback();
                return res.status(400).json({ status: 400, message: "Pasien sudah terdaftar rawat inap hari ini" });
            }

            // 3. Cek ketersediaan bed
            let cekBed = await sq.query(`
                SELECT * FROM history_bed hb
                WHERE hb."deletedAt" IS NULL
                AND hb.status_checkout = 0
                AND hb.ms_bed_id = '${ms_bed_id}'
            `, s);

            if (cekBed.length > 0) {
                await t.rollback();
                return res.status(400).json({ status: 400, message: "Bed sudah terpakai" });
            }

            // 4. Update registrasi lama menjadi closed/completed
            await registrasi.update(
                {
                    status_registrasi: 9, // status selesai
                    catatan_pindah: catatan_pindah || 'Dipindah ke rawat inap'
                },
                {
                    where: { id: registrasi_id },
                    transaction: t
                }
            );

            // 5. Buat registrasi rawat inap baru
            let newRegistrasiId = uuid_v4();
            let ranapData = await registrasi.create({
                id: newRegistrasiId,
                tgl_registrasi: tanggal_mulai,
                no_identitas_registrasi: regData.no_identitas_registrasi,
                no_hp_registrasi: regData.no_hp_registrasi,
                no_sep: regData.no_sep,
                no_asuransi_registrasi: regData.no_asuransi_registrasi,
                no_rujukan: regData.no_rujukan,
                no_kontrol: regData.no_kontrol,
                keterangan_registrasi: regData.keterangan_registrasi + ' (Dari RAWAT JALAN)',
                id_faskes_perujuk: regData.id_faskes_perujuk,
                booking_id: regData.booking_id,
                ms_jenis_layanan_id: ms_jenis_layanan_id || regData.ms_jenis_layanan_id,
                kelas_kunjungan_id: kelas_kunjungan_id || regData.kelas_kunjungan_id,
                pasien_id: regData.pasien_id,
                ms_dokter_id: ms_dokter_id || regData.ms_dokter_id,
                ms_spesialis_id: ms_spesialis_id || regData.ms_spesialis_id,
                ms_asuransi_id: regData.ms_asuransi_id,
                status_registrasi: 1, // status aktif
                dibuat_oleh: req.dataUsers?.username || 'system',
                registrasi_rujukan_id: registrasi_id, // referensi ke registrasi rawat jalan
                catatan_pindah: catatan_pindah
            }, { transaction: t });

            // 6. Buat history bed untuk rawat inap
            await historyBed.create({
                id: uuid_v4(),
                registrasi_id: newRegistrasiId,
                ms_bed_id: ms_bed_id,
                tanggal_mulai: tanggal_mulai,
                status_checkout: 0 // status terisi
            }, { transaction: t });

            // 7. Update status bed menjadi terisi
            await msBed.update(
                { status_bed: 1 },
                {
                    where: { id: ms_bed_id },
                    transaction: t
                }
            );

            await t.commit();

            // 8. Return data lengkap
            let fullData = await sq.query(`
                SELECT
                    r.id as registrasi_id,
                    r.*,
                    p.nama_lengkap,
                    p.no_rm,
                    mjl.nama_jenis_layanan,
                    mjl.kode_jenis_layanan,
                    kk.nama_kelas_kunjungan,
                    md.nama_dokter,
                    ms.nama_specialist,
                    ma.nama_asuransi,
                    hb.tgl_mulai,
                    mb.nama_bed,
                    mk.nama_kamar,
                    mr.nama_ruang
                FROM registrasi r
                JOIN pasien p ON p.id = r.pasien_id
                JOIN ms_jenis_layanan mjl ON mjl.id = r.ms_jenis_layanan_id
                LEFT JOIN kelas_kunjungan kk ON kk.id = r.kelas_kunjungan_id
                LEFT JOIN ms_dokter md ON md.id = r.ms_dokter_id
                LEFT JOIN ms_specialist ms ON ms.id = r.ms_spesialis_id
                LEFT JOIN ms_asuransi ma ON ma.id = r.ms_asuransi_id
                LEFT JOIN history_bed hb ON hb.registrasi_id = r.id AND hb.tgl_selesai IS NULL
                LEFT JOIN ms_bed mb ON mb.id = hb.ms_bed_id
                LEFT JOIN ms_kamar mk ON mk.id = mb.ms_kamar_id
                LEFT JOIN ms_ruang mr ON mr.id = mk.ms_ruang_id
                WHERE r.id = '${newRegistrasiId}'
            `, s);

            res.status(200).json({
                status: 200,
                message: "Berhasil mengkonversi rawat jalan ke rawat inap",
                data: fullData[0],
                old_registrasi_id: registrasi_id
            });

        } catch (err) {
            await t.rollback();
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async riwayatRegistrasiPasien(req, res) {
        const { no_rm } = req.body; // atau req.query / req.body sesuai kebutuhan
        console.log(req.body)
        try {
            const data = await sq.query(`
                SELECT
                    r.id as registrasi_id,
                    r.no_kunjungan,
                    r.tgl_registrasi,
                    mjl.nama_jenis_layanan,
                    md.nama_dokter,
                    ma.nama_asuransi,
                    r.status_registrasi,
                    hb.status_checkout,
                    mp2.nama_poliklinik,
                    mr.nama_ruang,
                    p.no_rm,
                    p.nama_lengkap,
                    r.dibuat_oleh,
                    r.triage_id
                FROM registrasi r
                JOIN pasien p ON p.id = r.pasien_id
                JOIN ms_jenis_layanan mjl ON mjl.id = r.ms_jenis_layanan_id
                LEFT JOIN ms_dokter md ON md.id = r.ms_dokter_id
                LEFT JOIN ms_asuransi ma ON ma.id = r.ms_asuransi_id
                LEFT JOIN history_bed hb ON hb.registrasi_id = r.id AND hb.tgl_selesai IS NULL
                LEFT JOIN ms_bed mb ON mb.id = hb.ms_bed_id
                LEFT JOIN ms_kamar mk ON mk.id = mb.ms_kamar_id
                LEFT JOIN ms_ruang mr ON mr.id = mk.ms_ruang_id
                LEFT JOIN antrian_list al ON al.registrasi_id = r.id
                LEFT JOIN jadwal_dokter jd ON jd.id = al.jadwal_dokter_id
                LEFT JOIN ms_poliklinik mp2 ON mp2.id = jd.ms_poliklinik_id
                WHERE p.no_rm = '${no_rm}'
                ORDER BY r.tgl_registrasi DESC
            `, s);

            res.status(200).json({ status: 200, message: "success", data });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "error", error });
        }
    }


}
module.exports = Controller;
