const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const msKelasTerapi = require("./model");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };


class Controller {

    static register(req, res) {
        const { nama_kelas_terapi,is_narkotik } = req.body

        msKelasTerapi.findAll({ where: { nama_kelas_terapi: { [Op.iLike]: nama_kelas_terapi } } }).then(data => {
            if (data.length > 0) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                msKelasTerapi.create({ id: uuid_v4(), nama_kelas_terapi,is_narkotik }).then(data => {
                    res.status(200).json({ status: 200, message: "sukses", data });
                }).catch(err => {
                    
                    res.status(500).json({ status: 500, message: "gagal", data: err });
                })
            }
        }).catch(err => {
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static update(req, res) {
        const { id, nama_kelas_terapi,is_narkotik } = req.body

        msKelasTerapi.update({ nama_kelas_terapi, is_narkotik }, { where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static delete(req, res) {
        const { id } = req.body

        msKelasTerapi.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        const{halaman,jumlah,nama_kelas_terapi,is_narkotik} = req.body

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if(nama_kelas_terapi){
                isi+= ` and mkt.nama_kelas_terapi ilike '%${nama_kelas_terapi}%'`
            }
            if(is_narkotik){
                isi+= ` and mkt.is_narkotik = '${is_narkotik}'`
            }


            let data = await sq.query(`select * from ms_kelas_terapi mkt where mkt."deletedAt" isnull${isi} order by mkt."createdAt" desc ${pagination}`,s);
            let jml = await sq.query(`select count(*) from ms_kelas_terapi mkt where mkt."deletedAt" isnull${isi}`,s)

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static detailsById(req, res) {
        const { id } = req.body

        msKelasTerapi.findAll({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses", data });
        }).catch(err => {
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }
}
module.exports = Controller;