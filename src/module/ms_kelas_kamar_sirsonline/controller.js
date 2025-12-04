const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const kelasKamarSirOnline = require("./model");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };


class Controller {

    static register(req, res) {
        const { nama_kelas_kamar_sironline,kode_bridging_sirs,keterangan_kamar_sironline } = req.body

        kelasKamarSirOnline.findAll({ where: { nama_kelas_kamar_sironline: { [Op.iLike]: nama_kelas_kamar_sironline},kode_bridging_sirs} }).then(data => {
            if (data.length > 0) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                kelasKamarSirOnline.create({ id: uuid_v4(), nama_kelas_kamar_sironline,kode_bridging_sirs,keterangan_kamar_sironline }).then(data => {
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
        const { id, nama_kelas_kamar_sironline,kode_bridging_sirs,keterangan_kamar_sironline } = req.body

        kelasKamarSirOnline.update({ nama_kelas_kamar_sironline,kode_bridging_sirs,keterangan_kamar_sironline }, { where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static delete(req, res) {
        const { id } = req.body

        kelasKamarSirOnline.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        const{halaman,jumlah,nama_kelas_kamar_sironline,kode_bridging_sirs,keterangan_kamar_sironline} = req.body

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if(nama_kelas_kamar_sironline){
                isi+= ` and mkks.nama_kelas_kamar_sironline ilike '%${nama_asuransi}%'`
            }
            if(kode_bridging_sirs){
                isi+= ` and mkks.kode_bridging_sirs ilike '%${kode_bridging_sirs}%'`
            }
            if(keterangan_kamar_sironline){
                isi+= ` and mkks.keterangan_kamar_sironline ilike '%${keterangan_kamar_sironline}%'`
            }

            let data = await sq.query(`select * from ms_kelas_kamar_sironline mkks where mkks."deletedAt" isnull${isi} order by mkks."createdAt" desc ${pagination}`,s);
            let jml = await sq.query(`select count(*) from ms_kelas_kamar_sironline mkks where mkks."deletedAt" isnull${isi}`,s)

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static detailsById(req, res) {
        const { id } = req.body

        kelasKamarSirOnline.findAll({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses", data });
        }).catch(err => {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }
}
module.exports = Controller;