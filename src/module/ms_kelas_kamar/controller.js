const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const msKelasKamar = require("./model");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };


class Controller {

    static register(req, res) {
        const { tipe_kelas_kamar, nama_kelas_kamar,keterangan_kelas_kamar, ms_fasilitas_id } = req.body

        msKelasKamar.findAll({ where: { nama_kelas_kamar: { [Op.iLike]: nama_kelas_kamar } } }).then(data => {
            if (data.length > 0) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                msKelasKamar.create({ id: uuid_v4(), tipe_kelas_kamar, nama_kelas_kamar,keterangan_kelas_kamar, ms_fasilitas_id }).then(data => {
                    res.status(200).json({ status: 200, message: "sukses", data });
                }).catch(err => {
                    console.log(req.body);
                    console.log(err);
                    res.status(500).json({ status: 500, message: "gagal", data: err });
                })
            }
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static update(req, res) {
        const { id, tipe_kelas_kamar, nama_kelas_kamar, keterangan_kelas_kamar, ms_fasilitas_id } = req.body

        msKelasKamar.update({ tipe_kelas_kamar, nama_kelas_kamar, keterangan_kelas_kamar, ms_fasilitas_id }, { where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static delete(req, res) {
        const { id } = req.body

        msKelasKamar.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        const{halaman,jumlah,nama_kelas_kamar,keterangan_kelas_kamar, ms_fasilitas_id, tipe_kelas_kamar} = req.body

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if(nama_kelas_kamar){
                isi+= ` and mkk.nama_kelas_kamar ilike '%${nama_kelas_kamar}%'`
            }
            if(keterangan_kelas_kamar){
                isi+= ` and mkk.keterangan_kelas_kamar ilike '%${keterangan_kelas_kamar}%'`
            }
            if(ms_fasilitas_id){
                isi += ` and mkk.ms_fasilitas_id = '${ms_fasilitas_id}' `
            }
            if (tipe_kelas_kamar) {
                isi += ` and mkk.tipe_kelas_kamar = '${tipe_kelas_kamar}' `
            }

            let data = await sq.query(`select mkk.id as kelas_kamar_id, *, mkk.id as id from ms_kelas_kamar mkk left join ms_fasilitas mf on mf.id = mkk.ms_fasilitas_id where mkk."deletedAt" isnull${isi} order by mkk."createdAt" desc ${pagination}`,s);
            let jml = await sq.query(`select count(*) from ms_kelas_kamar mkk left join ms_fasilitas mf on mf.id = mkk.ms_fasilitas_id where mkk."deletedAt" isnull${isi}`,s)

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async detailsById(req, res) {
        const { id } = req.body
        let isi = ` and mkk.id = '${id}' `
        let data = await sq.query(`select mkk.id as kelas_kamar_id, *, mkk.id as id from ms_kelas_kamar mkk left join ms_fasilitas mf on mf.id = mkk.ms_fasilitas_id where mkk."deletedAt" isnull${isi} `,s);
        res.status(200).json({ status: 200, message: "sukses", data });
        // msKelasKamar.findAll({ 
        //     attributes: [['id', 'kelas_kamar_id '], 'nama_kelas_kamar', 'keterangan_kelas_kamar', 'ms_fasilitas_id'],
        //     where: { id }
        // }).then(data => {
        //     res.status(200).json({ status: 200, message: "sukses", data });
        // }).catch(err => {
        //     console.log(err);
        //     res.status(500).json({ status: 500, message: "gagal", data: err });
        // })
    }
}
module.exports = Controller;