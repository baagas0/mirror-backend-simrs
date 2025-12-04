const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');
const s = { type: QueryTypes.SELECT }
const vclaim = require('../../helper/vclaim');
const spri = require('./model');
const registrasi = require('../registrasi/model');

class Controller {

    static async register(req, res) {
        const { noKartu, kodeDokter, poliKontrol, tglRencanaKontrol, user, registrasi_id } = req.body
        
        try {
            let x =  {
                "request":
                    {
                        "noKartu":noKartu,
                        "kodeDokter":kodeDokter,
                        "poliKontrol":poliKontrol,
                        "tglRencanaKontrol":tglRencanaKontrol,
                        "user":user
                    }
            }

            const hasil = await vclaim.postBPJS({url_bpjs:`RencanaKontrol/InsertSPRI`,payload:x})

            if (hasil.status != 200) {
                await spri.create({id:uuid_v4(),request_spri:req.body,response_spri:hasil,keterangan_spri:"gagal created",registrasi_id})
                res.status(201).json({ status: hasil.status, message: hasil.message })
            } else {
                await spri.create({id:uuid_v4(),request_spri:req.body,response_spri:hasil.data[0],no_spri:hasil.data[0].noSPRI,keterangan_spri:"created",registrasi_id})
                res.status(200).json({ status: 200, message: "sukses", data: hasil.data })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async update(req, res) {
        const { noSPRI, kodeDokter, poliKontrol, tglRencanaKontrol, user, registrasi_id} = req.body

        try {
            let x =  {
                "request":
                    {
                        "noSPRI":noSPRI,
                        "kodeDokter":kodeDokter,
                        "poliKontrol":poliKontrol,
                        "tglRencanaKontrol":tglRencanaKontrol,
                        "user":user
                    }
            }

            const hasil = await vclaim.putBPJS({url_bpjs:`RencanaKontrol/UpdateSPRI`,payload:x})

            if (hasil.status != 200) {
                await spri.create({id:uuid_v4(),request_spri:req.body,response_spri:hasil,no_spri:noSPRI,keterangan_spri:"gagal updated",registrasi_id})
                res.status(201).json({ status: hasil.status, message: hasil.message })
            } else {
                await spri.create({id:uuid_v4(),request_spri:req.body,response_spri:hasil.data[0],no_spri:noSPRI,keterangan_spri:"updated",registrasi_id})
                res.status(200).json({ status: 200, message: "sukses", data: hasil.data })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async list(req, res) {
        const {jumlah, halaman, keterangan_spri, no_spri, registrasi_id, nama_jenis_layanan, no_rm, tgl_mulai, tgl_selesai} = req.body;
        try {
            let isi = ''
            let offset=''
            let pagination=''
    
            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if (keterangan_spri) {
                isi += ` and s.keterangan_spri ilike '${keterangan_spri}'`
            }
            if (no_spri) {
                isi += ` and s.no_spri ilike '%${no_spri}%'`
            }
            if (registrasi_id) {
                isi += ` and s.registrasi_id= '${registrasi_id}'`
            }
            if (nama_jenis_layanan) {
                isi += ` and mjl.nama_jenis_layanan ilike '%${nama_jenis_layanan}%'`
            }
            if (no_rm) {
                isi += ` and p.no_rm ilike '%${no_rm}%'`
            }
            if (tgl_mulai) {
                isi += ` and date(s.request_spri ->> 'tglRencanaKontrol')>= ${tgl_mulai}`
            }
            if (tgl_selesai) {
                isi += ` and date(s.request_spri ->> 'tglRencanaKontrol')<= ${tgl_selesai}`
            }

            let data = await sq.query(`select s.id as spri_id, s.*,r.tgl_registrasi,r.no_identitas_registrasi,r.no_hp_registrasi,r.no_asuransi_registrasi,r.no_rujukan,r.no_kontrol,
            r.no_antrian,r.status_registrasi,r.keterangan_registrasi,r.id_faskes_perujuk,r.dibuat_oleh,r.booking_id,r.ms_jenis_layanan_id,r.kelas_kunjungan_id,r.pasien_id,r.ms_dokter_id,
            r.ms_spesialis_id,r.ms_asuransi_id,r.antrian_loket_id,r.initial_registrasi,r.sebab_sakit,r.no_kunjungan,r.triage_id,p.nama_lengkap,p.nik,p.jenis_kelamin,p.tempat_lahir,
            p.tempat_lahir,p.no_rm,mjl.nama_jenis_layanan,mjl.kode_jenis_layanan
            from spri s 
            left join registrasi r on r.id = s.registrasi_id 
            left join pasien p on p.id = r.pasien_id
            left join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
            where s."deletedAt" isnull${isi} order by s."createdAt" desc ${pagination}`, s);
            let jml = await sq.query(`select count(*) 
            from spri s 
            left join registrasi r on r.id = s.registrasi_id 
            left join pasien p on p.id = r.pasien_id
            left join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
            where s."deletedAt" isnull${isi}`, s);

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman });
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async detailsById(req, res) {
        const { id } = req.body
        try {
            let data = await sq.query(`select s.id as spri_id, s.*,r.tgl_registrasi,r.no_identitas_registrasi,r.no_hp_registrasi,r.no_asuransi_registrasi,r.no_rujukan,r.no_kontrol,
            r.no_antrian,r.status_registrasi,r.keterangan_registrasi,r.id_faskes_perujuk,r.dibuat_oleh,r.booking_id,r.ms_jenis_layanan_id,r.kelas_kunjungan_id,r.pasien_id,r.ms_dokter_id,
            r.ms_spesialis_id,r.ms_asuransi_id,r.antrian_loket_id,r.initial_registrasi,r.sebab_sakit,r.no_kunjungan,r.triage_id,p.nama_lengkap,p.nik,p.jenis_kelamin,p.tempat_lahir,
            p.tempat_lahir,p.no_rm,mjl.nama_jenis_layanan,mjl.kode_jenis_layanan
            from spri s 
            left join registrasi r on r.id = s.registrasi_id 
            left join pasien p on p.id = r.pasien_id
            left join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
            where s."deletedAt" isnull and s.id = '${id}'`, s);

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }
}

module.exports = Controller