const sep = require('./model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, where } = require('sequelize');
const s = { type: QueryTypes.SELECT }
const vclaim = require('../../helper/vclaim');
const registrasi = require('../registrasi/model');

class Controller {

    static async register(req, res) {
        const { noKartu, tglSep, ppkPelayanan, jnsPelayanan, klsRawatHak, klsRawatNaik, pembiayaan, penanggungJawab, noMR, asalRujukan, tglRujukan, noRujukan, ppkRujukan, catatan, diagAwal, tujuan, eksekutif, cob, katarak, lakaLantas, noLP, tglKejadian, keterangan, suplesi, noSepSuplesi, kdPropinsi, kdKabupaten, kdKecamatan, tujuanKunj, flagProcedure, kdPenunjang, assesmentPel, noSurat, kodeDPJP, dpjpLayan, noTelp, user, registrasi_id } = req.body
        
        try {
            let x = {
                request: {
                    t_sep: {
                        noKartu: noKartu,
                        tglSep: tglSep,
                        ppkPelayanan: ppkPelayanan,
                        jnsPelayanan: jnsPelayanan,
                        klsRawat: {
                            klsRawatHak: klsRawatHak,
                            klsRawatNaik: klsRawatNaik,
                            pembiayaan: pembiayaan,
                            penanggungJawab: penanggungJawab
                        },
                        noMR: noMR,
                        rujukan: {
                            asalRujukan: asalRujukan,
                            tglRujukan: tglRujukan,
                            noRujukan: noRujukan,
                            ppkRujukan: ppkRujukan
                        },
                        catatan: catatan,
                        diagAwal: diagAwal,
                        poli: {
                            tujuan: tujuan,
                            eksekutif: eksekutif
                        },
                        cob: {
                            cob: cob
                        },
                        katarak: {
                            katarak: katarak
                        },
                        jaminan: {
                            lakaLantas: lakaLantas,
                            noLP: noLP,
                            penjamin: {
                                tglKejadian: tglKejadian,
                                keterangan: keterangan,
                                suplesi: {
                                    suplesi: suplesi,
                                    noSepSuplesi: noSepSuplesi,
                                    lokasiLaka: {
                                        kdPropinsi: kdPropinsi,
                                        kdKabupaten: kdKabupaten,
                                        kdKecamatan: kdKecamatan
                                    }
                                }
                            }
                        },
                        tujuanKunj: tujuanKunj,
                        flagProcedure: flagProcedure,
                        kdPenunjang: kdPenunjang,
                        assesmentPel: assesmentPel,
                        skdp: {
                            noSurat: noSurat,
                            kodeDPJP: kodeDPJP
                        },
                        dpjpLayan: dpjpLayan,
                        noTelp: noTelp,
                        user: user
                    }
                }
            }

            const hasil = await vclaim.postBPJS({url_bpjs:`SEP/2.0/insert`,payload:x})

            if (hasil.status != 200) {
                await sep.create({ id: uuid_v4(), request:req.body, response:hasil, registrasi_id,keterangan_sep:"gagal created sep", registrasi_id, tipe: "sep" })
                res.status(201).json({ status: 204, message: hasil.message })
            } else {
                await sq.transaction(async t=>{
                    await sep.create({ id: uuid_v4(), request:req.body, response:hasil.data[0], no_sep:hasil.data[0].sep.noSep, registrasi_id,keterangan_sep:"sep created", tipe: "sep" },{transaction:t})
                    await registrasi.update({ no_sep: hasil.data[0].sep.noSep,id_faskes_perujuk:ppkRujukan},{where:{id:registrasi_id},transaction:t})
                })
                res.status(200).json({ status: 200, message: "sukses", data: [hasil.data[0].sep] })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async update(req, res) {
        let { noSep, klsRawatHak, klsRawatNaik, pembiayaan, tglRujukan, penanggungJawab, noMR, catatan, diagAwal, tujuan, eksekutif, cob, katarak, lakaLantas, tglKejadian, suplesi, noSepSuplesi,keterangan, kdPropinsi, kdKabupaten, kdKecamatan, dpjpLayan, noTelp, user, registrasi_id } = req.body

        try {
            let x = {
                request: {
                    t_sep: {
                        noSep: noSep,
                        klsRawat: {
                            klsRawatHak: klsRawatHak,
                            klsRawatNaik: klsRawatNaik,
                            pembiayaan: pembiayaan,
                            penanggungJawab: penanggungJawab
                        },
                        noMR: noMR,
                        catatan: catatan,
                        diagAwal: diagAwal,
                        poli: {
                            tujuan: tujuan,
                            eksekutif: eksekutif
                        },
                        cob: {
                            cob: cob
                        },
                        katarak: {
                            katarak: katarak
                        },
                        jaminan: {
                            lakaLantas: lakaLantas,
                            penjamin: {
                                tglKejadian: tglKejadian,
                                keterangan: keterangan,
                                suplesi: {
                                    suplesi: suplesi,
                                    noSepSuplesi: noSepSuplesi,
                                    lokasiLaka: {
                                        kdPropinsi: kdPropinsi,
                                        kdKabupaten: kdKabupaten,
                                        kdKecamatan: kdKecamatan
                                    }
                                }
                            }
                        },
                        dpjpLayan: dpjpLayan,
                        noTelp: noTelp,
                        user: user
                    }
                }
            }
            // console.log(x);
            const hasil = await vclaim.putBPJS({url_bpjs:`SEP/2.0/update`,payload:x})

            await sq.transaction(async t =>{
                if (hasil.status != 200) {
                    await sep.create({id:uuid_v4(),request:req.body, response:hasil, no_sep:noSep, keterangan_sep:"gagal updated sep", registrasi_id, tipe: "sep"})
                    res.status(201).json({ status: 204, message: hasil.message})
                } else {
                    await sep.create({id:uuid_v4(),request:req.body, response:hasil.data, no_sep:hasil.data[0].sep.noSep,keterangan_sep:"sep updated", registrasi_id, tipe: "sep" })
                    await registrasi.update({ no_sep: hasil.data[0].sep.noSep},{where:{id:registrasi_id},transaction:t})
                    res.status(200).json({ status: 200, message: "sukses", data: [hasil.data[0].sep] })
                }
            })
        } catch (error) {
            console.log(error);
            console.log(req.body);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async list(req, res) {
        const {jumlah, halaman, keterangan_sep, no_sep, registrasi_id, nama_jenis_layanan, no_rm, tgl_mulai, tgl_selesai, tipe} = req.body;
        try {
            let isi = ''
            let offset=''
            let pagination=''
    
            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if (keterangan_sep) {
                isi += ` and s.keterangan_sep ilike '${keterangan_sep}'`
            }
            if (no_sep) {
                isi += ` and s.no_sep ilike '%${no_sep}%'`
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
                isi += ` and date(s.request ->> 'tglSep')>= ${tgl_mulai}`
            }
            if (tgl_selesai) {
                isi += ` and date(s.request ->> 'tglSep')<= ${tgl_selesai}`
            }
            if (tipe) {
                isi += ` and tipe ilike '${tipe}'`
            }

            let data = await sq.query(`select s.id as sep_id,s.*,r.tgl_registrasi,r.no_identitas_registrasi,r.no_hp_registrasi,r.no_asuransi_registrasi,r.no_rujukan,r.no_kontrol,
            r.no_antrian,r.status_registrasi,r.keterangan_registrasi,r.id_faskes_perujuk,r.dibuat_oleh,r.booking_id,r.ms_jenis_layanan_id,r.kelas_kunjungan_id,r.pasien_id,r.ms_dokter_id,
            r.ms_spesialis_id,r.ms_asuransi_id,r.antrian_loket_id,r.initial_registrasi,r.sebab_sakit,r.no_kunjungan,r.triage_id,p.nama_lengkap,p.nik,p.jenis_kelamin,p.tempat_lahir,
            p.tempat_lahir,p.no_rm,mjl.nama_jenis_layanan,mjl.kode_jenis_layanan
            from sep s 
            join registrasi r on r.id = s.registrasi_id
            join pasien p on p.id = r.pasien_id
            join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
            where s."deletedAt" isnull${isi} order by s."createdAt" desc ${pagination}`, s);
            let jml = await sq.query(`select count(*) 
            from sep s 
            join registrasi r on r.id = s.registrasi_id
            join pasien p on p.id = r.pasien_id
            join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
            where s."deletedAt" isnull${isi}`, s);

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman });
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async detailsById(req, res) {
        const { id } = req.body
        try {
            let data = await sq.query(`select s.id as sep_id,s.*,r.tgl_registrasi,r.no_identitas_registrasi,r.no_hp_registrasi,r.no_asuransi_registrasi,r.no_rujukan,r.no_kontrol,
            r.no_antrian,r.status_registrasi,r.keterangan_registrasi,r.id_faskes_perujuk,r.dibuat_oleh,r.booking_id,r.ms_jenis_layanan_id,r.kelas_kunjungan_id,r.pasien_id,r.ms_dokter_id,
            r.ms_spesialis_id,r.ms_asuransi_id,r.antrian_loket_id,r.initial_registrasi,r.sebab_sakit,r.no_kunjungan,r.triage_id,p.nama_lengkap,p.nik,p.jenis_kelamin,p.tempat_lahir,
            p.tempat_lahir,p.no_rm,mjl.nama_jenis_layanan,mjl.kode_jenis_layanan
            from sep s 
            join registrasi r on r.id = s.registrasi_id
            join pasien p on p.id = r.pasien_id
            join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
            where s."deletedAt" isnull and s.id = '${id}'`, s);

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async detailsByRegistrasiId(req, res) {
        const { registrasi_id } = req.body
        try {
            let data = await sq.query(`select s.id as sep_id,* from sep s join registrasi r on r.id = s.registrasi_id where s."deletedAt" isnull and keterangan_sep in('sep created','sep updated') and s.registrasi_id = '${registrasi_id}' order by s."createdAt" desc limit 1`, s);

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static async delete(req, res) {
        const { noSep, user, registrasi_id } = req.body
        try {
            let x = {
                request: {
                   t_sep: {
                      noSep: noSep,
                      user: user
                   }
                }
             }
             const hasil = await vclaim.deleteBPJS({url_bpjs:`SEP/2.0/delete`,payload:x})
             await sq.transaction(async t =>{
                if (hasil.status != 200) {
                    await sep.create({ id: uuid_v4(), request:req.body, response:hasil, no_sep:noSep, registrasi_id, keterangan_sep:"gagal deleted sep", tipe:"sep" },{transaction:t})
                    res.status(201).json({ status: 204, message: hasil.message })
                } else {
                    await registrasi.update({no_sep:null},{where:{id:registrasi_id},transaction:t})
                    await sep.create({ id: uuid_v4(), request:req.body, response:hasil.data[0], no_sep:noSep, registrasi_id, keterangan_sep:"sep deleted", tipe:"sep" },{transaction:t})
                    res.status(200).json({ status: 200, message: "sukses", data: hasil.data })
                }
             })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async deleteInternal(req, res) {
        const { noSep, noSurat, tglRujukanInternal, kdPoliTuj, user, registrasi_id } = req.body
        // noSurat => dari get data sep internal
        try {
            let x = {
                "request": {
                    "t_sep": {
                        "noSep": noSep,
                        "noSurat": noSurat,
                        "tglRujukanInternal": tglRujukanInternal,
                        "kdPoliTuj": kdPoliTuj,
                        "user": user
                    }
                }
            }

             await sq.transaction(async t =>{
                const hasil = await vclaim.deleteBPJS({url_bpjs:`SEP/Internal/delete`,payload:x})

                if (hasil.status != 200) {
                    await sep.create({ id: uuid_v4(), request:req.body, response:hasil, no_sep:noSep, registrasi_id, keterangan_sep:"gagal deleted sep internal", tipe:"sep internal" },{transaction:t})
                    res.status(201).json({ status: 204, message: hasil.message })
                } else {
                    await registrasi.update({no_sep:null},{where:{id:registrasi_id},transaction:t})
                    await sep.create({ id: uuid_v4(), request:req.body, response:hasil.data[0], no_sep:noSep, registrasi_id, keterangan_sep:"sep internal deleted", tipe:"sep internal" },{transaction:t})
                    res.status(200).json({ status: 200, message: "sukses", data: hasil.data })
                }
             })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }
    
    static async pengajuan(req, res) {
        const { noKartu, tglSep, jnsPelayanan, jnsPengajuan, user, keterangan, registrasi_id } = req.body
        // jnsPelayanan => 1.R.Inap 2.R.Jalan
        // jnsPengajuan => 1. pengajuan backdate, 2. pengajuan finger print
        try {
            let x =   {
                "request": {
                   "t_sep": {
                      "noKartu": noKartu,
                      "tglSep": tglSep,
                      "jnsPelayanan": jnsPelayanan,
                      "jnsPengajuan": jnsPengajuan,
                      "keterangan": keterangan,
                      "user": user
                   }
                }
             }

             await sq.transaction(async t =>{
                const hasil = await vclaim.postBPJS({url_bpjs:`Sep/pengajuanSEP`,payload:x})
                if (hasil.status != 200) {
                    await sep.create({ id: uuid_v4(), request:req.body, response:hasil, registrasi_id, keterangan_sep:"gagal created pengajuan sep", no_sep: noKartu, tipe:"pengajuan" },{transaction:t})
                    res.status(201).json({ status: 204, message: hasil.message })
                } else {
                    await sep.create({ id: uuid_v4(), request:req.body, response:hasil, registrasi_id, no_sep:noKartu, keterangan_sep:"pengajuan sep created", tipe:"pengajuan" },{transaction:t})
                    res.status(200).json({ status: 200, message: "sukses", data: hasil.data })
                }
             })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async approvalPengajuanSEP(req, res) {
        const { noKartu, tglSep, jnsPelayanan, jnsPengajuan, user, keterangan, registrasi_id } = req.body
        // jnsPelayanan => 1.R.Inap 2.R.Jalan
        // jnsPengajuan => 1. pengajuan backdate, 2. pengajuan finger print
        try {
            let x = {
                "request": {
                   "t_sep": {
                      "noKartu": noKartu,
                      "tglSep": tglSep,
                      "jnsPelayanan": jnsPelayanan,
                      "keterangan": keterangan,
                      "user": user
                   }
                }
             }
             if(jnsPengajuan){
                x.request.t_sep.jnsPengajuan = jnsPengajuan
             }	

             await sq.transaction(async t =>{
                const hasil = await vclaim.postBPJS({url_bpjs:`Sep/aprovalSEP`,payload:x})
                if (hasil.status != 200) {
                    // await sep.create({ id: uuid_v4(), request:req.body, response:hasil, registrasi_id, keterangan_sep:"gagal created", no_sep: noKartu, tipe:"approval pengajuan sep" },{transaction:t})
                    res.status(201).json({ status: 204, message: hasil.message })
                } else {
                    // await sep.create({ id: uuid_v4(), request:req.body, response:hasil, registrasi_id, no_sep:noKartu, keterangan_sep:"created", tipe:"approval pengajuan sep" },{transaction:t})
                    res.status(200).json({ status: 200, message: "sukses", data: hasil.data })
                }
             })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async updateTanggalPulang(req, res) {
        const { noSep, statusPulang, noSuratMeninggal, tglMeninggal, tglPulang, noLPManual, user, registrasi_id } = req.body
        // ststusPulang => 1:Atas Persetujuan Dokter, 3:Atas Permintaan Sendiri, 4:Meninggal, 5:Lain-lai

        try {
            let x = {
                "request":{
                    "t_sep":{
                        "noSep": noSep,
                        "statusPulang": statusPulang,
                        "noSuratMeninggal":noSuratMeninggal,
                        "tglMeninggal": tglMeninggal,
                        "tglPulang": tglPulang,
                        "noLPManual": noLPManual,
                        "user": user
                    }
                }
            }

             await sq.transaction(async t =>{
                const hasil = await vclaim.putBPJS({url_bpjs:`SEP/2.0/updtglplg`,payload:x})
                if (hasil.status != 200) {
                    await sep.create({ id: uuid_v4(), request:req.body, response:hasil, registrasi_id, keterangan_sep:"gagal update tanggal pulang", no_sep: noSep, tipe:"sep" },{transaction:t})
                    res.status(201).json({ status: 204, message: hasil.message })
                } else {
                    await sep.create({ id: uuid_v4(), request:req.body, response:hasil, registrasi_id, no_sep:noSep, keterangan_sep:"tanggal pulang updated", tipe:"sep" },{transaction:t})
                    res.status(200).json({ status: 200, message: "sukses", data: hasil.data })
                }
             })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }
}

module.exports = Controller