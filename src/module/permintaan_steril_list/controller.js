const permintaanSterilList = require('./model');
const permintaanSteril = require('../permintaan_steril/model');
const msBarang = require('../ms_barang/model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT }


class Controller {

    static register(req, res) {
        const { permintaan_steril_id, ms_barang_id, status_permintaan } = req.body
        
        if (!permintaan_steril_id || !ms_barang_id) {
            return res.status(400).json({ 
                status: 400, 
                message: "permintaan_steril_id dan ms_barang_id harus diisi" 
            });
        }
        
        permintaanSterilList.create({ 
            id: uuid_v4(), 
            permintaan_steril_id,
            ms_barang_id,
            status_permintaan: status_permintaan || 1, // Default status: menunggu
        })
        .then(hasil => {
            res.status(200).json({ status: 200, message: "sukses", data: hasil })
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static update(req, res) {
        const { id, permintaan_steril_id, ms_barang_id, status_permintaan } = req.body
        
        if (!id) {
            return res.status(400).json({ 
                status: 400, 
                message: "id harus diisi" 
            });
        }
        
        // Prepare update object with only provided values
        const updateData = {};
        if (permintaan_steril_id) updateData.permintaan_steril_id = permintaan_steril_id;
        if (ms_barang_id) updateData.ms_barang_id = ms_barang_id;
        if (status_permintaan !== undefined) updateData.status_permintaan = status_permintaan;
        
        permintaanSterilList.update(updateData, { where: { id } })
        .then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async list(req, res) {
        const { halaman, jumlah, kode_permintaan, nama_unit, status_permintaan, permintaan_steril_id } = req.body
        try {
            let isi = ''
            let offset = ''
            let pagination = ''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination = `limit ${jumlah} offset ${offset}`
            }

            if(kode_permintaan){
                isi += ` and ps.kode_permintaan ilike '%${kode_permintaan}%'`
            }

            if(nama_unit){
                isi += ` and ps.nama_unit ilike '%${nama_unit}%'`
            }
            if (permintaan_steril_id) {
                isi += ` and psl.permintaan_steril_id = '${permintaan_steril_id}'`
            }

            let data = await sq.query(`
                select psl.id as permintaan_steril_list_id, psl.*, mb.*
                from permintaan_steril_list psl
                join ms_barang mb on mb.id = psl.ms_barang_id
                join permintaan_steril ps on ps.id = psl.permintaan_steril_id
                where psl."deletedAt" isnull${isi}
                order by psl."createdAt" desc ${pagination}`, s)

            let jml = await sq.query(`
                select count(*)
                from permintaan_steril_list psl
                join permintaan_steril ps on ps.id = psl.permintaan_steril_id
                where psl."deletedAt" isnull${isi}`, s)

            res.status(200).json({ 
                status: 200, 
                message: "sukses",
                data,
                count: jml[0].count, 
                jumlah, 
                halaman 
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async detailsById(req, res) {
        const { id } = req.body
        try {
            let data = await sq.query(`
                SELECT 
                    psl.id,
                    psl.permintaan_steril_id,
                    psl.status_permintaan,
                    psl."createdAt",
                    psl."updatedAt",
                    mb.*
                FROM permintaan_steril_list psl
                JOIN ms_barang mb ON mb.id = psl.ms_barang_id
                WHERE psl."deletedAt" IS NULL AND psl.id = '${id}'`, s)

            if (data && data.length > 0) {
                res.status(200).json({ status: 200, message: "sukses", data: data[0] })
            } else {
                res.status(404).json({ status: 404, message: "Data tidak ditemukan" })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static delete(req, res) {
        const { id } = req.body
        permintaanSterilList.destroy({ where: { id } })
        .then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    /**
     * Update status_permintaan for a sterilization request item
     * Status codes:
     * 0 = ditolak
     * 1 = menunggu
     * 2 = diproses
     * 9 = selesai
     */
    static async updateStatus(req, res) {
        const { id, status_permintaan } = req.body
        
        // Validate status code
        if (![0, 1, 2, 9].includes(parseInt(status_permintaan))) {
            return res.status(400).json({ 
                status: 400, 
                message: "Status tidak valid. Gunakan: 0 (ditolak), 1 (menunggu), 2 (diproses), atau 9 (selesai)" 
            });
        }
        
        try {
            // Update the item status
            await permintaanSterilList.update(
                { status_permintaan }, 
                { where: { id } }
            );
            
            // Get the updated item with barang details
            let updatedItem = await sq.query(`
                SELECT 
                    psl.id, 
                    psl.permintaan_steril_id, 
                    psl.status_permintaan,
                    mb.nama_barang,
                    mb.kode_produk
                FROM 
                    permintaan_steril_list psl
                JOIN 
                    ms_barang mb ON mb.id = psl.ms_barang_id
                WHERE 
                    psl.id = '${id}' AND
                    psl."deletedAt" IS NULL
            `, s);
            
            // If no item found after update, it means it was deleted or does not exist
            if (!updatedItem || updatedItem.length === 0) {
                return res.status(404).json({ 
                    status: 404, 
                    message: "Data tidak ditemukan setelah update" 
                });
            }
            
            // Return success with updated item data
            res.status(200).json({ 
                status: 200, 
                message: "Status berhasil diperbarui", 
                data: updatedItem[0] 
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ 
                status: 500, 
                message: "Gagal memperbarui status", 
                data: error 
            });
        }
    }

}

module.exports = Controller