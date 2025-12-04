const msAsuransi = require('./model')
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };

class Controller {
    static async register(req, res) {
        const { nama_asuransi, tipe_asuransi, no_telepon_asuransi, cp_nama, cp_alamat, cp_telepon, cp_hp, cp_email, ms_harga_id } = req.body;

        try {
            let cek_nama = await msAsuransi.findAll({ where: { nama_asuransi: { [Op.iLike]: nama_asuransi } } })
            if (cek_nama.length) {
                res.status(201).json({ status: 204, message: "nama asuransi sudah ada" })
            } else {
                let cek_tipe = await msAsuransi.findAll({ where: {tipe_asuransi} } )
                if (cek_tipe.length >0) {
                    if (cek_tipe[0].dataValues.tipe_asuransi == 1 || cek_tipe[0].dataValues.tipe_asuransi == 2 || cek_tipe[0].dataValues.tipe_asuransi == 5) {
                        res.status(201).json({ status: 204, message: "tipe asuransi sudah ada" })
                    } else {
                        let hasil = await msAsuransi.create({ id: uuid_v4(), nama_asuransi, tipe_asuransi, no_telepon_asuransi, cp_nama, cp_alamat, cp_telepon, cp_hp, cp_email, ms_harga_id })
                        res.status(200).json({ status: 200, message: "sukses", data: hasil });
                    }
                }
            }
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static update(req, res) {
        const { id, nama_asuransi, tipe_asuransi, no_telepon_asuransi, cp_nama, cp_alamat, cp_telepon, cp_hp, cp_email, ms_harga_id } = req.body;

        msAsuransi.update({ nama_asuransi, tipe_asuransi, no_telepon_asuransi, cp_nama, cp_alamat, cp_telepon, cp_hp, cp_email, ms_harga_id }, { where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static delete(req, res) {
        const { id } = req.body;

        msAsuransi.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        const{halaman,jumlah,nama_asuransi,tipe_asuransi,no_telepon_asuransi,ms_harga_id,nama_harga} = req.body

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if(nama_asuransi){
                isi+= ` and ma.nama_asuransi ilike '%${nama_asuransi}%'`
            }
            if(tipe_asuransi){
                isi+= ` and ma.tipe_asuransi = '${tipe_asuransi}'`
            }
            if(no_telepon_asuransi){
                isi+= ` and ma.no_telepon_asuransi ilike '%${no_telepon_asuransi}%'`
            }
            if(ms_harga_id){
                isi+= ` and ma.ms_harga_id = '${ms_harga_id}'`
            }
            if(nama_harga){
                isi+= ` and mh.nama_harga ilike '%${nama_harga}%'`
            }

            let data = await sq.query(`select ma.*,mh.nama_harga from ms_asuransi ma join ms_harga mh on mh.id = ma.ms_harga_id where ma."deletedAt" isnull${isi} order by ma."createdAt" desc ${pagination}`,s);
            let jml = await sq.query(`select count(*) from ms_asuransi ma join ms_harga mh on mh.id = ma.ms_harga_id where ma."deletedAt" isnull${isi} `,s)

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
            let data = await sq.query(`select ma.*,mh.nama_harga from ms_asuransi ma join ms_harga mh on mh.id = ma.ms_harga_id where ma."deletedAt" isnull and ma.id ='${id}'`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
}

module.exports = Controller