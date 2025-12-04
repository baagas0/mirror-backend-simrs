const permintaanSteril = require('./model');
const permintaanSterilList = require('../permintaan_steril_list/model');
const msBarang = require('../ms_barang/model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT }


class Controller {

    static async register(req, res) {
        const { kode_permintaan, nama_unit, tanggal_permintaan, status_permintaan, keterangan, barang_list } = req.body
        
        const t = await sq.transaction();
        
        try {
            // Create main sterilization request record
            const permintaanId = uuid_v4();
            const mainRecord = await permintaanSteril.create({ 
                id: permintaanId, 
                kode_permintaan, 
                nama_unit, 
                tanggal_permintaan, 
                status_permintaan: status_permintaan || 1, // Default status: menunggu
                keterangan,
            }, { transaction: t });
            
            // Create list items if provided
            if (barang_list && Array.isArray(barang_list) && barang_list.length > 0) {
                const listItems = barang_list.map(item => ({
                    id: uuid_v4(),
                    permintaan_steril_id: permintaanId,
                    ms_barang_id: item.ms_barang_id,
                    jumlah_barang: item.jumlah_barang || 1,
                    status_permintaan: 1,
                }));
                
                await permintaanSterilList.bulkCreate(listItems, { transaction: t });
            }
            
            await t.commit();
            res.status(200).json({ 
                status: 200, 
                message: "sukses", 
                data: mainRecord 
            });
        } catch (error) {
            await t.rollback();
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error });
        }
    }

    static async update(req, res) {
        const { id, kode_permintaan, nama_unit, tanggal_permintaan, status_permintaan, keterangan, barang_list } = req.body
        
        const t = await sq.transaction();
        
        try {
            // Update main record
            await permintaanSteril.update({ 
                kode_permintaan, 
                nama_unit, 
                tanggal_permintaan, 
                status_permintaan, 
                keterangan,
            }, { 
                where: { id },
                transaction: t 
            });
            
            // Update list items if provided
            if (barang_list && Array.isArray(barang_list)) {
                // Delete existing list items
                await permintaanSterilList.destroy({
                    where: { permintaan_steril_id: id },
                    transaction: t
                });
                
                if (barang_list.length > 0) {
                    // Create new list items
                    const listItems = barang_list.map(item => ({
                        id: uuid_v4(),
                        permintaan_steril_id: id,
                        ms_barang_id: item.ms_barang_id,
                        jumlah_barang: item.jumlah_barang || 1
                    }));
                    
                    await permintaanSterilList.bulkCreate(listItems, { transaction: t });
                }
            }
            
            await t.commit();
            res.status(200).json({ status: 200, message: "sukses" });
        } catch (error) {
            await t.rollback();
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error });
        }
    }

    static async list(req, res) {
        const { halaman, jumlah, kode_permintaan, nama_unit, status_permintaan } = req.body
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
            
            if(status_permintaan !== undefined){
                isi += ` and ps.status_permintaan = ${status_permintaan}`
            }
            
            // Get main records with count of items
            let data = await sq.query(`
                select 
                    ps.id as permintaan_steril_id, 
                    ps.kode_permintaan,
                    ps.nama_unit,
                    ps.tanggal_permintaan,
                    ps.status_permintaan,
                    ps.keterangan,
                    ps."createdAt",
                    ps."updatedAt",
                    (select count(*) from permintaan_steril_list psl where psl.permintaan_steril_id = ps.id and psl."deletedAt" is null) as jumlah_item,
                    (select count(*) from permintaan_steril_list psl where psl.permintaan_steril_id = ps.id and psl."deletedAt" is null and psl.status_permintaan = 9) as jumlah_item_selesai
                from permintaan_steril ps 
                where ps."deletedAt" isnull${isi} 
                order by ps."createdAt" desc ${pagination}`, s)
                
            let jml = await sq.query(`
                select count(*)
                from permintaan_steril ps
                where ps."deletedAt" isnull${isi}`, s)

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
            // Get main record details
            let mainData = await sq.query(`
                select 
                    ps.id as permintaan_steril_id, 
                    ps.kode_permintaan,
                    ps.nama_unit,
                    ps.tanggal_permintaan,
                    ps.status_permintaan,
                    ps.keterangan,
                    ps."createdAt",
                    ps."updatedAt",
                    (select count(*) from permintaan_steril_list psl where psl.permintaan_steril_id = ps.id and psl."deletedAt" is null) as jumlah_item
                from permintaan_steril ps
                where ps."deletedAt" isnull and ps.id = '${id}'`, s);
                
            // Get list items with barang details
            let listItems = await sq.query(`
                select 
                    psl.id as permintaan_steril_list_id,
                    psl.ms_barang_id,
                    mb.nama_barang,
                    mb.kode_produk
                from permintaan_steril_list psl
                left join ms_barang mb on psl.ms_barang_id = mb.id
                where psl."deletedAt" isnull and psl.permintaan_steril_id = '${id}'
                order by psl."createdAt"`, s);
                
            // Combine results
            const data = {
                ...mainData[0],
                barang_list: listItems
            };
                
            res.status(200).json({ status: 200, message: "sukses", data: [data] })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async delete(req, res) {
        const { id } = req.body
        const t = await sq.transaction();
        
        try {
            // Delete list items first
            await permintaanSterilList.destroy({ 
                where: { permintaan_steril_id: id },
                transaction: t
            });
            
            // Delete main record
            await permintaanSteril.destroy({ 
                where: { id },
                transaction: t
            });
            
            await t.commit();
            res.status(200).json({ status: 200, message: "sukses" });
        } catch (error) {
            await t.rollback();
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error });
        }
    }

}

module.exports = Controller