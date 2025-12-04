const ms_harga_penunjang = require('./model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT }

class Controller {
    static register(req, res) {
        const { harga_beli_penunjang, harga_jual_penunjang, penunjang_id, ms_tarif_id, ms_harga_id } = req.body

        ms_harga_penunjang.create({ id: uuid_v4(), harga_beli_penunjang, harga_jual_penunjang, penunjang_id, ms_tarif_id, ms_harga_id}).then(hasil2 => {
            res.status(200).json({ status: 200, message: "sukses", data: hasil2 })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static update(req, res) {
        const { id, harga_beli_penunjang, harga_jual_penunjang, penunjang_id, ms_tarif_id, ms_harga_id } = req.body
        ms_harga_penunjang.update({ harga_beli_penunjang, harga_jual_penunjang, penunjang_id, ms_tarif_id, ms_harga_id  }, { where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async updateBulk(req, res) {
        const { bulk_ms_harga_penunjang } = req.body

        try {
            await ms_harga_penunjang.bulkCreate(bulk_ms_harga_penunjang, { updateOnDuplicate: ['harga_beli_penunjang', 'harga_jual_penunjang', 'id'] })
            res.status(200).json({ status: 200, message: "sukses" })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    // static async list(req, res) {
    //     const { ms_tarif_id, ms_harga_id, penunjang_id } = req.body;

    //     try {
    //         let isi = ''
    //         if (ms_tarif_id) {
    //             isi += ` and mhp.ms_tarif_id = '${ms_tarif_id}'`
    //         }
    //         if (ms_harga_id) {
    //             isi += ` and mhp.ms_harga_id = '${ms_harga_id}'`
    //         }
    //         if (penunjang_id) {
    //             isi += ` and mhp.penunjang_id = '${penunjang_id}'`
    //         }
    //         let data = await sq.query(`select mhp.id as "ms_harga_penunjang", * from ms_harga_penunjang mhp 
    //         join penunjang p on p.id = mhp.penunjang_id 
    //         join ms_harga mh on mh.id = mhp.ms_harga_id 
    //         join ms_tarif mt on mt.id = mhp.ms_tarif_id 
    //         where mhp."deletedAt" isnull and p."deletedAt" isnull and mh."deletedAt" isnull and mt."deletedAt" isnull ${isi} 
    //         order by mhp."createdAt" desc`, s)
    //         res.status(200).json({ status: 200, message: "sukses", data })
    //     } catch (error) {
    //         console.log(error);
    //         res.status(500).json({ status: 500, message: "gagal", data: error })
    //     }
    // }

    static async list(req, res) {
        const { halaman, jumlah, ms_tarif_id, ms_harga_id, penunjang_id, jenis_penunjang_id, nama_penunjang } = req.body;

        try {
            let isi = ''
            let offset = (+halaman - 1) * jumlah;

            let pagination=''

            if(halaman && jumlah){
              offset = (+halaman -1) * jumlah;
              pagination=`limit ${jumlah} offset ${offset}`
            }

            if (ms_tarif_id) {
                isi += ` and mhp.ms_tarif_id = '${ms_tarif_id}'`
            }
            if (ms_harga_id) {
                isi += ` and mhp.ms_harga_id = '${ms_harga_id}'`
            }
            if (penunjang_id) {
                isi += ` and mhp.penunjang_id = '${penunjang_id}'`
            }
            if (jenis_penunjang_id) {
                isi += ` and p.jenis_penunjang_id = '${jenis_penunjang_id}'`
            }
            if (nama_penunjang) {
                isi += ` and p.nama_penunjang ilike '%${nama_penunjang}%'`
            }

            let data = await sq.query(`select mhp.id as "ms_harga_penunjang", * from ms_harga_penunjang mhp 
            join penunjang p on p.id = mhp.penunjang_id 
            join jenis_penunjang jp on jp.id = p.jenis_penunjang_id 
            join ms_harga mh on mh.id = mhp.ms_harga_id 
            join ms_tarif mt on mt.id = mhp.ms_tarif_id 
            where mhp."deletedAt" isnull and p."deletedAt" isnull and mh."deletedAt" isnull and mt."deletedAt" isnull ${isi} 
            order by mhp."createdAt" desc 
            ${pagination}`, s)

            let jml = await sq.query(`select count(*) as "total" from ms_harga_penunjang mhp 
            join penunjang p on p.id = mhp.penunjang_id 
            join jenis_penunjang jp on jp.id = p.jenis_penunjang_id 
            join ms_harga mh on mh.id = mhp.ms_harga_id 
            join ms_tarif mt on mt.id = mhp.ms_tarif_id 
            where mhp."deletedAt" isnull and p."deletedAt" isnull and mh."deletedAt" isnull and mt."deletedAt" isnull ${isi}`, s)

            res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].total, jumlah, halaman })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listms_harga_penunjangByMsTarifMsHargaId(req, res) {
        const { ms_tarif_id, ms_harga_id } = req.body;

        try {
            let data = await sq.query(`select mhp.id as "ms_harga_penunjang", * from ms_harga_penunjang mhp 
            join penunjang f on f.id = mhp.penunjang_id 
            join ms_harga mh on mh.id = mhp.ms_harga_id 
            join ms_tarif mt on mt.id = mhp.ms_tarif_id 
            where mhp."deletedAt" isnull and f."deletedAt" isnull and mh."deletedAt" isnull and mt."deletedAt" isnull
            and mhp.ms_tarif_id = '${ms_tarif_id}' and mhp.ms_harga_id = '${ms_harga_id}' 
            order by mhp."createdAt" desc`, s)

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async detailsById(req, res) {
        const { id } = req.body
        try {
            let data = await sq.query(`select mhp.id as "ms_harga_penunjang", * from ms_harga_penunjang mhp 
            join penunjang f on f.id = mhp.penunjang_id 
            join ms_harga mh on mh.id = mhp.ms_harga_id 
            join ms_tarif mt on mt.id = mhp.ms_tarif_id 
            where mhp."deletedAt" isnull and f."deletedAt" isnull and mh."deletedAt" isnull and mt."deletedAt" isnull and mhp.id = '${id}'`, s)
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static delete(req, res) {
        const { id } = req.body
        ms_harga_penunjang.destroy({ where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async listms_harga_penunjangByMsHargaId(req, res) {
        const { ms_harga_id } = req.body;
        try {
            let data = await sq.query(`select mhp.id as "ms_harga_penunjang", mhp.*, p.nama_penunjang ,p.jenis_penunjang_id ,mh.nama_harga ,mh.keterangan ,mt.nama_tarif ,mt.keterangan 
            from ms_harga_penunjang mhp 
            join penunjang p on p.id = mhp.penunjang_id 
            join ms_harga mh on mh.id = mhp.ms_harga_id 
            join ms_tarif mt on mt.id = mhp.ms_tarif_id 
            where mhp."deletedAt" isnull and mhp.ms_harga_id = '${ms_harga_id}' 
            order by mhp."createdAt" desc `, s);

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listms_harga_penunjangByMsTarifId(req, res) {
        const { ms_tarif_id } = req.body
        try {
            let data = await sq.query(`select mhp.id as "ms_harga_penunjang", mhp.*, p.nama_penunjang ,p.jenis_penunjang_id ,mh.nama_harga ,mh.keterangan ,mt.nama_tarif ,mt.keterangan 
            from ms_harga_penunjang mhp 
            join penunjang p on p.id = mhp.penunjang_id 
            join ms_harga mh on mh.id = mhp.ms_harga_id 
            join ms_tarif mt on mt.id = mhp.ms_tarif_id 
            where mhp."deletedAt" isnull and mhp.ms_tarif_id = '${ms_tarif_id}'
            order by mhp."createdAt" desc`, s)

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listpenunjangHargaTarifPerHalaman(req, res) {
        let { ms_harga_id, nama_penunjang, halaman, jumlah } = req.body
        try {
            let isi = ''
            let offset = (+halaman - 1) * jumlah;
            if (!ms_harga_id) {
                let cek_harga = await sq.query(`select * from ms_harga mh where mh."deletedAt" isnull and mh.nama_harga ilike '%umum%'`, s)
                ms_harga_id = cek_harga[0].id
            }
            if (nama_penunjang) {
                isi += ` and p.nama_penunjang ilike '%${nama_penunjang}%' `
            }
            let fas = await sq.query(`select distinct mhp.penunjang_id ,p.nama_penunjang ,mhp.ms_harga_id ,mh.nama_harga ,p.jenis_penunjang_id ,jp.nama_jenis_penunjang, p.parameter_normal, p.satuan, p.tarif_cbg_id
            from ms_harga_penunjang mhp 
            join penunjang p on p.id = mhp.penunjang_id 
            join ms_harga mh on mh.id = mhp.ms_harga_id 
            join jenis_penunjang jp on jp.id = p.jenis_penunjang_id 
            where mhp."deletedAt" isnull and p."deletedAt" isnull and mhp.ms_harga_id = '${ms_harga_id}' ${isi} 
            order by p.nama_penunjang 
            limit ${jumlah} offset ${offset}`, s)
            let tar = await sq.query(`select distinct mhp.id as "ms_harga_penunjang", mhp.ms_tarif_id ,mt.nama_tarif ,mhp.harga_jual_penunjang ,mhp.harga_beli_penunjang, mhp.penunjang_id  
            from ms_harga_penunjang mhp 
            join ms_tarif mt on mt.id = mhp.ms_tarif_id 
            where mhp."deletedAt" isnull and mhp.ms_harga_id = '${ms_harga_id}'`, s)
            let jml = await sq.query(`select count(*) as "total" from penunjang p 
            join jenis_penunjang jp on jp.id = p.jenis_penunjang_id where p."deletedAt" isnull ${isi}`, s)

            // console.log(fas);
            let hasil = []
            for (let i = 0; i < fas.length; i++) {
                let ob = {
                    penunjang_id: fas[i].penunjang_id,
                    nama_penunjang: fas[i].nama_penunjang,
                    jenis_penunjang_id: fas[i].jenis_penunjang_id,
                    ms_harga_id: fas[i].ms_harga_id,
                    nama_harga: fas[i].nama_harga,
                    nama_jenis_penunjang: fas[i].nama_jenis_penunjang,
                    parameter_normal: fas[i].parameter_normal,
                    satuan: fas[i].satuan,
                    tarif_cbg_id: fas[i].tarif_cbg_id,
                    harga_penunjang: [],
                    operator: fas[i].operator,
                    nilai_r_neonatus_min: fas[i].nilai_r_neonatus_min,
                    nilai_r_neonatus_max: fas[i].nilai_r_neonatus_max,
                    nilai_r_bayi_min: fas[i].nilai_r_bayi_min,
                    nilai_r_bayi_max: fas[i].nilai_r_bayi_max,
                    nilai_r_anak_min: fas[i].nilai_r_anak_min,
                    nilai_r_anak_max: fas[i].nilai_r_anak_max,
                    nilai_r_d_perempuan_min: fas[i].nilai_r_d_perempuan_min,
                    nilai_r_d_perempuan_max: fas[i].nilai_r_d_perempuan_max,
                    nilai_r_d_laki_min: fas[i].nilai_r_d_laki_min,
                    nilai_r_d_laki_max: fas[i].nilai_r_d_laki_max,
                }
                for (let j = 0; j < tar.length; j++) {
                    if (tar[j].penunjang_id == fas[i].penunjang_id) {
                        ob.harga_penunjang.push({
                            ms_harga_penunjang: tar[j].ms_harga_penunjang,
                            ms_tarif_id: tar[j].ms_tarif_id,
                            nama_tarif: tar[j].nama_tarif,
                            harga_jual_penunjang: tar[j].harga_jual_penunjang,
                            harga_beli_penunjang: tar[j].harga_beli_penunjang
                        })
                    }
                }
                hasil.push(ob)
            }

            res.status(200).json({ status: 200, message: "sukses", data: hasil, count: jml[0].total, jumlah, halaman })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }
}

module.exports = Controller
