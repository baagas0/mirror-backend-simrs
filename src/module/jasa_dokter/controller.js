const jasaDokter = require('./model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT }

class Controller {
    static register(req, res) {
        const { ms_jasa_id, dokter_id } = req.body

        jasaDokter.create({ id: uuid_v4(), ms_jasa_id, dokter_id }).then(hasil2 => {
            res.status(200).json({ status: 200, message: "sukses", data: hasil2 })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static update(req, res) {
        const { id, ms_jasa_id, dokter_id } = req.body
        jasaDokter.update({ ms_jasa_id, dokter_id }, { where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async list(req, res) {
        try {
            let data = await sq.query(`select jd.id as "jasa_dokter_id", * from jasa_dokter jd 
            join ms_jasa mj on mj.id = jd.ms_jasa_id 
            join ms_dokter md on md.id = jd.dokter_id 
            where jd."deletedAt" isnull order by jd."createdAt" desc `, s)
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listPerhalaman(req, res) {
        const {jumlah,halaman,ms_jasa_id,dokter_id,nama_dokter,nama_jasa} = req.body;
        try {
            let offset = (+halaman - 1) * jumlah
            let isi=''
            if(ms_jasa_id){
                isi+=` and jd.ms_jasa_id = '${ms_jasa_id}'`
            }
            if(nama_jasa){
                isi+=` and mj.nama_jasa ilike '%${nama_jasa}%'`
            }
            if(dokter_id){
                isi+=` and jd.dokter_id = '${dokter_id}'`
            }
            if(nama_dokter){
                isi+=` md.nama_dokter ilike '%${nama_dokter}%'`
            }

            let data = await sq.query(`select jd.id as "jasa_dokter_id", * from jasa_dokter jd 
            join ms_jasa mj on mj.id = jd.ms_jasa_id 
            join ms_dokter md on md.id = jd.dokter_id 
            where jd."deletedAt" isnull ${isi} order by jd."createdAt" desc limit ${jumlah} offset ${offset}`, s);
            let jml = await sq.query(`select count(*) as total from jasa_dokter jd 
            join ms_jasa mj on mj.id = jd.ms_jasa_id 
            join ms_dokter md on md.id = jd.dokter_id 
            where jd."deletedAt" isnull ${isi}`, s);

            res.status(200).json({ status: 200, message: "sukses", data: data, count: jml[0].total, jumlah, halaman });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listJasaDokterByMsJasaId(req, res) {
        const {ms_jasa_id} = req.body;
        try {
            let data = await sq.query(`select jd.id as "jasa_dokter_id", * from jasa_dokter jd 
            join ms_jasa mj on mj.id = jd.ms_jasa_id 
            join ms_dokter md on md.id = jd.dokter_id 
            where jd."deletedAt" isnull and jd.ms_jasa_id = '${ms_jasa_id}' order by jd."createdAt" desc`, s)

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async detailsById(req, res) {
        const { id } = req.params
        try {
            let data = await sq.query(`select jd.id as "jasa_dokter_id", * from jasa_dokter jd 
            join ms_jasa mj on mj.id = jd.ms_jasa_id 
            join ms_dokter md on md.id = jd.dokter_id 
            where jd."deletedAt" isnull and jd.id = '${id}'`, s)

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static delete(req, res) {
        const { id } = req.body
        jasaDokter.destroy({ where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }
}

module.exports = Controller