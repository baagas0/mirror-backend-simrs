const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');
const s = { type: QueryTypes.SELECT }
const vclaim = require('../../helper/vclaim');
const rencana_kontrol = require('./model');
const registrasi = require('../registrasi/model');

class Controller {

    static async register(req, res) {
        const { noSEP, kodeDokter, poliKontrol, tglRencanaKontrol, user, registrasi_id } = req.body

        try {
            let x = {
                "request": {
                    "noSEP": noSEP,
                    "kodeDokter": kodeDokter,
                    "poliKontrol": poliKontrol,
                    "tglRencanaKontrol": tglRencanaKontrol,
                    "user": user
                }
            }
            
            const hasil = await vclaim.postBPJS({url_bpjs:`RencanaKontrol/insert`,payload:x})

            if (hasil.status != 200) {
                await rencana_kontrol.create({id:uuid_v4(),request_kontrol:req.body,response_kontrol:hasil,keterangan_kontrol:"gagal created",registrasi_id})
                res.status(201).json({ status: hasil.status, message: hasil.message })
            } else {
                await rencana_kontrol.create({id:uuid_v4(),request_kontrol:req.body,response_kontrol:hasil.data[0],no_surat_kontrol:hasil.data[0].noSuratKontrol,keterangan_kontrol:"created",registrasi_id})
                res.status(200).json({ status: 200, message: "sukses", data: hasil.data })
            }
        } catch (error) {
            console.log(error);
            console.log(req.body);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async update(req, res) {
        const { noSuratKontrol, noSEP, kodeDokter, poliKontrol, tglRencanaKontrol, user, registrasi_id } = req.body
        //tglRencanaKontrol => tgl tidak boleh sama ketika update
        try {
            let x = {
                "request": {
                    "noSuratKontrol": noSuratKontrol,
                    "noSEP": noSEP,
                    "kodeDokter": kodeDokter,
                    "poliKontrol": poliKontrol,
                    "tglRencanaKontrol": tglRencanaKontrol,
                    "user": user
                }
            }
            
            const hasil = await vclaim.putBPJS({url_bpjs:`RencanaKontrol/Update`,payload:x})

            if (hasil.status != 200) {
                await rencana_kontrol.create({id:uuid_v4(),request_kontrol:req.body,response_kontrol:hasil,no_surat_kontrol:noSuratKontrol,keterangan_kontrol:"gagal updated",registrasi_id})
                res.status(201).json({ status: hasil.status, message: hasil.message })
            } else {
                await rencana_kontrol.create({id:uuid_v4(),request_kontrol:req.body,response_kontrol:hasil.data[0],no_surat_kontrol:noSuratKontrol,keterangan_kontrol:"updated",registrasi_id})
                res.status(200).json({ status: 200, message: "sukses", data: hasil.data })
            }
        } catch (error) {
            console.log(error);
            console.log(req.body);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async delete(req, res) {
        const { noSuratKontrol, user, registrasi_id } = req.body

        try {
            let x = {
                "request": {
                    "t_suratkontrol":{
                    "noSuratKontrol": noSuratKontrol,
                    "user": user
                    }
                }
            }
            
            const hasil = await vclaim.deleteBPJS({url_bpjs:`RencanaKontrol/Delete`,payload:x})
            
            if (hasil.message != "Sukses") {
                await rencana_kontrol.create({id:uuid_v4(),request_kontrol:req.body,response_kontrol:hasil,no_surat_kontrol:noSuratKontrol,keterangan_kontrol:"gagal deleted",registrasi_id})
                res.status(201).json({ status: 204, message: hasil.message })
            } else {
                await rencana_kontrol.create({id:uuid_v4(),request_kontrol:req.body,response_kontrol:hasil,no_surat_kontrol:noSuratKontrol,keterangan_kontrol:"deleted",registrasi_id})
                res.status(200).json({ status: 200, message: "sukses", data: [hasil] })
            }
        } catch (error) {
            console.log(error);
            console.log(req.body);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async list(req, res) {
        const {jumlah, halaman, keterangan_kontrol, no_surat_kontrol, registrasi_id, nama_jenis_layanan, no_rm, tgl_mulai, tgl_selesai} = req.body;
        try {
            let isi = ''
            let offset=''
            let pagination=''
    
            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if (keterangan_kontrol) {
                isi += ` and rk.keterangan_kontrol ilike '${keterangan_kontrol}'`
            }
            if (no_surat_kontrol) {
                isi += ` and rk.no_surat_kontrol ilike '%${no_surat_kontrol}%'`
            }
            if (registrasi_id) {
                isi += ` and rk.registrasi_id= '${registrasi_id}'`
            }
            if (nama_jenis_layanan) {
                isi += ` and mjl.nama_jenis_layanan ilike '%${nama_jenis_layanan}%'`
            }
            if (no_rm) {
                isi += ` and p.no_rm ilike '%${no_rm}%'`
            }
            if (tgl_mulai) {
                isi += ` and date(rk.request_kontrol->>'tglRencanaKontrol')>= ${tgl_mulai}`
            }
            if (tgl_selesai) {
                isi += ` and date(rk.request_kontrol->>'tglRencanaKontrol')<= ${tgl_selesai}`
            }

            let data = await sq.query(`select rk.id as rencana_kontrol_id,rk.*,r.tgl_registrasi,r.no_identitas_registrasi,r.no_hp_registrasi,r.no_asuransi_registrasi,r.no_rujukan,r.no_kontrol,
            r.no_antrian,r.status_registrasi,r.keterangan_registrasi,r.id_faskes_perujuk,r.dibuat_oleh,r.booking_id,r.ms_jenis_layanan_id,r.kelas_kunjungan_id,r.pasien_id,r.ms_dokter_id,
            r.ms_spesialis_id,r.ms_asuransi_id,r.antrian_loket_id,r.initial_registrasi,r.sebab_sakit,r.no_kunjungan,r.triage_id,p.nama_lengkap,p.nik,p.jenis_kelamin,p.tempat_lahir,
            p.tempat_lahir,p.no_rm,mjl.nama_jenis_layanan,mjl.kode_jenis_layanan 
            from rencana_kontrol rk 
            join registrasi r on r.id = rk.registrasi_id
            join pasien p on p.id = r.pasien_id 
            join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
            where rk."deletedAt" isnull${isi} order by rk."createdAt" desc ${pagination}`, s);
            let jml = await sq.query(`select count(*) 
            from rencana_kontrol rk 
            join registrasi r on r.id = rk.registrasi_id
            join pasien p on p.id = r.pasien_id 
            join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
            where rk."deletedAt" isnull${isi}`, s);

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman });
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async detailsById(req, res) {
        const { id } = req.body
        try {
            let data = await sq.query(`select rk.id as rencana_kontrol_id,rk.*,r.tgl_registrasi,r.no_identitas_registrasi,r.no_hp_registrasi,r.no_asuransi_registrasi,r.no_rujukan,r.no_kontrol,
            r.no_antrian,r.status_registrasi,r.keterangan_registrasi,r.id_faskes_perujuk,r.dibuat_oleh,r.booking_id,r.ms_jenis_layanan_id,r.kelas_kunjungan_id,r.pasien_id,r.ms_dokter_id,
            r.ms_spesialis_id,r.ms_asuransi_id,r.antrian_loket_id,r.initial_registrasi,r.sebab_sakit,r.no_kunjungan,r.triage_id,p.nama_lengkap,p.nik,p.jenis_kelamin,p.tempat_lahir,
            p.tempat_lahir,p.no_rm,mjl.nama_jenis_layanan,mjl.kode_jenis_layanan 
            from rencana_kontrol rk 
            join registrasi r on r.id = rk.registrasi_id
            join pasien p on p.id = r.pasien_id 
            join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
            where rk."deletedAt" isnull and rk.id = '${id}'`, s);

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }
}

module.exports = Controller