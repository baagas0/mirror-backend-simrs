const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const ruangAplicares = require("./model");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };


class Controller {

    static register(req, res) {
        const { nama_ruang_aplicares,kode_ruang_aplicares } = req.body

        ruangAplicares.findAll({ where: { nama_ruang_aplicares: { [Op.iLike]: nama_ruang_aplicares},kode_ruang_aplicares } }).then(data => {
            if (data.length > 0) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                ruangAplicares.create({ id: uuid_v4(), nama_ruang_aplicares,kode_ruang_aplicares }).then(data => {
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
        const { id, nama_ruang_aplicares,kode_ruang_aplicares } = req.body

        ruangAplicares.update({ nama_ruang_aplicares,kode_ruang_aplicares }, { where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static delete(req, res) {
        const { id } = req.body

        ruangAplicares.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        const{halaman,jumlah,nama_ruang_aplicares, kode_ruang_aplicares} = req.body

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if(nama_ruang_aplicares){
                isi+= ` and ra.nama_ruang_aplicares ilike '%${nama_ruang_aplicares}%'`
            }
            if(kode_ruang_aplicares){
                isi+= ` and ra.kode_ruang_aplicares ilike '%${kode_ruang_aplicares}%'`
            }

            let data = await sq.query(`select * from ruang_aplicares ra where ra."deletedAt" isnull${isi} order by ra."createdAt" desc ${pagination}`,s);
            let jml = await sq.query(`select count(*) from ruang_aplicares ra where ra."deletedAt" isnull${isi}`,s)

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static detailsById(req, res) {
        const { id } = req.body

        ruangAplicares.findAll({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses", data });
        }).catch(err => {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }
}
module.exports = Controller;