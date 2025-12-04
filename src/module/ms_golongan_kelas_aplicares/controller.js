const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const golonganKelasAplicares = require("./model");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };


class Controller {

    static register(req, res) {
        const { nama_golongan_kelas_applicares,kode_bridging,kode_ruang,keterangan_golongan_kelas_applicares } = req.body

        golonganKelasAplicares.findAll({ where: { nama_golongan_kelas_applicares: { [Op.iLike]: nama_golongan_kelas_applicares},kode_ruang} }).then(data => {
            if (data.length > 0) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                golonganKelasAplicares.create({ id: uuid_v4(), nama_golongan_kelas_applicares,kode_bridging,kode_ruang,keterangan_golongan_kelas_applicares }).then(data2 => {
                    res.status(200).json({ status: 200, message: "sukses", data: data2 });
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
        const { id, nama_golongan_kelas_applicares,kode_bridging,kode_ruang,keterangan_golongan_kelas_applicares } = req.body

        golonganKelasAplicares.update({ nama_golongan_kelas_applicares,kode_bridging,kode_ruang,keterangan_golongan_kelas_applicares }, { where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static delete(req, res) {
        const { id } = req.body

        golonganKelasAplicares.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        const{halaman,jumlah,nama_golongan_kelas_applicares,kode_bridging,kode_ruang,keterangan_golongan_kelas_applicares} = req.body

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if(nama_golongan_kelas_applicares){
                isi+= ` and mgka.nama_golongan_kelas_applicares ilike '%${nama_asuransi}%'`
            }
            if(kode_bridging){
                isi+= ` and mgka.kode_bridging ilike '%${kode_bridging}%'`
            }
            if(kode_ruang){
                isi+= ` and mgka.kode_ruang ilike '%${kode_ruang}%'`
            }
            if(keterangan_golongan_kelas_applicares){
                isi+= ` and mgka.keterangan_golongan_kelas_applicares ilike '%${kode_ruang}%'`
            }

            let data = await sq.query(`select * from ms_golongan_kelas_aplicares mgka where mgka."deletedAt" isnull${isi} order by mgka."createdAt" desc ${pagination}`,s);
            let jml = await sq.query(`select count(*) from ms_golongan_kelas_aplicares mgka where mgka."deletedAt" isnull${isi}`,s)

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static detailsById(req, res) {
        const { id } = req.body

        golonganKelasAplicares.findAll({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses", data });
        }).catch(err => {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }
}
module.exports = Controller;