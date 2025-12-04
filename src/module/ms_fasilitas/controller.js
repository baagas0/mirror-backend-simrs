const msFasilitas = require('./model');
const msHargaFasilitas = require('../ms_harga_fasilitas/model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT }

class Controller {

    static async register(req, res) {
        const { nama_fasilitas, ms_jenis_fasilitas_id, bulk_tarif } = req.body

        const t = await sq.transaction();

        try {
            let cek_fasilitas = await msFasilitas.findAll({ where: { nama_fasilitas: { [Op.iLike]: nama_fasilitas } } })
            if (cek_fasilitas.length > 0) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                let harga = await sq.query(`select * from ms_harga mh where mh."deletedAt" isnull `, s)
                let data_fasilitas = await msFasilitas.create({ id: uuid_v4(), nama_fasilitas, ms_jenis_fasilitas_id }, { transaction: t })

                let bulk_fasilitas = []
                for (let i = 0; i < bulk_tarif.length; i++) {
                    for (let j = 0; j < harga.length; j++) {
                        let obj = {
                            id: uuid_v4(),
                            ms_fasilitas_id: data_fasilitas.dataValues.id,
                            ms_tarif_id: bulk_tarif[i].ms_tarif_id,
                            ms_harga_id: harga[j].id,
                            harga_jual: bulk_tarif[i].harga_jual,
                            harga_beli: bulk_tarif[i].harga_beli
                        }
                        bulk_fasilitas.push(obj)
                    }
                }

                await msHargaFasilitas.bulkCreate(bulk_fasilitas, { transaction: t })
                await t.commit();

                res.status(200).json({ status: 200, message: "sukses", data: data_fasilitas })
            }

        } catch (error) {
            await t.rollback();
            console.log(error);
            console.log(req.body);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async update(req, res) {
        const { id, nama_fasilitas, ms_jenis_fasilitas_id } = req.body

        try {
            await msFasilitas.update({ nama_fasilitas, ms_jenis_fasilitas_id }, { where: { id } })

            res.status(200).json({ status: 200, message: "sukses" })
        } catch (error) {
            console.log(error);
            console.log(req.body);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async updateBulk(req, res) {
        const { id, nama_fasilitas, ms_jenis_fasilitas_id, bulk_ms_harga_fasilitas } = req.body

        const t = await sq.transaction();

        try {
            await msFasilitas.update({ nama_fasilitas, ms_jenis_fasilitas_id }, { where: { id }, transaction: t })
            await msHargaFasilitas.bulkCreate(bulk_ms_harga_fasilitas, { updateOnDuplicate: ["harga_jual", "harga_beli"], transaction: t })

            await t.commit();
            res.status(200).json({ status: 200, message: "sukses" })
        } catch (error) {
            await t.rollback();
            console.log(error);
            console.log(req.body);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async list(req, res) { 
        try {
            let data = await sq.query(`select mf.id as "ms_fasilitas_id", * from ms_fasilitas mf join ms_jenis_fasilitas mjf on mjf.id = mf.ms_jenis_fasilitas_id where mf."deletedAt" isnull order by mf."createdAt" desc`, s)
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async detailsById(req, res) {
        const { id } = req.body
        try {
            let data = await sq.query(`select mf.id as "ms_fasilitas_id", * from ms_fasilitas mf join ms_jenis_fasilitas mjf on mjf.id = mf.ms_jenis_fasilitas_id where mf."deletedAt" isnull and mjf."deletedAt" isnull and mf.id = '${id}'`, s)
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listFasilitasByMsJenisFasilitasId(req, res) {
        const { ms_jenis_fasilitas_id } = req.body
        try {
            let data = await sq.query(`select mf.id as "ms_fasilitas_id", * from ms_fasilitas mf join ms_jenis_fasilitas mjf on mjf.id = mf.ms_jenis_fasilitas_id where mf."deletedAt" isnull and mjf."deletedAt" isnull and mf.ms_jenis_fasilitas_id = '${ms_jenis_fasilitas_id}'`, s)
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async delete(req, res) {
        const { id } = req.body

        const t = await sq.transaction();
        try {
            await msFasilitas.destroy({ where: { id }, transaction: t })
            await msHargaFasilitas.destroy({ where: { ms_fasilitas_id: id }, transaction: t })
            await t.commit()

            res.status(200).json({ status: 200, message: "sukses" })
        } catch (error) {
            await t.rollback();
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }
}

module.exports = Controller