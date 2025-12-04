// const msBank = require('./model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const { query } = require('express');
const s = { type: QueryTypes.SELECT }


class Controller {

    static async statistik_poliklinik(req, res) {
        const { tanggal_awal, tanggal_akhir } = req.body
        try {
            // if (!tanggal_awal || !tanggal_akhir) {
            //     res.status(500).json({ status: 500, message: "Silahkan mengisi tanggal awal & akhir", data: {} })
            //     return
            // }

            let cond = ''

            // Static Condition
            cond += ' and A."deletedAt" isnull '

            if (tanggal_awal) {
                cond += ` and A.tgl_registrasi::date >= '${tanggal_awal}' `
            }
            if (tanggal_akhir) {
                cond += ` and A.tgl_registrasi::date <= '${tanggal_akhir}'`
            }

            const q = `
                with data_jumlah as (
                    select
                        D.id, D.nama_poliklinik, D.kode_poliklinik, count(A.id) as jumlah_kunjungan
                    from registrasi A
                        join antrian_list B on B.registrasi_id = A.id
                        join jadwal_dokter C on C.id = B.jadwal_dokter_id
                        join ms_poliklinik D on D.id = C.ms_poliklinik_id
                    where true ${cond}
                    group by D.id
                )
                
                select A.*, coalesce(B.jumlah_kunjungan, 0) as jumlah_kunjungan 
                    from ms_poliklinik A
                    left join data_jumlah B on B.id = A.id
                    where true and A."deletedAt" isnull
            `
            // console.log(q)
            let data = await sq.query(q, s)

            

            res.status(200).json({ status: 200, message: "sukses", data:data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static async statistik_diagnosa(req,res){
        const {tanggal_awal,tanggal_akhir,kode_diagnosa,nama_diagnosa}=req.body

        try {
            let isi = ''
            if(tanggal_awal){
                isi+= ` and px.tanggal >= '${tanggal_awal}'`
            }
            if(tanggal_akhir){
                isi+= ` and px.tanggal <= '${tanggal_akhir}'`
            }
            if(kode_diagnosa){
                isi+= ` and px.kode_diagnosa ilike '%${kode_diagnosa}%'`
            }
            if(nama_diagnosa){
                isi+= ` and px.nama_diagnosa ilike '%${nama_diagnosa}%'`
            }
            
            let data = await sq.query(`select px.kode_diagnosa,px.nama_diagnosa,count(*)::int as total
            from (select p.* -> 'diagnosa' ->> 'kode_diagnosa' as kode_diagnosa, p.* -> 'diagnosa' ->> 'nama_diagnosa' as nama_diagnosa,
            date(amr."createdAt")as tanggal, 'medis_rajal' as tipe, amr."createdAt", amr."updatedAt", amr."deletedAt"
            from assesment_medis_rjalan amr 
            cross join jsonb_array_elements(amr.json_assesment_medis_rjalan->'assesment'->'diagnosa') p
            where amr."deletedAt" isnull and amr.json_assesment_medis_rjalan notnull and p.* ->> 'tipe_diagnosa' = 'ICD'
            union all
            select p.* -> 'diagnosa' ->> 'kode_diagnosa' as kode_diagnosa, p.* -> 'diagnosa' ->> 'nama_diagnosa' as nama_diagnosa,
            date(ami."createdAt")as tanggal, 'medis_igd' as tipe, ami."createdAt",ami."updatedAt",ami."deletedAt"
            from assesment_medis_igd ami 
            cross join jsonb_array_elements(ami.json_assesment_medis_igd ->'assesment'->'diagnosa') p
            where ami."deletedAt" isnull and ami.json_assesment_medis_igd notnull and p.* ->> 'tipe_diagnosa' = 'ICD'
            union all
            select p.* -> 'diagnosa' ->> 'kode_diagnosa' as kode_diagnosa, p.* -> 'diagnosa' ->> 'nama_diagnosa' as nama_diagnosa,
            date(c."createdAt")as tanggal, 'cppt_dr' as tipe,c."createdAt",c."updatedAt",c."deletedAt"
            from cppt c 
            cross join json_array_elements(c.asesmen->'assesment'->'diagnosa') p
            join ms_tipe_tenaga_medis mttm on mttm.id = c.ms_tipe_tenaga_medis_id 
            where c."deletedAt" isnull and mttm.kode_tipe_tenaga_medis = 'Dr'
            and c.asesmen notnull and p.* ->> 'tipe_diagnosa' = 'ICD') px
            where px."deletedAt" isnull${isi}
            group by px.kode_diagnosa,px.nama_diagnosa
            order by count(*) desc,px.kode_diagnosa,px.nama_diagnosa`,s)

            res.status(200).json({ status: 200, message: "sukses",data })
        } catch (error) {
             console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

}

module.exports = Controller