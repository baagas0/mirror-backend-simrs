const historyEklaim = require('./model')
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };

class Controller {
    static async register(req, res) {
        const { nomor_sep, request_eklaim, respon_eklaim, status_eklaim, keterangan_eklaim, sinkronisasi_ulang, final_klaim, grouping_stage_one, grouping_stage_two, tanggal_stage_one, tanggal_stage_two, tgl_final, tagihan_id } = req.body;

        try {
            let hasil = await historyEklaim.create({id: uuid_v4(), nomor_sep, request_eklaim, respon_eklaim, status_eklaim, keterangan_eklaim, sinkronisasi_ulang, final_klaim, grouping_stage_one, grouping_stage_two, tanggal_stage_one, tanggal_stage_two, tgl_final, tagihan_id})

            res.status(200).json({ status: 200, message: "sukses", data:hasil })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static update(req, res) {
        const { id, nomor_sep, request_eklaim, respon_eklaim, status_eklaim, keterangan_eklaim, sinkronisasi_ulang, final_klaim, grouping_stage_one, grouping_stage_two, tanggal_stage_one, tanggal_stage_two, tgl_final, tagihan_id } = req.body;

        historyEklaim.update({ nomor_sep, request_eklaim, respon_eklaim, status_eklaim, keterangan_eklaim, sinkronisasi_ulang, final_klaim, grouping_stage_one, grouping_stage_two, tanggal_stage_one, tanggal_stage_two, tgl_final, tagihan_id }, { where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static delete(req, res) {
        const { id } = req.body;

        historyEklaim.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        const { halaman, jumlah, nomor_sep, tagihan_id } = req.body

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }
            if (nomor_sep) {
                isi += ` and he.nomor_sep ilike '%${nomor_sep}%'`
            }
            if (tagihan_id) {
                isi += ` and he.tagihan_id = '${tagihan_id}' `
            }

            let data = await sq.query(`select *, he.id as history_eklaim_id
            from history_eklaim he 
            join tagihan t on t.id = he.tagihan_id
            where he."deletedAt" isnull and t."deletedAt" isnull${isi} 
            order by he."createdAt" desc ${pagination}`, s)

            let jml = await sq.query(`select count(*) from history_eklaim he 
            join tagihan t on t.id = he.tagihan_id
            where he."deletedAt" isnull and t."deletedAt" isnull${isi}`, s)

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static async detailsById(req, res) {
        const { id } = req.params

        try {
            let data = await sq.query(`select he.id as history_eklaim_id,*
            from history_eklaim he 
            join tagihan t on t.id = he.tagihan_id
            where he."deletedAt" isnull and t."deletedAt" isnull and he.id = '${id}'`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
}

module.exports = Controller