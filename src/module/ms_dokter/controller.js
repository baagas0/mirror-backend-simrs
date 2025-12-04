const msDokter = require('./model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');
const s = { type: QueryTypes.SELECT }
const moment = require('moment');

class Controller {

    static register(req, res) {
        const { nama_dokter, satu_sehat_id, tempat_lahir_dokter, tgl_lahir_dokter, agama_dokter, jk_dokter, no_hp_dokter, email_dokter, edu_bachelor, edu_diploma, edu_doctor, keahlian_khusus, norek_bank, kode_bpjs, kj_str_number, kj_bpjs, tgl_surat, tgl_kadaluarsa_surat, ms_kualifikasi_id, ms_specialist_id, ms_bank_id, nik_dokter, npwp_dokter, ms_tipe_tenaga_medis_id } = req.body
        let f1 = ""
        let f2 = ""
        // if (req.files) {
        //     if (req.files.file1) {
        //         f1 = req.files.file1[0].filename;
        //     }
        //     if (req.files.file2) {
        //         f2 = req.files.file2[0].filename;
        //     }
        // }
        
        if (req.body && req.body.foto_dokter && req.body.foto_dokter.filename) f1 = req.body.foto_dokter.filename
        if (req.body && req.body.tanda_tangan && req.body.tanda_tangan.filename) f2 = req.body.tanda_tangan.filename

        msDokter.create({ id: uuid_v4(), nama_dokter, satu_sehat_id, tempat_lahir_dokter, tgl_lahir_dokter, agama_dokter, jk_dokter, no_hp_dokter, email_dokter, edu_bachelor, edu_diploma, edu_doctor, keahlian_khusus, norek_bank, kode_bpjs, kj_str_number, kj_bpjs, tgl_surat, tgl_kadaluarsa_surat, ms_kualifikasi_id, ms_specialist_id, ms_bank_id, foto_dokter: f1, tanda_tangan: f2, nik_dokter, npwp_dokter, ms_tipe_tenaga_medis_id }).then(hasil2 => {
            res.status(200).json({ status: 200, message: "sukses", data: hasil2 })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })

    }

    static update(req, res) {
        const { id, nama_dokter, satu_sehat_id, tempat_lahir_dokter, tgl_lahir_dokter, agama_dokter, jk_dokter, no_hp_dokter, email_dokter, edu_bachelor, edu_diploma, edu_doctor, keahlian_khusus, norek_bank, kode_bpjs, kj_str_number, kj_bpjs, tgl_surat, tgl_kadaluarsa_surat, ms_kualifikasi_id, ms_specialist_id, ms_bank_id, nik_dokter, npwp_dokter, ms_tipe_tenaga_medis_id } = req.body

        let f1 = ""
        let f2 = ""

        // if (req.files) {
        //     if (req.files.file1) {
        //         f1 = req.files.file1[0].filename;
        //     }
        //     if (req.files.file2) {
        //         f2 = req.files.file2[0].filename;
        //     }
        // }

        if (req.body && req.body.foto_dokter && req.body.foto_dokter.filename) f1 = req.body.foto_dokter.filename
        if (req.body && req.body.tanda_tangan && req.body.tanda_tangan.filename) f2 = req.body.tanda_tangan.filename

        msDokter.update({ nama_dokter, satu_sehat_id, tempat_lahir_dokter, tgl_lahir_dokter, agama_dokter, jk_dokter, no_hp_dokter, email_dokter, edu_bachelor, edu_diploma, edu_doctor, keahlian_khusus, norek_bank, kode_bpjs, kj_str_number, kj_bpjs, tgl_surat, tgl_kadaluarsa_surat, ms_kualifikasi_id, ms_specialist_id, ms_bank_id, nik_dokter, npwp_dokter, foto_dokter: f1, tanda_tangan: f2, ms_tipe_tenaga_medis_id }, { where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async list(req, res) {
        const{halaman,jumlah,nama_dokter,tgl_lahir_dokter,tempat_lahir_dokter,jk_dokter,email_dokter,kj_bpjs,kj_str_number,ms_kualifikasi_id,ms_specialist_id,nik_dokter,npwp_dokter,kode_bpjs,no_hp_dokter, ms_tipe_tenaga_medis_id, kode_tipe_tenaga_medis,kode_tipe_tenaga_medis_array,search} = req.body

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if(nama_dokter){
                isi+= ` and md.nama_dokter ilike '%${nama_dokter}%'`
            }
            if(tgl_lahir_dokter){
                isi+= ` and date(md.tgl_lahir_dokter) = '${tgl_lahir_dokter}'`
            }
            if(tempat_lahir_dokter){
                isi+= ` and md.tempat_lahir_dokter ilike '%${tempat_lahir_dokter}%'`
            }
            if(jk_dokter){
                isi+= ` and md.jk_dokter = '${jk_dokter}'`
            }
            if(email_dokter){
                isi+= ` and md.email_dokter ilike '%${email_dokter}%'`
            }
            if(kj_bpjs){
                isi+= ` and md.kj_bpjs ilike '%${kj_bpjs}%'`
            }
            if(kj_str_number){
                isi+= ` and md.kj_str_number ilike '%${kj_str_number}%'`
            }
            if(ms_kualifikasi_id){
                isi+= ` and md.ms_kualifikasi_id = '${ms_kualifikasi_id}'`
            }
            if(ms_specialist_id){
                isi+= ` and md.ms_specialist_id = '${ms_specialist_id}'`
            }
            if(nik_dokter){
                isi+= ` and md.nik_dokter ilike '%${nik_dokter}%'`
            }
            if(npwp_dokter){
                isi+= ` and md.npwp_dokter ilike '%${npwp_dokter}%'`
            }
            if(kode_bpjs){
                isi+= ` and md.kode_bpjs ilike '%${kode_bpjs}%'`
            }
            if(no_hp_dokter){
                isi+= ` and md.no_hp_dokter ilike '%${no_hp_dokter}%'`
            }
            if(ms_tipe_tenaga_medis_id){
                isi+= ` and md.ms_tipe_tenaga_medis_id = '${ms_tipe_tenaga_medis_id}'`
            }
            if(kode_tipe_tenaga_medis){
                isi+= ` and ttm.kode_tipe_tenaga_medis = '${kode_tipe_tenaga_medis}'`
            }
            if(kode_tipe_tenaga_medis_array && kode_tipe_tenaga_medis_array.length){
                let kode = ''
                let i = 0
                for (const value of kode_tipe_tenaga_medis_array) {
                    i++
                    kode += `'${value}'` + (kode_tipe_tenaga_medis_array.length === i ? '' : ', ')
                }
                
                isi+= ` and ttm.kode_tipe_tenaga_medis in (${kode})`
            }
            if(search){
                isi+= ` and (md.nama_dokter ilike '%${search}%' or md.nik_dokter ilike '%${search}%' or md.npwp_dokter ilike '%${search}%')`
            }
            console.log(isi)
            let data = await sq.query(`select md.id as "ms_dokter_id", * from ms_dokter md left join ms_bank mb on mb.id = md.ms_bank_id left join ms_kualifikasi mk on mk.id = md.ms_kualifikasi_id left join ms_specialist ms on ms.id = md.ms_specialist_id left join ms_tipe_tenaga_medis ttm on ttm.id=md.ms_tipe_tenaga_medis_id where md."deletedAt" isnull${isi} order by md."createdAt" desc ${pagination}`, s);
            let jml = await sq.query(`select count(*) from ms_dokter md left join ms_bank mb on mb.id = md.ms_bank_id left join ms_kualifikasi mk on mk.id = md.ms_kualifikasi_id left join ms_specialist ms on ms.id = md.ms_specialist_id left join ms_tipe_tenaga_medis ttm on ttm.id=md.ms_tipe_tenaga_medis_id where md."deletedAt" isnull${isi}`,s)

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listMsDokterBelumAdaJasaByJasaId(req, res) {
        const{jasa_id}=req.body;

        try {
            let data = await sq.query(`select md.id as "ms_dokter_id",* from ms_dokter md left join ms_bank mb on mb.id = md.ms_bank_id left join ms_kualifikasi mk on mk.id = md.ms_kualifikasi_id left join ms_specialist ms on ms.id = md.ms_specialist_id left join ms_tipe_tenaga_medis ttm on ttm.id=md.ms_tipe_tenaga_medis_id where md."deletedAt" isnull and md.id not in (select jd.dokter_id from jasa_dokter jd where jd."deletedAt" isnull and jd.ms_jasa_id = '${jasa_id}') order by md."createdAt" desc`, s);

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async detailsById(req, res) {
        const { id } = req.body;
        try {
            let data = await sq.query(`select md.id as "ms_dokter_id", * from ms_dokter md left join ms_bank mb on mb.id = md.ms_bank_id left join ms_kualifikasi mk on mk.id = md.ms_kualifikasi_id left join ms_specialist ms on ms.id = md.ms_specialist_id left join ms_tipe_tenaga_medis ttm on ttm.id=md.ms_tipe_tenaga_medis_id where md."deletedAt" isnull and md.id = '${id}'`, s)
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static delete(req, res) {
        const { id } = req.body
        msDokter.destroy({ where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

}

module.exports = Controller