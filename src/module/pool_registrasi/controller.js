const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const poolRegistrasi = require('./model')
const poolExternal = require('../pool_external/model')
const s = { type: QueryTypes.SELECT };

class Controller {

    static async register(req, res) {
        const {registrasi_id, tagihan_id, is_main} = req.body;
        
        try {
            let cekPoolExternal = await poolExternal.findAll({where:{tagihan_id}})
            if(cekPoolExternal.length>0){
                res.status(201).json({ status: 204, message: "tagihan ada di pool external" });
            }else{
                const [user, created] = await poolRegistrasi.findOrCreate({where: { registrasi_id,tagihan_id },defaults: {id:uuid_v4(),registrasi_id,tagihan_id,is_main}});

                if(!created){
                    res.status(201).json({ status: 204, message: "data sudah ada" });
                }else{
                    res.status(200).json({ status: 200, message: "sukses",data:user });
                }
            }
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async update(req, res) {
        const { id, registrasi_id, tagihan_id, is_main } = req.body;

        try {
            await poolRegistrasi.update({registrasi_id, tagihan_id, is_main},{where:{id}})
            res.status(200).json({ status: 200, message: "sukses" });
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async delete(req, res) {
        const { id } = req.body;

        try {
            await poolRegistrasi.destroy({where:{id}})
            res.status(200).json({ status: 200, message: "sukses"});
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async list(req, res) {
        const{tagihan_id,registrasi_id} = req.body;

        try {
            let isi=''
            if(tagihan_id){
                isi+= ` and pr.tagihan_id = '${tagihan_id}'`
            }
            if(registrasi_id){
                isi+= ` and pr.registrasi_id = '${registrasi_id}'`
            }

            let data = await sq.query(`select pr.id as pool_registrasi_id,pr.*,t.tgl_tagihan,t.kode_tagihan,t.no_asuransi,t.nama_tagihan,
            r.tgl_registrasi,t.pasien_id, p.no_rm, p.jenis_kelamin, p.tempat_lahir,p.tgl_lahir,t.nama_tagihan,p.nama_lengkap,
            md.nama_dokter, md.no_hp_dokter, md.nik_dokter,ma.nama_asuransi,ma.ms_harga_id,kk.nama_kelas_kunjungan,
            kk.ms_tarif_id,mh.nama_harga,mt.nama_tarif,mjl.nama_jenis_layanan,r.no_kunjungan,p.nik,r.no_identitas_registrasi,r.tgl_registrasi
            from pool_registrasi pr 
            join tagihan t on t.id = pr.tagihan_id 
            join registrasi r on r.id = pr.registrasi_id 
            join pasien p on p.id = r.pasien_id
            join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
            join ms_asuransi ma on ma.id = r.ms_asuransi_id
            join kelas_kunjungan kk on kk.id = r.kelas_kunjungan_id
            join ms_tarif mt on mt.id = kk.ms_tarif_id
            join ms_harga mh on mh.id = ma.ms_harga_id
            left join ms_dokter md on md.id = r.ms_dokter_id
            where pr."deletedAt" isnull${isi} order by pr."createdAt" desc`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async listPoolRegistrasiByTagihanId(req, res) {
        const {tagihan_id} = req.body;
        
        try {
            let data = await sq.query(`select pr.id as pool_registrasi_id,pr.*,t.tgl_tagihan,t.kode_tagihan,t.no_asuransi,t.nama_tagihan,
            r.tgl_registrasi,t.pasien_id, p.no_rm, p.jenis_kelamin, p.tempat_lahir,p.tgl_lahir,t.nama_tagihan,p.nama_lengkap,
            md.nama_dokter, md.no_hp_dokter, md.nik_dokter,ma.nama_asuransi,ma.ms_harga_id,kk.nama_kelas_kunjungan,
            kk.ms_tarif_id,mh.nama_harga,mt.nama_tarif,mjl.nama_jenis_layanan,r.no_kunjungan,p.nik,r.no_identitas_registrasi,r.tgl_registrasi
            from pool_registrasi pr 
            join tagihan t on t.id = pr.tagihan_id 
            join registrasi r on r.id = pr.registrasi_id 
            join pasien p on p.id = r.pasien_id
            join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
            join ms_asuransi ma on ma.id = r.ms_asuransi_id
            join kelas_kunjungan kk on kk.id = r.kelas_kunjungan_id
            join ms_tarif mt on mt.id = kk.ms_tarif_id
            join ms_harga mh on mh.id = ma.ms_harga_id
            left join ms_dokter md on md.id = r.ms_dokter_id
            where pr."deletedAt" isnull 
            and pr.tagihan_id = '${tagihan_id}' order by pr."createdAt" desc`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
    
    static async listPoolRegistrasiByRegistrasiId(req, res) {
        const {registrasi_id} = req.body;
        try {
            let data = await sq.query(`select pr.id as pool_registrasi_id,pr.*,t.tgl_tagihan,t.kode_tagihan,t.no_asuransi,t.nama_tagihan,
            r.tgl_registrasi,t.pasien_id, p.no_rm, p.jenis_kelamin, p.tempat_lahir,p.tgl_lahir,t.nama_tagihan,p.nama_lengkap,
            md.nama_dokter, md.no_hp_dokter, md.nik_dokter,ma.nama_asuransi,ma.ms_harga_id,kk.nama_kelas_kunjungan,
            kk.ms_tarif_id,mh.nama_harga,mt.nama_tarif,mjl.nama_jenis_layanan,r.no_kunjungan,p.nik,r.no_identitas_registrasi,r.tgl_registrasi
            from pool_registrasi pr 
            join tagihan t on t.id = pr.tagihan_id 
            join registrasi r on r.id = pr.registrasi_id 
            join pasien p on p.id = r.pasien_id
            join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
            join ms_asuransi ma on ma.id = r.ms_asuransi_id
            join kelas_kunjungan kk on kk.id = r.kelas_kunjungan_id
            join ms_tarif mt on mt.id = kk.ms_tarif_id
            join ms_harga mh on mh.id = ma.ms_harga_id
            left join ms_dokter md on md.id = r.ms_dokter_id
            where pr."deletedAt" isnull and pr.registrasi_id = '${registrasi_id}' order by pr."createdAt" desc`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async detailsById(req, res) {
        const { id } = req.params

        try {
            let data = await sq.query(`select pr.id as pool_registrasi_id,pr.*,t.tgl_tagihan,t.kode_tagihan,t.no_asuransi,t.nama_tagihan,
            r.tgl_registrasi,t.pasien_id, p.no_rm, p.jenis_kelamin, p.tempat_lahir,p.tgl_lahir,t.nama_tagihan,p.nama_lengkap,
            md.nama_dokter, md.no_hp_dokter, md.nik_dokter,ma.nama_asuransi,ma.ms_harga_id,kk.nama_kelas_kunjungan,
            kk.ms_tarif_id,mh.nama_harga,mt.nama_tarif,mjl.nama_jenis_layanan,r.no_kunjungan,p.nik,r.no_identitas_registrasi,r.tgl_registrasi
            from pool_registrasi pr 
            join tagihan t on t.id = pr.tagihan_id 
            join registrasi r on r.id = pr.registrasi_id 
            join pasien p on p.id = r.pasien_id
            join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
            join ms_asuransi ma on ma.id = r.ms_asuransi_id
            join kelas_kunjungan kk on kk.id = r.kelas_kunjungan_id
            join ms_tarif mt on mt.id = kk.ms_tarif_id
            join ms_harga mh on mh.id = ma.ms_harga_id
            left join ms_dokter md on md.id = r.ms_dokter_id
            where pr."deletedAt" isnull and pr.id = '${id}'`,s);
            
            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async changeMain(req, res) {
        const { id, registrasi_id } = req.body

        try {
            await sq.transaction(async t=>{
                await poolRegistrasi.update({is_main:false},{where:{is_main:true,registrasi_id},transaction:t})
                await poolRegistrasi.update({is_main:true},{where:{id,registrasi_id},transaction:t})
            })
            res.status(200).json({ status: 200, message: "sukses" });            
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
}

module.exports = Controller