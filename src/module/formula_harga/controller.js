const formulaHarga = require('./model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT }

class Controller {
    static async register(req, res) {
        const { persentase, keterangan, bulk_tarif } = req.body

        try {
            let harga = await sq.query(`select * from ms_harga mh where mh."deletedAt" isnull `, s)

            let bulk_formula = []
            for (let i = 0; i < bulk_tarif.length; i++) {
                for (let j = 0; j < harga.length; j++) {
                    let obj = {
                        id: uuid_v4(),
                        ms_harga_id: harga[j].id,
                        ms_tarif_id: bulk_tarif[i].ms_tarif_id,
                        persentase: 0,
                        keterangan: keterangan
                    }
                    if (harga[j].nama_harga == 'BPJS') {
                        obj.persentase = 1.25
                    }
                    if (harga[j].nama_harga == 'UMUM') {
                        obj.persentase = 1.6
                    }
                    if (harga[j].nama_harga == 'PT DAN ASURANSI') {
                        obj.persentase = 1.6
                    }
                    if (harga[j].nama_harga == 'RUMAH SAKIT') {
                        obj.persentase = 1.6
                    }
                    
                    bulk_formula.push(obj)
                }
            }

            let formula_harga = await formulaHarga.bulkCreate(bulk_formula)

            res.status(200).json({ status: 200, message: "sukses", data: formula_harga  })

        } catch (error) {
            console.log(error);
            console.log(req.body);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static update(req, res) {
        const { id, ms_harga_id, ms_tarif_id, persentase, keterangan } = req.body
        formulaHarga.update({ ms_harga_id, ms_tarif_id, persentase, keterangan }, { where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async updateBulk(req, res) {
        const { bulk_formula_harga } = req.body

        try {
            await formulaHarga.bulkCreate(bulk_formula_harga, { updateOnDuplicate: ['persentase'] })
            res.status(200).json({ status: 200, message: "sukses" })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async list(req, res) {
        const { ms_tarif_id, ms_harga_id } = req.body;

        try {
            let isi = ''
            if (ms_tarif_id) {
                isi += ` and fh.ms_tarif_id = '${ms_tarif_id}'`
            }
            if (ms_harga_id) {
                isi += ` and fh.ms_harga_id = '${ms_harga_id}'`
            }
            let data = await sq.query(`select fh.id as "formula_harga_id", * 
            from formula_harga fh 
            join ms_harga mh on mh.id = fh.ms_harga_id 
            join ms_tarif mt on mt.id = fh.ms_tarif_id 
            where fh."deletedAt" isnull and mh."deletedAt" isnull and mt."deletedAt" isnull ${isi}
            order by fh."createdAt" desc `, s)

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listPerHalaman(req, res) {
        const { halaman, jumlah, ms_tarif_id, ms_harga_id } = req.body;

        try {
            let isi = ''
            let offset = (+halaman - 1) * jumlah;
            if (ms_tarif_id) {
                isi += ` and fh.ms_tarif_id = '${ms_tarif_id}'`
            }
            if (ms_harga_id) {
                isi += ` and fh.ms_harga_id = '${ms_harga_id}'`
            }

            let data = await sq.query(`select fh.id as "formula_harga_id", * 
            from formula_harga fh 
            join ms_harga mh on mh.id = fh.ms_harga_id 
            join ms_tarif mt on mt.id = fh.ms_tarif_id 
            where fh."deletedAt" isnull and mh."deletedAt" isnull and mt."deletedAt" isnull ${isi}
            order by fh."createdAt" desc  
            limit ${jumlah} offset ${offset}`, s)

            let jml = await sq.query(`select count(*) as "total" from formula_harga fh 
            join ms_harga mh on mh.id = fh.ms_harga_id 
            join ms_tarif mt on mt.id = fh.ms_tarif_id 
            where fh."deletedAt" isnull and mh."deletedAt" isnull and mt."deletedAt" isnull ${isi}`, s)

            res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].total, jumlah, halaman })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listformulaHargaByMsTarifMsHargaId(req, res) {
        const { ms_tarif_id, ms_harga_id } = req.body;

        try {
            let data = await sq.query(`select fh.id as "formula_harga_id", * 
            from formula_harga fh 
            join ms_harga mh on mh.id = fh.ms_harga_id 
            join ms_tarif mt on mt.id = fh.ms_tarif_id 
            where fh."deletedAt" isnull and mh."deletedAt" isnull and mt."deletedAt" isnull 
            and fh.ms_tarif_id = '${ms_tarif_id}' and fh.ms_harga_id = '${ms_harga_id}' 
            order by fh."createdAt" desc`, s)

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async detailsById(req, res) {
        const { id } = req.params
        try {
            let data = await sq.query(`select fh.id as "formula_harga_id", * 
            from formula_harga fh 
            join ms_harga mh on mh.id = fh.ms_harga_id 
            join ms_tarif mt on mt.id = fh.ms_tarif_id 
            where fh."deletedAt" isnull and mh."deletedAt" isnull and mt."deletedAt" isnull and fh.id = '${id}'`, s)
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static delete(req, res) {
        const { id } = req.body
        formulaHarga.destroy({ where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async listFormulaHargaByMsHargaId(req, res) {
        const { ms_harga_id } = req.body;
        try {
            let data = await sq.query(`select fh.id as "formula_harga_id", * 
            from formula_harga fh 
            join ms_harga mh on mh.id = fh.ms_harga_id 
            join ms_tarif mt on mt.id = fh.ms_tarif_id 
            where fh."deletedAt" isnull and mh."deletedAt" isnull and mt."deletedAt" isnull and fh.ms_harga_id = '${ms_harga_id}' 
            order by fh."createdAt" desc `, s);

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listFormulaHargaByMsTarifId(req, res) {
        const { ms_tarif_id } = req.body
        try {
            let data = await sq.query(`select fh.id as "formula_harga_id", * 
            from formula_harga fh 
            join ms_harga mh on mh.id = fh.ms_harga_id 
            join ms_tarif mt on mt.id = fh.ms_tarif_id 
            where fh."deletedAt" isnull and mh."deletedAt" isnull and mt."deletedAt" isnull and fh.ms_tarif_id = '${ms_tarif_id}' 
            order by fh."createdAt" desc`, s)

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }
}

module.exports = Controller