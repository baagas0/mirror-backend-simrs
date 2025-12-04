const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const kelasKunjungan = require("./model");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };


class Controller {

    static register(req, res) {
        const { nama_kelas_kunjungan, keterangan_kelas_kunjungan, status_kelas_kunjungan, ms_tarif_id, kode_kelas_kunjungan } = req.body

        kelasKunjungan.findAll({ where: { nama_kelas_kunjungan: { [Op.iLike]: nama_kelas_kunjungan } } }).then(data => {
            if (data.length > 0) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                kelasKunjungan.create({ id: uuid_v4(), nama_kelas_kunjungan, keterangan_kelas_kunjungan, status_kelas_kunjungan, ms_tarif_id, kode_kelas_kunjungan }).then(data => {
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
        const { id, nama_kelas_kunjungan, keterangan_kelas_kunjungan, status_kelas_kunjungan, ms_tarif_id, kode_kelas_kunjungan } = req.body

        kelasKunjungan.update({ nama_kelas_kunjungan, keterangan_kelas_kunjungan, status_kelas_kunjungan, ms_tarif_id, kode_kelas_kunjungan }, { where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static delete(req, res) {
        const { id } = req.body

        kelasKunjungan.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        const {halaman,jumlah,nama_kelas_kunjungan,keterangan_kelas_kunjungan,status_kelas_kunjungan,ms_tarif_id, kode_kelas_kunjungan} = req.body
        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }
            
            if(nama_kelas_kunjungan){
                isi+= ` and kk.nama_kelas_kunjungan ilike '%${nama_kelas_kunjungan}%'`
            }
            if(keterangan_kelas_kunjungan){
                isi+= ` and kk.keterangan_kelas_kunjungan ilike '%${keterangan_kelas_kunjungan}%'`
            }
            if(status_kelas_kunjungan){
                isi+= ` and kk.status_kelas_kunjungan = '${status_kelas_kunjungan}'`
            }
            if(ms_tarif_id){
                isi+= ` and kk.ms_tarif_id = '${ms_tarif_id}'`
            }
            if(kode_kelas_kunjungan){
                isi+= ` and kk.kode_kelas_kunjungan ilike '${kode_kelas_kunjungan}'`
            }

            let data = await sq.query(`select kk.id as "kelas_kunjungan_id", * 
			from kelas_kunjungan kk 
			join ms_tarif mt on mt.id = kk.ms_tarif_id 
            where kk."deletedAt" isnull and mt."deletedAt" isnull${isi} 
            order by kk."createdAt" desc ${pagination}`, s);
            let jml = await sq.query(`select count(*) 
            from kelas_kunjungan kk 
			join ms_tarif mt on mt.id = kk.ms_tarif_id 
            where kk."deletedAt" isnull and mt."deletedAt" isnull${isi} `,s)

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async detailsById(req, res) {
        const { id } = req.body;
        try {
            let data = await sq.query(`select kk.id as "kelas_kunjungan_id", * 
            from kelas_kunjungan kk 
            join ms_tarif mt on mt.id = kk.ms_tarif_id 
            where kk."deletedAt" isnull and mt."deletedAt" isnull and kk.id = '${id}'`, s)
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }
}
module.exports = Controller;