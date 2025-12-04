const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const msJenisLayanan = require("./model");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };


class Controller {

    static async register(req, res) {
        const { nama_jenis_layanan, kode_bridge, kode_jenis_layanan } = req.body

        msJenisLayanan.findAll({ where: { nama_jenis_layanan: { [Op.iLike]: nama_jenis_layanan},kode_jenis_layanan} }).then(data => {
            if (data.length > 0) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                msJenisLayanan.create({ id: uuid_v4(), nama_jenis_layanan, kode_bridge, kode_jenis_layanan }).then(data2 => {
                    res.status(200).json({ status: 200, message: "sukses", data:data2 });
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
        const { id, nama_jenis_layanan, kode_bridge, kode_jenis_layanan } = req.body

        msJenisLayanan.update({ nama_jenis_layanan, kode_bridge, kode_jenis_layanan }, { where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static delete(req, res) {
        const { id } = req.body

        msJenisLayanan.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        const{halaman,jumlah,nama_jenis_layanan,kode_bridge,kode_jenis_layanan} = req.body

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if(nama_jenis_layanan){
                isi+= ` and mjl.nama_jenis_layanan ilike '%${nama_jenis_layanan}%'`
            }
            if(kode_bridge){
                isi+= ` and mjl.kode_bridge ilike '%${kode_bridge}%'`
            }
            if(kode_jenis_layanan){
                isi+= ` and mjl.kode_jenis_layanan ilike '%${kode_jenis_layanan}%'`
            }

            let data = await sq.query(`select * from ms_jenis_layanan mjl where mjl."deletedAt" isnull${isi} order by mjl."createdAt" desc ${pagination}`,s);
            let jml = await sq.query(`select count(*) from ms_jenis_layanan mjl where mjl."deletedAt" isnull${isi}`,s)

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static detailsById (req,res){
        const{id} = req.body;

        msJenisLayanan.findAll({where:{id}}).then(data =>{
            res.status(200).json({ status: 200, message: "sukses",data});
        }).catch(err =>{
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }
}
module.exports = Controller;