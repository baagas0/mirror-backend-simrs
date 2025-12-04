const msPoliklinik = require('./model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT }


class Controller {

    static register(req, res) {
        const { nama_poliklinik, kode_poliklinik, kode_poli_bpjs, satu_sehat_id, nama_subspesialis, kode_subspesialis } = req.body
        msPoliklinik.findAll({ where: { nama_poliklinik: { [Op.iLike]: nama_poliklinik } } }).then(hasil1 => {
            if (hasil1.length) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                msPoliklinik.create({ id: uuid_v4(), nama_poliklinik, kode_poliklinik, kode_poli_bpjs, satu_sehat_id, nama_subspesialis, kode_subspesialis }).then(hasil2 => {
                    res.status(200).json({ status: 200, message: "sukses", data: hasil2 })
                })
            }
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static update(req, res) {
        const { id, nama_poliklinik, kode_poliklinik, kode_poli_bpjs, satu_sehat_id, nama_subspesialis, kode_subspesialis } = req.body
        msPoliklinik.update({ nama_poliklinik, kode_poliklinik, kode_poli_bpjs, satu_sehat_id, nama_subspesialis, kode_subspesialis }, { where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async list(req, res) {
        const{halaman,jumlah,nama_poliklinik,kode_poliklinik,kode_poli_bpjs,satu_sehat_id, nama_subspesialis, kode_subspesialis } = req.body

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if(nama_poliklinik){
                isi+= ` and mp.nama_poliklinik ilike '%${nama_poliklinik}%'`
            }
            if(kode_poliklinik){
                isi+= ` and mp.kode_poliklinik ilike '%${kode_poliklinik}%'`
            }
            if(kode_poli_bpjs){
                isi+= ` and mp.kode_poli_bpjs ilike '%${kode_poli_bpjs}%'`
            }
            if(satu_sehat_id){
                isi+= ` and mp.satu_sehat_id ilike '%${satu_sehat_id}%'`
            }
            if(nama_subspesialis){
                isi+= ` and mp.nama_subspesialis ilike '%${nama_subspesialis}%'`
            }
            if(kode_subspesialis){
                isi+= ` and mp.kode_subspesialis ilike '%${kode_subspesialis}%'`
            }
            
            let data = await sq.query(`select * from ms_poliklinik mp where mp."deletedAt" isnull${isi} order by mp.nama_poliklinik ${pagination}`,s);
            let jml = await sq.query(`select count(*) from ms_poliklinik mp where mp."deletedAt" isnull${isi}`,s)

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async detailsById(req, res) {
        const { id } = req.body;
        try {
            let data = await sq.query(`select * from ms_poliklinik mp where mp."deletedAt" isnull and mp.id = '${id}'`, s)
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static delete(req, res) {
        const { id } = req.body
        msPoliklinik.destroy({ where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

}

module.exports = Controller