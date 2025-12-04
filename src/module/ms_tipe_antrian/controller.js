const msTipeAntrian = require('./model')
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };

class Controller {
    static async register(req, res) {
        const { nama_tipe_antrian, kode_tipe_antrian, status_tipe_antrian, keterangan_tipe_antrian } = req.body;

        try {
            let [result, created] = await msTipeAntrian.findOrCreate({where:{[Op.or]:[{nama_tipe_antrian:{[Op.iLike]:nama_tipe_antrian}},{kode_tipe_antrian:{[Op.iLike]:kode_tipe_antrian}}]},defaults:{id:uuid_v4(),nama_tipe_antrian,kode_tipe_antrian,status_tipe_antrian,keterangan_tipe_antrian}});
            if(!created){
                return res.status(201).json({ status: 204, message: "data sudah ada", data: [result] });
            }
            res.status(200).json({ status: 200, message: "sukses", data: [result] });
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async update(req, res) {
        const { id, nama_tipe_antrian, kode_tipe_antrian, status_tipe_antrian, keterangan_tipe_antrian } = req.body;
        try {
            if(nama_tipe_antrian || kode_tipe_antrian){
                let isi = ''
                if(nama_tipe_antrian){
                    isi+= ` and mta.nama_tipe_antrian ilike '${nama_tipe_antrian}'`
                }
                if(kode_tipe_antrian){
                    isi+= ` sand mta.kode_tipe_antrian ilike '${kode_tipe_antrian}'`
                }
                let cek = await sq.query(`select * from ms_tipe_antrian mta where mta."deletedAt" isnull${isi} and id <> '${id}'`,s)
                if(cek.length>0){
                    return res.status(201).json({ status: 204, message: "data sudah ada", data: cek });
                }
            }
            
            await msTipeAntrian.update({nama_tipe_antrian,kode_tipe_antrian,status_tipe_antrian,keterangan_tipe_antrian},{where:{id}});
        } catch (error) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
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
        const{halaman,jumlah,nama_tipe_antrian,kode_tipe_antrian,status_tipe_antrian,keterangan_tipe_antrian} = req.body

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if(nama_tipe_antrian){
                isi+= ` and mta.nama_tipe_antrian ilike '%${nama_tipe_antrian}%'`
            }
            if(kode_tipe_antrian){
                isi+= ` and mta.kode_tipe_antrian ilike '%${kode_tipe_antrian}%'`
            }
            if(status_tipe_antrian){
                isi+= ` and mta.status_tipe_antrian = '${status_tipe_antrian}'`
            }
            if(keterangan_tipe_antrian){
                isi+= ` and mta.keterangan_tipe_antrian ilike '%${keterangan_tipe_antrian}%'`
            }
          

            let data = await sq.query(`select * from ms_tipe_antrian mta where mta."deletedAt" isnull${isi} order by ma."createdAt" desc ${pagination}`,s);
            let jml = await sq.query(`select count(*) from ms_tipe_antrian mta where mta."deletedAt" isnull${isi} `,s)

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
            let data = await sq.query(`select * from ms_tipe_antrian mta where mta."deletedAt" isnull and mta.id ='${id}'`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
}

module.exports = Controller