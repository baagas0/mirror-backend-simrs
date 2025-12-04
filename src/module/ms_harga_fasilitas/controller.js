const msHargaFasilitas = require('./model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT }

class Controller {
    static register(req, res) {
        const { harga_beli, harga_jual, ms_fasilitas_id, ms_tarif_id, ms_harga_id } = req.body

        msHargaFasilitas.create({ id: uuid_v4(), harga_beli, harga_jual, ms_fasilitas_id, ms_tarif_id, ms_harga_id }).then(hasil2 => {
            res.status(200).json({ status: 200, message: "sukses", data: hasil2 })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static update(req, res) {
        const { id, harga_beli, harga_jual, ms_fasilitas_id, ms_tarif_id, ms_harga_id } = req.body
        msHargaFasilitas.update({ harga_beli, harga_jual, ms_fasilitas_id, ms_tarif_id, ms_harga_id }, { where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async updateBulk(req, res) {
        const { bulk_ms_harga_fasilitas } = req.body

        try {
            await msHargaFasilitas.bulkCreate(bulk_ms_harga_fasilitas, { updateOnDuplicate: ['harga_beli', 'harga_jual'] })
            res.status(200).json({ status: 200, message: "sukses" })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async list(req, res) {
        const { ms_tarif_id, ms_harga_id, ms_fasilitas_id } = req.body;

        try {
            let isi = ''
            if (ms_tarif_id) {
                isi += ` and mhj.ms_tarif_id = '${ms_tarif_id}'`
            }
            if (ms_harga_id) {
                isi += ` and mhj.ms_harga_id = '${ms_harga_id}'`
            }
            if (ms_fasilitas_id) {
                isi += ` and mhj.ms_fasilitas_id = '${ms_fasilitas_id}'`
            }
            let data = await sq.query(`select mhf.id as "ms_harga_fasilitas_id", * from ms_harga_fasilitas mhf 
            join ms_fasilitas mf on mf.id = mhf.ms_fasilitas_id 
            join ms_harga mh on mh.id = mhf.ms_harga_id 
            join ms_tarif mt on mt.id = mhf.ms_tarif_id 
            where mhf."deletedAt" isnull and mf."deletedAt" isnull and mh."deletedAt" isnull and mt."deletedAt" isnull ${isi} 
            order by mhf."createdAt" desc`, s)
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listPerHalaman(req, res) {
        const { halaman, jumlah, ms_tarif_id, ms_harga_id, ms_fasilitas_id, ms_jenis_fasilitas_id, nama_fasilitas } = req.body;

        try {
            let isi = ''
            let offset = (+halaman - 1) * jumlah;
            if (ms_tarif_id) {
                isi += ` and mhf.ms_tarif_id = '${ms_tarif_id}'`
            }
            if (ms_harga_id) {
                isi += ` and mhf.ms_harga_id = '${ms_harga_id}'`
            }
            if (ms_fasilitas_id) {
                isi += ` and mhf.ms_fasilitas_id = '${ms_fasilitas_id}'`
            }
            if (ms_jenis_fasilitas_id) {
                isi += ` and mf.ms_jenis_fasilitas_id = '${ms_jenis_fasilitas_id}'`
            }
            if (nama_fasilitas) {
                isi += ` and mf.nama_fasilitas ilike '%${nama_fasilitas}%'`
            }

            let data = await sq.query(`select mhf.id as "ms_harga_fasilitas_id", * from ms_harga_fasilitas mhf 
            join ms_fasilitas mf on mf.id = mhf.ms_fasilitas_id 
            join ms_jenis_fasilitas mjf on mjf.id = mf.ms_jenis_fasilitas_id 
            join ms_harga mh on mh.id = mhf.ms_harga_id 
            join ms_tarif mt on mt.id = mhf.ms_tarif_id 
            where mhf."deletedAt" isnull and mf."deletedAt" isnull and mh."deletedAt" isnull and mt."deletedAt" isnull ${isi} 
            order by mhf."createdAt" desc 
            limit ${jumlah} offset ${offset}`, s)

            let jml = await sq.query(`select count(*) as "total" from ms_harga_fasilitas mhf 
            join ms_fasilitas mf on mf.id = mhf.ms_fasilitas_id 
            join ms_jenis_fasilitas mjf on mjf.id = mf.ms_jenis_fasilitas_id 
            join ms_harga mh on mh.id = mhf.ms_harga_id 
            join ms_tarif mt on mt.id = mhf.ms_tarif_id 
            where mhf."deletedAt" isnull and mf."deletedAt" isnull and mh."deletedAt" isnull and mt."deletedAt" isnull ${isi}`, s)

            res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].total, jumlah, halaman })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listMsHargaFasilitasByMsTarifMsHargaId(req, res) {
        const { ms_tarif_id, ms_harga_id } = req.body;

        try {
            let data = await sq.query(`select mhf.id as "ms_harga_fasilitas_id", * from ms_harga_fasilitas mhf 
            join fasilitas f on f.id = mhf.ms_fasilitas_id 
            join ms_harga mh on mh.id = mhf.ms_harga_id 
            join ms_tarif mt on mt.id = mhf.ms_tarif_id 
            where mhf."deletedAt" isnull and f."deletedAt" isnull and mh."deletedAt" isnull and mt."deletedAt" isnull
            and mhj.ms_tarif_id = '${ms_tarif_id}' and mhj.ms_harga_id = '${ms_harga_id}' 
            order by mhf."createdAt" desc`, s)

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async detailsById(req, res) {
        const { id } = req.params
        try {
            let data = await sq.query(`select mhf.id as "ms_harga_fasilitas_id", * from ms_harga_fasilitas mhf 
            join fasilitas f on f.id = mhf.ms_fasilitas_id 
            join ms_harga mh on mh.id = mhf.ms_harga_id 
            join ms_tarif mt on mt.id = mhf.ms_tarif_id 
            where mhf."deletedAt" isnull and f."deletedAt" isnull and mh."deletedAt" isnull and mt."deletedAt" isnull and mhf.id = '${id}'`, s)
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static delete(req, res) {
        const { id } = req.body
        msHargaFasilitas.destroy({ where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async listMsHargaFasilitasByMsHargaId(req, res) {
        const { ms_harga_id } = req.body;
        try {
            let data = await sq.query(`select mhf.id as "ms_harga_fasilitas_id", mhf.*, mf.nama_fasilitas ,mf.ms_jenis_fasilitas_id ,mh.nama_harga ,mh.keterangan ,mt.nama_tarif ,mt.keterangan 
            from ms_harga_fasilitas mhf 
            join ms_fasilitas mf on mf.id = mhf.ms_fasilitas_id 
            join ms_harga mh on mh.id = mhf.ms_harga_id 
            join ms_tarif mt on mt.id = mhf.ms_tarif_id 
            where mhf."deletedAt" isnull and mhf.ms_harga_id = '${ms_harga_id}' 
            order by mhf."createdAt" desc `, s);

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listMsHargaFasilitasByMsTarifId(req, res) {
        const { ms_tarif_id } = req.body
        try {
            let data = await sq.query(`select mhf.id as "ms_harga_fasilitas_id", mhf.*, mf.nama_fasilitas ,mf.ms_jenis_fasilitas_id ,mh.nama_harga ,mh.keterangan ,mt.nama_tarif ,mt.keterangan 
            from ms_harga_fasilitas mhf 
            join ms_fasilitas mf on mf.id = mhf.ms_fasilitas_id 
            join ms_harga mh on mh.id = mhf.ms_harga_id 
            join ms_tarif mt on mt.id = mhf.ms_tarif_id 
            where mhf."deletedAt" isnull and mhf.ms_tarif_id = '${ms_tarif_id}'
            order by mhf."createdAt" desc`, s)

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listFasilitasHargaTarifPerHalaman(req, res) {
        let { ms_harga_id, nama_fasilitas, halaman, jumlah } = req.body
        try {
            let isi = ''
            let offset = (+halaman - 1) * jumlah;
            if (!ms_harga_id) {
                let cek_harga = await sq.query(`select * from ms_harga mh where mh."deletedAt" isnull and mh.nama_harga ilike '%umum%'`, s)
                ms_harga_id = cek_harga[0].id
            }
            if (nama_fasilitas) {
                isi += ` and mf.nama_fasilitas ilike '%${nama_fasilitas}%' `
            }
            let fas = await sq.query(`select distinct mhf.ms_fasilitas_id ,mf.nama_fasilitas ,mhf.ms_harga_id ,mh.nama_harga ,mf.ms_jenis_fasilitas_id ,mjf.nama_jenis_fasilitas 
            from ms_harga_fasilitas mhf 
            join ms_fasilitas mf on mf.id = mhf.ms_fasilitas_id 
            join ms_harga mh on mh.id = mhf.ms_harga_id 
            join ms_jenis_fasilitas mjf on mjf.id = mf.ms_jenis_fasilitas_id 
            where mhf."deletedAt" isnull and mhf.ms_harga_id = '${ms_harga_id}' ${isi} 
            order by mf.nama_fasilitas 
            limit ${jumlah} offset ${offset}`, s)
            let tar = await sq.query(`select distinct mhf.id as "ms_harga_fasilitas_id", mhf.ms_tarif_id ,mt.nama_tarif ,mhf.harga_jual ,mhf.harga_beli, mhf.ms_fasilitas_id  
            from ms_harga_fasilitas mhf 
            join ms_tarif mt on mt.id = mhf.ms_tarif_id 
            where mhf."deletedAt" isnull and mhf.ms_harga_id = '${ms_harga_id}'`, s)
            let jml = await sq.query(`select count(*) as "total" from ms_fasilitas mf 
            join ms_jenis_fasilitas mjf on mjf.id = mf.ms_jenis_fasilitas_id where mf."deletedAt" isnull ${isi}`, s)

            // console.log(fas.length);
            let hasil = []
            for (let i = 0; i < fas.length; i++) {
                let ob = {
                    ms_fasilitas_id: fas[i].ms_fasilitas_id,
                    nama_fasilitas: fas[i].nama_fasilitas,
                    ms_jenis_fasilitas_id: fas[i].ms_jenis_fasilitas_id,
                    ms_harga_id: fas[i].ms_harga_id,
                    nama_harga: fas[i].nama_harga,
                    nama_jenis_fasilitas: fas[i].nama_jenis_fasilitas,
                    harga_fasilitas: []
                }
                for (let j = 0; j < tar.length; j++) {
                    if (tar[j].ms_fasilitas_id == fas[i].ms_fasilitas_id) {
                        ob.harga_fasilitas.push({
                            ms_harga_fasilitas_id: tar[j].ms_harga_fasilitas_id,
                            ms_tarif_id: tar[j].ms_tarif_id,
                            nama_tarif: tar[j].nama_tarif,
                            harga_jual: tar[j].harga_jual,
                            harga_beli: tar[j].harga_beli
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