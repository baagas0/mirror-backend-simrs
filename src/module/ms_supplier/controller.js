const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const msSupplier = require("./model");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };


class Controller {

    static register(req, res) {
        const { nama_supplier,no_hp_supplier, alamat_supplier } = req.body

        msSupplier.findAll({ where: { nama_supplier: { [Op.iLike]: nama_supplier } } }).then(data => {
            if (data.length > 0) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                msSupplier.create({ id: uuid_v4(), nama_supplier,no_hp_supplier,alamat_supplier }).then(data => {
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
        const { id, nama_supplier, no_hp_supplier,alamat_supplier } = req.body
        msSupplier.findAll({ where: { [Op.and]:{ nama_supplier: { [Op.iLike]: nama_supplier },id:{[Op.not]:id} }}}).then(data => {
            if (data.length > 0) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                msSupplier.update({ nama_supplier,no_hp_supplier,alamat_supplier }, { where: { id } }).then(dataa => {
                    console.log(dataa);
                    res.status(200).json({ status: 200, message: "sukses" });
                }).catch(err => {
                    res.status(500).json({ status: 500, message: "gagal", data: err });
                })
            }
        }).catch(err => {
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
        
    }

    static delete(req, res) {
        const { id } = req.body

        msSupplier.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        const{halaman,jumlah, nama_supplier, no_hp_supplier, alamat_supplier} = req.body

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if(nama_supplier){
                isi+= ` and ms.nama_supplier ilike '%${nama_supplier}%'`
            }
            if(no_hp_supplier){
                isi+= ` and ms.no_hp_supplier ilike '%${no_hp_supplier}%'`
            }
            if(alamat_supplier){
                isi+= ` and ms.alamat_supplier ilike '%${alamat_supplier}%'`
            }

            let data = await sq.query(`select * from ms_supplier ms where ms."deletedAt" isnull${isi} order by ms."createdAt" desc ${pagination}`,s);
            let jml = await sq.query(`select count(*) from ms_supplier ms where ms."deletedAt" isnull${isi}`,s)

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static detailsById(req, res) {
        const { id } = req.body;

        msSupplier.findAll({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses", data });
        }).catch(err => {
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }
}
module.exports = Controller;