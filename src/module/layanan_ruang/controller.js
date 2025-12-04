const layananRuang = require('./model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT }

class Controller {
    static register(req, res) {
        const { nama_layanan_ruang, initial_layanan_ruang, status_layanan_ruang, keterangan_layanan_ruang, ms_layanan_id } = req.body

        layananRuang.findAll({ [Op.or]: [{ nama_layanan_ruang: { [Op.iLike]: `'%${nama_layanan_ruang}%'` } }, { initial_layanan_ruang }] }).then(hasil1 => {
            if (hasil1.length) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                layananRuang.create({ id: uuid_v4(), nama_layanan_ruang, initial_layanan_ruang, status_layanan_ruang, keterangan_layanan_ruang, ms_layanan_id }).then(hasil2 => {
                    res.status(200).json({ status: 200, message: "sukses", data: hasil2 })
                })
            }
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static update(req, res) {
        const { id, nama_layanan_ruang, initial_layanan_ruang, status_layanan_ruang, keterangan_layanan_ruang, ms_layanan_id } = req.body
        layananRuang.update({ nama_layanan_ruang, initial_layanan_ruang, status_layanan_ruang, keterangan_layanan_ruang, ms_layanan_id }, { where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async list(req, res) {
        const{halaman,jumlah,nama_layanan_ruang,ms_layanan_id,initial_layanan_ruang,status_layanan_ruang} = req.body

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if(ms_layanan_id){
                isi+= ` and lr.ms_layanan_id = '${ms_layanan_id}'`
            }
            if(initial_layanan_ruang){
                isi+= ` and lr.initial_layanan_ruang = '${initial_layanan_ruang}'`
            }
            if(status_layanan_ruang){
                isi+= `  and lr.status_layanan_ruang = '${status_layanan_ruang}'`
            }
            if(nama_layanan_ruang){
                isi+= ` and lr.nama_layanan_ruang ilike '%${nama_layanan_ruang}%'`
            }

            let data = await sq.query(`select lr.id as "layanan_ruang_id", lr.*,ml.nama_layanan,ml.kode_layanan,ml.status_layanan,ml.keterangan_layanan
            from layanan_ruang lr 
            join ms_layanan ml on ml.id = lr.ms_layanan_id
            where lr."deletedAt" isnull
            and ml."deletedAt" isnull${isi}
            order by lr."createdAt" desc ${pagination}`,s);
            let jml = await sq.query(`select count(*) 
            from layanan_ruang lr 
            join ms_layanan ml on ml.id = lr.ms_layanan_id
            where lr."deletedAt" isnull
            and ml."deletedAt" isnull${isi}`,s)

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async detailsById(req, res) {
        const { id } = req.body
        try {
            let data = await sq.query(`select lr.id as "layanan_ruang_id", lr.*,ml.nama_layanan,ml.kode_layanan,ml.status_layanan,ml.keterangan_layanan
            from layanan_ruang lr 
            join ms_layanan ml on ml.id = lr.ms_layanan_id
            where lr."deletedAt" isnull and lr.id = '${id}'`, s);
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listLayananRuangByMsLayananId(req, res) {
        const { ms_layanan_id } = req.body
        try {
            let data = await sq.query(`select lr.id as "layanan_ruang_id", * from layanan_ruang lr join ms_layanan ml on ml.id = lr.ms_layanan_id where lr."deletedAt" isnull and ml."deletedAt" isnull and lr.ms_layanan_id = '${ms_layanan_id}'`, s)
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static delete(req, res) {
        const { id } = req.body
        layananRuang.destroy({ where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }
}

module.exports = Controller