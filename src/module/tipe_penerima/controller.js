const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const tipePenerima = require("./model");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };


class Controller {

    static async register(req, res) {
        const { ms_jenis_layanan_id, initial, name, status, remark } = req.body

        tipePenerima.findAll({ where: { name: { [Op.iLike]: name }, ms_jenis_layanan_id } }).then( async data => {
            if (data.length) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                await tipePenerima.create({ id: uuid_v4(), ms_jenis_layanan_id, initial, name, status, remark }).then(data2 => {
                    res.status(200).json({ status: 200, message: "sukses", data: data2 });
                })
            }
        }).catch(err => {
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static update(req, res) {
        const { id, ms_jenis_layanan_id, initial, name, status, remark } = req.body
        tipePenerima.findAll({ where: { name: { [Op.iLike]: name }, ms_jenis_layanan_id, id:{[Op.not]:id} }}).then(data => {
            if (data.length > 0) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                tipePenerima.update({ ms_jenis_layanan_id, initial, name, status, remark }, { where: { id } }).then(dataa => {
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

        tipePenerima.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        const{halaman,jumlah,nama_kelas_kamar,keterangan_kelas_kamar} = req.body

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


            let data = await sq.query(`select tp.id as tipe_penerima_id,* from tipe_penerima tp join ms_jenis_layanan mjl on mjl.id = tp.ms_jenis_layanan_id where tp."deletedAt" isnull${isi} order by tp."createdAt" desc ${pagination}`,s);
            let jml = await sq.query(`select count(*) from tipe_penerima tp join ms_jenis_layanan mjl on mjl.id = tp.ms_jenis_layanan_id where tp."deletedAt" isnull${isi}`,s)

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
            let data = await sq.query(`select tp.id as tipe_penerima_id,* 
            from  tipe_penerima tp
            join ms_jenis_layanan mjl on mjl.id = tp.ms_jenis_layanan_id 
            where tp."deletedAt" isnull and tp.id='${id}'`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
}
module.exports = Controller;