const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const msBed = require("./model");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };


class Controller {

    static register(req, res) {
        const { nama_bed, cek_bridging, ms_kelas_kamar_id, ms_kamar_id, ruang_aplicares_id, golongan_kelas_aplicares_id, kelas_kamar_sirsonline_id, ms_jenis_layanan_id, status_bed, keterangan_bed } = req.body

        msBed.findAll({ where: { nama_bed: { [Op.iLike]: nama_bed } } }).then(cek_data => {
            if (cek_data.length) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                msBed.create({ id: uuid_v4(), nama_bed, cek_bridging, ms_kelas_kamar_id, ms_kamar_id, ruang_aplicares_id, golongan_kelas_aplicares_id, kelas_kamar_sirsonline_id, ms_jenis_layanan_id, status_bed, keterangan_bed }).then(data => {
                    res.status(200).json({ status: 200, message: "sukses", data });
                })
            }
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static update(req, res) {
        const { id, nama_bed, cek_bridging, ms_kelas_kamar_id, ms_kamar_id, ruang_aplicares_id, golongan_kelas_aplicares_id, kelas_kamar_sirsonline_id, ms_jenis_layanan_id, status_bed, keterangan_bed } = req.body

        msBed.update({ nama_bed, cek_bridging, ms_kelas_kamar_id, ms_kamar_id, ruang_aplicares_id, golongan_kelas_aplicares_id, kelas_kamar_sirsonline_id, ms_jenis_layanan_id, status_bed, keterangan_bed }, { where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static delete(req, res) {
        const { id } = req.body

        msBed.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        const {halaman,jumlah,status_bed,isAvailable, kode_jenis_layanan, search}= req.body

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }


            if(status_bed){
                isi += ` and mb.status_bed=${status_bed}`;
            }
            if (isAvailable) {
                if(isAvailable == 1){
                    isi += ` and (select count(hb.*) from history_bed hb where hb.ms_bed_id=mb.id and hb.status_checkout=0)=0`
                }else{
                    isi += ` and (select count(hb.*) from history_bed hb where hb.ms_bed_id=mb.id and hb.status_checkout=0)>0`
                }
            }
            if(kode_jenis_layanan){
                isi += ` and mjl.kode_jenis_layanan = '${kode_jenis_layanan}'`;
            }
            if(search){
                isi += ` and (mb.nama_bed ilike '%${search}%' or mkk.nama_kelas_kamar ilike '%${search}%' mk.nama_kamar ilike '%${search}%') `;
            }
            let data = await sq.query(`select mb.id as ms_bed_id,* from ms_bed mb 
            join ms_kelas_kamar mkk on mkk.id = mb.ms_kelas_kamar_id 
            join ms_kamar mk on mk.id = mb.ms_kamar_id 
            join ruang_aplicares ra on ra.id = mb.ruang_aplicares_id 
            join ms_golongan_kelas_aplicares mgka on mgka.id = mb.golongan_kelas_aplicares_id 
            join ms_kelas_kamar_sironline mkks  on mkks.id = mb.kelas_kamar_sirsonline_id 
            join ms_jenis_layanan mjl on mjl.id = mb.ms_jenis_layanan_id 
            where mb."deletedAt" isnull${isi} order by mb."createdAt" desc ${pagination}`, s);
            let jml = await sq.query(`select count(*) from ms_bed mb 
            join ms_kelas_kamar mkk on mkk.id = mb.ms_kelas_kamar_id 
            join ms_kamar mk on mk.id = mb.ms_kamar_id 
            join ruang_aplicares ra on ra.id = mb.ruang_aplicares_id 
            join ms_golongan_kelas_aplicares mgka on mgka.id = mb.golongan_kelas_aplicares_id 
            join ms_kelas_kamar_sironline mkks  on mkks.id = mb.kelas_kamar_sirsonline_id 
            join ms_jenis_layanan mjl on mjl.id = mb.ms_jenis_layanan_id 
            where mb."deletedAt" isnull${isi}`, s);

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async detailsById(req, res) {
        const { id } = req.body

        try {
            let data = await sq.query(`select mb.id as ms_bed_id,* from ms_bed mb 
            join ms_kelas_kamar mkk on mkk.id = mb.ms_kelas_kamar_id 
            join ms_kamar mk on mk.id = mb.ms_kamar_id 
            join ruang_aplicares ra on ra.id = mb.ruang_aplicares_id 
            join ms_golongan_kelas_aplicares mgka on mgka.id = mb.golongan_kelas_aplicares_id 
            join ms_kelas_kamar_sironline mkks  on mkks.id = mb.kelas_kamar_sirsonline_id 
            join ms_jenis_layanan mjl on mjl.id = mb.ms_jenis_layanan_id 
            where mb."deletedAt" isnull and mb.id = '${id}'`, s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async detailsByKelasId(req, res) {
        const { ms_kelas_kamar_id, ms_jenis_layanan_id } = req.body

        try {
            let data = await sq.query(`select mb.id as ms_bed_id,* from ms_bed mb 
            join ms_kelas_kamar mkk on mkk.id = mb.ms_kelas_kamar_id 
            join ms_kamar mk on mk.id = mb.ms_kamar_id 
            join ruang_aplicares ra on ra.id = mb.ruang_aplicares_id 
            join ms_golongan_kelas_aplicares mgka on mgka.id = mb.golongan_kelas_aplicares_id 
            join ms_kelas_kamar_sironline mkks  on mkks.id = mb.kelas_kamar_sirsonline_id 
            join ms_jenis_layanan mjl on mjl.id = mb.ms_jenis_layanan_id 
            where mb."deletedAt" isnull and mb.ms_kelas_kamar_id = '${ms_kelas_kamar_id}' and mb.ms_jenis_layanan_id = '${ms_jenis_layanan_id}'`, s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
    static async detailsByParam(req, res) {
        const { ms_kelas_kamar_id, ms_jenis_layanan_id, isAvailable, status_bed } = req.body;
        let query = '';
        query += ms_kelas_kamar_id ? ` and mb.ms_kelas_kamar_id = '${ms_kelas_kamar_id}'` : '';
        query += ms_jenis_layanan_id ? ` and mb.ms_jenis_layanan_id = '${ms_jenis_layanan_id}'` : '';

        query += status_bed ? ` and mb.status_bed=${status_bed}` : '';
        // console.log(query);
        let query2 = '';
        //isAvailable true =ready : false=terpakai
        if (isAvailable != undefined) {
            query2 += isAvailable ? ` and (select count(hb.*) from history_bed hb where hb.ms_bed_id=mb.id and hb.status_checkout=0)=0` : ` and (select count(hb.*) from history_bed hb where hb.ms_bed_id=mb.id and hb.status_checkout=0)>0`;
        }
        try {
            let data = await sq.query(`select mb.id as ms_bed_id,* from ms_bed mb 
            join ms_kelas_kamar mkk on mkk.id = mb.ms_kelas_kamar_id 
            join ms_kamar mk on mk.id = mb.ms_kamar_id 
            join ruang_aplicares ra on ra.id = mb.ruang_aplicares_id 
            join ms_golongan_kelas_aplicares mgka on mgka.id = mb.golongan_kelas_aplicares_id 
            join ms_kelas_kamar_sironline mkks  on mkks.id = mb.kelas_kamar_sirsonline_id 
            join ms_jenis_layanan mjl on mjl.id = mb.ms_jenis_layanan_id 
            where mb."deletedAt" isnull${query}${query2}`, s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
    
    static async monitoring(req, res) {
        const { status_checkout, no_kunjungan, nama_lengkap, no_rm, ms_bed_id, ms_ruang_id, ms_kamar_id, halaman, jumlah } = req.body;

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if (status_checkout) {
                isi += status_checkout == 1 ? ` and hb.status_checkout IS NULL` : ` and hb.status_checkout=0`;
            }
            if(no_kunjungan){
                isi+= ` and r.no_kunjungan='${no_kunjungan}'` 
            }
            if(nama_lengkap){
                isi+= ` and p.nama_lengkap ilike '%${nama_lengkap}%'` 
            }
            if(no_rm){
                isi+= ` and p.no_rm ilike '%${no_rm}%'`
            }
            if(ms_bed_id){
                isi+= ` and mb.id='${ms_bed_id}'`
            }
            if(ms_ruang_id){
                isi+= ` and mr.id='${ms_ruang_id}'`
            }
            if(ms_kamar_id){
                isi+= ` and mk.id='${ms_kamar_id}'`
            }

            let data = await sq.query(`select *,mb.id as ms_bed_id, hb.id as history_bed_id from ms_bed mb 
            join ms_kelas_kamar mkk on mkk.id = mb.ms_kelas_kamar_id 
            join ms_kamar mk on mk.id = mb.ms_kamar_id 
            join ruang_aplicares ra on ra.id = mb.ruang_aplicares_id 
            join ms_golongan_kelas_aplicares mgka on mgka.id = mb.golongan_kelas_aplicares_id 
            join ms_kelas_kamar_sironline mkks  on mkks.id = mb.kelas_kamar_sirsonline_id 
            join ms_jenis_layanan mjl on mjl.id = mb.ms_jenis_layanan_id
            left join history_bed hb on hb.ms_bed_id=mb.id and hb.status_checkout=0
            left join registrasi r on hb.registrasi_id=r.id
            left join pasien p on p.id=r.pasien_id
            join ms_ruang mr on mr.id=mk.ms_ruang_id
            where mb."deletedAt" isnull${isi} order by mb.nama_bed ${pagination}`, s);
            let jml = await sq.query(`select count(*) as total from ms_bed mb 
            join ms_kelas_kamar mkk on mkk.id = mb.ms_kelas_kamar_id 
            join ms_kamar mk on mk.id = mb.ms_kamar_id 
            join ruang_aplicares ra on ra.id = mb.ruang_aplicares_id 
            join ms_golongan_kelas_aplicares mgka on mgka.id = mb.golongan_kelas_aplicares_id 
            join ms_kelas_kamar_sironline mkks  on mkks.id = mb.kelas_kamar_sirsonline_id 
            join ms_jenis_layanan mjl on mjl.id = mb.ms_jenis_layanan_id
            left join history_bed hb on hb.ms_bed_id=mb.id and hb.status_checkout=0
            left join registrasi r on hb.registrasi_id=r.id
            left join pasien p on p.id=r.pasien_id
            join ms_ruang mr on mr.id=mk.ms_ruang_id
            where mb."deletedAt" isnull${isi}`, s);

            res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].total, jumlah, halaman });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
}
module.exports = Controller;