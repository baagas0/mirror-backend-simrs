const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');
const s = { type: QueryTypes.SELECT }
const moment = require('moment');
const msJadwalDokter = require('./model');
const jadwalDokter = require('../jadwal_dokter/model');
moment.locale('id')

class Controller {

    static async register(req, res) {
        const { hari_master, waktu_mulai_master, waktu_selesai_master, quota_master, quota_jkn_master, quota_booking_master, status_master, ms_dokter_id, ms_poliklinik_id, ms_jenis_layanan_id, initial_master } = req.body

        const t = await sq.transaction();
        try {
           let cekJadwal = await msJadwalDokter.findAll({where:{hari_master,waktu_mulai_master,waktu_selesai_master,ms_dokter_id,ms_poliklinik_id}})

           if(cekJadwal.length>0){
                res.status(201).json({ status: 204, message: "data sudah ada" })
           }else{
                let tgl
                let jadwal_dokter_id = uuid_v4()
                let cek = (moment().format('dddd').toLowerCase() == hari_master.toLowerCase())?true:false
                for (let i = 0; i < 7; i++) {
                    (moment().add(i,'d').format('dddd').toLowerCase() == hari_master.toLowerCase())?tgl = i: 0
                }
                let x = [{id:uuid_v4(),tgl_jadwal: moment().add(tgl,'d'),waktu_mulai:waktu_mulai_master,waktu_selesai:waktu_selesai_master,hari_jadwal:hari_master,quota:quota_master,quota_jkn:quota_jkn_master,quota_booking:quota_booking_master,status_jadwal:status_master,ms_poliklinik_id,ms_dokter_id,ms_jenis_layanan_id,ms_jadwal_dokter_id:jadwal_dokter_id,initial_jadwal:initial_master}]
                if(cek){
                    x.push({id:uuid_v4(),tgl_jadwal: moment().add(7,'d'),waktu_mulai:waktu_mulai_master,waktu_selesai:waktu_selesai_master,hari_jadwal:hari_master,quota:quota_master,quota_jkn:quota_jkn_master,quota_booking:quota_booking_master,status_jadwal:status_master,ms_poliklinik_id,ms_dokter_id,ms_jenis_layanan_id,ms_jadwal_dokter_id:jadwal_dokter_id,initial_jadwal:initial_master})
                }
                let hasil = await msJadwalDokter.create({ id: jadwal_dokter_id, hari_master, waktu_mulai_master, waktu_selesai_master, quota_master, quota_jkn_master, quota_booking_master, status_master, ms_dokter_id, ms_poliklinik_id, ms_jenis_layanan_id,initial_master },{transaction:t})
                await jadwalDokter.bulkCreate(x,{transaction:t})

                await t.commit()
                res.status(200).json({ status: 200, message: "sukses", data: hasil })
           }
        } catch (error) {
            await t.rollback()
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static update(req, res) {
        const { id, hari_master, waktu_mulai_master, waktu_selesai_master, quota_master, quota_jkn_master, quota_booking_master, status_master, ms_dokter_id, ms_poliklinik_id, ms_jenis_layanan_id, initial_master } = req.body

        msJadwalDokter.update({ hari_master, waktu_mulai_master, waktu_selesai_master, quota_master, quota_jkn_master, quota_booking_master, status_master, ms_dokter_id, ms_poliklinik_id, ms_jenis_layanan_id, initial_master }, { where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static delete(req, res) {
        const { id } = req.body

        msJadwalDokter.destroy({ where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async detailsById(req, res) {
        const { id } = req.body;

        try {
            let data = await sq.query(`select mjd.id as "ms_jadwal_dokter_id",mjd.*,mp.nama_poliklinik,mp.kode_poliklinik,mp.kode_poli_bpjs,md.nama_dokter,md.jk_dokter,md.kode_bpjs,md.nik_dokter,mjl.nama_jenis_layanan,
            mjl.kode_bridge,mjl.kode_jenis_layanan
            from ms_jadwal_dokter mjd 
            join ms_poliklinik mp on mp.id = mjd.ms_poliklinik_id 
            join ms_dokter md on md.id = mjd.ms_dokter_id 
            join ms_jenis_layanan mjl on mjl.id = mjd.ms_jenis_layanan_id
            where mjd."deletedAt" isnull and md."deletedAt" isnull 
            and mjd.id = '${id}'`, s);

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err })
        }
    }

    static async listPerHalaman(req, res) {
        const { ms_poliklinik_id, ms_dokter_id, ms_jenis_layanan_id, nama_jenis_layanan, nama_poliklinik, halaman, jumlah } = req.body

        try {
            let isi = ''
            let offset = (+halaman - 1) * jumlah;

            if (ms_poliklinik_id) {
                isi += ` and mjd.ms_poliklinik_id = '${ms_poliklinik_id}' `
            }
            if (ms_dokter_id) {
                isi += ` and mjd.ms_dokter_id = '${ms_dokter_id}' `
            }
            if (ms_jenis_layanan_id) {
                isi += ` and mjd.ms_jenis_layanan_id = '${ms_jenis_layanan_id}' `
            }
            if (nama_jenis_layanan) {
                isi += ` and mjl.nama_jenis_layanan ilike '%${nama_jenis_layanan}%' `
            }
            if (nama_poliklinik) {
                isi += ` and mp.nama_poliklinik ilike '%${nama_poliklinik}%' `
            }

            let data = await sq.query(`select mjd.id as "ms_jadwal_dokter_id", * from ms_jadwal_dokter mjd 
            join ms_poliklinik mp on mp.id = mjd.ms_poliklinik_id 
            join ms_dokter md on md.id = mjd.ms_dokter_id 
            join ms_jenis_layanan mjl on mjl.id = mjd.ms_jenis_layanan_id 
            where mjd."deletedAt" isnull and mp."deletedAt" isnull and md."deletedAt" isnull and mjl."deletedAt" isnull ${isi} 
            order by mjd."createdAt" desc limit ${jumlah} offset ${offset}`, s)

            let jml = await sq.query(`select count(*) as total from ms_jadwal_dokter mjd 
            join ms_poliklinik mp on mp.id = mjd.ms_poliklinik_id 
            join ms_dokter md on md.id = mjd.ms_dokter_id 
            join ms_jenis_layanan mjl on mjl.id = mjd.ms_jenis_layanan_id 
            where mjd."deletedAt" isnull and mp."deletedAt" isnull and md."deletedAt" isnull and mjl."deletedAt" isnull ${isi}`, s)

            res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].total, jumlah, halaman });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static async list(req, res) {
        const {halaman,jumlah,ms_poliklinik_id,ms_dokter_id,ms_jenis_layanan_id,nama_jenis_layanan,nama_poliklinik,hari_master} = req.body

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if (ms_poliklinik_id) {
                isi += ` and mjd.ms_poliklinik_id = '${ms_poliklinik_id}' `
            }
            if (ms_dokter_id) {
                isi += ` and mjd.ms_dokter_id = '${ms_dokter_id}' `
            }
            if (ms_jenis_layanan_id) {
                isi += ` and mjd.ms_jenis_layanan_id = '${ms_jenis_layanan_id}' `
            }
            if (nama_jenis_layanan) {
                isi += ` and mjl.nama_jenis_layanan ilike '%${nama_jenis_layanan}%' `
            }
            if (nama_poliklinik) {
                isi += ` and mp.nama_poliklinik ilike '%${nama_poliklinik}%' `
            }
            if (hari_master) {
                isi += ` and mjd.hari_master ilike '${hari_master}' `
            }

            let data = await sq.query(`select mjd.id as "ms_jadwal_dokter_id", * from ms_jadwal_dokter mjd 
            join ms_poliklinik mp on mp.id = mjd.ms_poliklinik_id 
            join ms_dokter md on md.id = mjd.ms_dokter_id 
            join ms_jenis_layanan mjl on mjl.id = mjd.ms_jenis_layanan_id 
            where mjd."deletedAt" isnull and mp."deletedAt" isnull and md."deletedAt" isnull and mjl."deletedAt" isnull${isi}
            order by mjd."createdAt" desc ${pagination}`, s)

            let jml = await sq.query(`select count(*) as total from ms_jadwal_dokter mjd 
            join ms_poliklinik mp on mp.id = mjd.ms_poliklinik_id 
            join ms_dokter md on md.id = mjd.ms_dokter_id 
            join ms_jenis_layanan mjl on mjl.id = mjd.ms_jenis_layanan_id 
            where mjd."deletedAt" isnull and mp."deletedAt" isnull and md."deletedAt" isnull and mjl."deletedAt" isnull${isi}`, s)

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].total, jumlah, halaman })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

}

module.exports = Controller