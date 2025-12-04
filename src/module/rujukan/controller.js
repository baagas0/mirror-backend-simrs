const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');
const s = { type: QueryTypes.SELECT }
const vclaim = require('../../helper/vclaim');
const rujukan = require('./model');

class Controller {

    static async register(req, res) {
        const { noSep, tglRujukan, tglRencanaKunjungan, ppkDirujuk, jnsPelayanan, catatan, diagRujukan, tipeRujukan, poliRujukan, user, registrasi_id } = req.body
        // "jnsPelayanan": "{1-> rawat inap, 2-> rawat jalan}"
        // "tipeRujukan": "{0->Penuh, 1->Partial, 2->balik PRB}"
        try {
            let x = {
                "request": {
                    "t_rujukan": {
                        "noSep": noSep,
                        "tglRujukan": tglRujukan,
                        "tglRencanaKunjungan": tglRencanaKunjungan,
                        "ppkDirujuk": ppkDirujuk,
                        "jnsPelayanan": jnsPelayanan,
                        "catatan": catatan,
                        "diagRujukan": diagRujukan,
                        "tipeRujukan": tipeRujukan,
                        "poliRujukan": poliRujukan,
                        "user": user
                    }
                }
            }

            const hasil = await vclaim.postBPJS({url_bpjs:`Rujukan/2.0/insert`,payload:x})

            if (hasil.status != 200) {
                await rujukan.create({id:uuid_v4(),request_rujukan:req.body,response_rujukan:hasil,keterangan_rujukan:"gagal created rujukan",registrasi_id,tipe_rujukan:"rujukan"})
                res.status(201).json({ status: hasil.status, message: hasil.message })
            } else {
                await rujukan.create({id:uuid_v4(),request_rujukan:req.body,response_rujukan:hasil.data[0],no_rujukan:hasil.data[0].rujukan.noRujukan,keterangan_rujukan:"rujukan created",registrasi_id,tipe_rujukan:"rujukan"})
                res.status(200).json({ status: 200, message: "sukses", data: hasil.data })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async update(req, res) {
        const { noRujukan, tglRujukan, tglRencanaKunjungan, ppkDirujuk, jnsPelayanan, catatan, diagRujukan, tipeRujukan, poliRujukan, user, registrasi_id } = req.body

        try {
            let x =  {
                "request": {
                    "t_rujukan": {
                        "noRujukan": noRujukan,
                        "tglRujukan": tglRujukan,
                        "tglRencanaKunjungan": tglRencanaKunjungan,
                        "ppkDirujuk": ppkDirujuk,
                        "jnsPelayanan": jnsPelayanan,
                        "catatan": catatan,
                        "diagRujukan": diagRujukan,
                        "tipeRujukan": tipeRujukan,
                        "poliRujukan": poliRujukan,
                        "user": user
                    }
                }
            }

            const hasil = await vclaim.putBPJS({url_bpjs:`Rujukan/2.0/Update`,payload:x})

            if (hasil.status != 200) {
                await rujukan.create({id:uuid_v4(),request_rujukan:req.body,response_rujukan:hasil, no_rujukan: noRujukan,keterangan_rujukan:"gagal updated rujukan",registrasi_id,tipe_rujukan:"rujukan"})
                res.status(201).json({ status: hasil.status, message: hasil.message })
            } else {
                await rujukan.create({id:uuid_v4(),request_rujukan:req.body,response_rujukan:hasil.data[0],no_rujukan: noRujukan, keterangan_rujukan:"rujukan updated",registrasi_id,tipe_rujukan:"rujukan"})
                res.status(200).json({ status: 200, message: "sukses", data: hasil.data })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async delete(req, res) {
        const { noRujukan, user, registrasi_id } = req.body

        try {
            let x =  {
                "request": {
                    "t_rujukan": {
                        "noRujukan": noRujukan,
                        "user": user
                    }
                }
            }

            const hasil = await vclaim.deleteBPJS({url_bpjs:`Rujukan/delete`,payload:x})

            if (hasil.status != 200) {
                await rujukan.create({id:uuid_v4(),request_rujukan:req.body,response_rujukan:hasil,no_rujukan: noRujukan, keterangan_rujukan:"gagal deleted rujukan",registrasi_id,tipe_rujukan:"rujukan"})
                res.status(201).json({ status: hasil.status, message: hasil.message })
            } else {
                await rujukan.create({id:uuid_v4(),request_rujukan:req.body,response_rujukan:hasil,no_rujukan: noRujukan, keterangan_rujukan:"rujukan deleted",registrasi_id,tipe_rujukan:"rujukan"})
                res.status(200).json({ status: 200, message: "sukses", data: hasil.data })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async registerKhusus(req, res) {
        const { noSep, tglRujukan, tglRencanaKunjungan, ppkDirujuk, jnsPelayanan, catatan, diagRujukan, tipeRujukan, poliRujukan, user, registrasi_id } = req.body
        // "jnsPelayanan": "{1-> rawat inap, 2-> rawat jalan}"
        // "tipeRujukan": "{0->Penuh, 1->Partial, 2->balik PRB}"
        try {
            let x = {
                "request": {
                    "t_rujukan": {
                        "noSep": noSep,
                        "tglRujukan": tglRujukan,
                        "tglRencanaKunjungan": tglRencanaKunjungan,
                        "ppkDirujuk": ppkDirujuk,
                        "jnsPelayanan": jnsPelayanan,
                        "catatan": catatan,
                        "diagRujukan": diagRujukan,
                        "tipeRujukan": tipeRujukan,
                        "poliRujukan": poliRujukan,
                        "user": user
                    }
                }
            }

            const hasil = await vclaim.postBPJS({url_bpjs:`Rujukan/2.0/insert`,payload:x})

            if (hasil.status != 200) {
                await rujukan.create({id:uuid_v4(),request_rujukan:req.body,response_rujukan:hasil,keterangan_rujukan:"gagal created rujukan",registrasi_id, tipe_rujukan:"rujukan khusus"})
                res.status(201).json({ status: hasil.status, message: hasil.message })
            } else {
                await rujukan.create({id:uuid_v4(),request_rujukan:req.body,response_rujukan:hasil.data[0],no_rujukan:hasil.data[0].rujukan.noRujukan,keterangan_rujukan:"rujukan created",registrasi_id, tipe_rujukan:"rujukan khusus"})
                res.status(200).json({ status: 200, message: "sukses", data: hasil.data })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }
    
    static async updateKhusus(req, res) {
        const { noRujukan, diagnosa, procedure, user, registrasi_id } = req.body
        //    "diagnosa": [{"kode": "{primer/sekunder};{kodediagnosa}"}]
        //    "procedure":  [{"kode": "{kodeprocedure}"}]
        try {
            let x =  {
                "noRujukan": noRujukan,
                "diagnosa": diagnosa,
                "procedure": procedure,
                "user": user
            }

            const hasil = await vclaim.putBPJS({url_bpjs:`Rujukan/2.0/Update`,payload:x})

            if (hasil.status != 200) {
                await rujukan.create({id:uuid_v4(),request_rujukan:req.body,response_rujukan:hasil, no_rujukan: noRujukan,keterangan_rujukan:"gagal updated rujukan",registrasi_id, tipe_rujukan:"rujukan khusus"})
                res.status(201).json({ status: hasil.status, message: hasil.message })
            } else {
                await rujukan.create({id:uuid_v4(),request_rujukan:req.body,response_rujukan:hasil.data[0],no_rujukan: noRujukan, keterangan_rujukan:"rujukan updated",registrasi_id, tipe_rujukan:"rujukan khusus"})
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