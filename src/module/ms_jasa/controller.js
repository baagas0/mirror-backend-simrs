const msJasa = require('./model');
const msHargaJasa = require('../ms_harga_jasa/model');
const jasaDokter = require('../jasa_dokter/model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op, where } = require('sequelize');
const s = { type: QueryTypes.SELECT }

class Controller {
    static async register(req, res) {
        const { nama_jasa, ms_jenis_jasa_id, bulk_tarif } = req.body

        const t = await sq.transaction();
        try {
            let cekJasa = await msJasa.findAll({ where: { nama_jasa: { [Op.iLike]: nama_jasa } } })
            if(cekJasa.length>0){
                res.status(201).json({ status: 204, message: "data sudah ada" });
            }else{
                let idJasa = uuid_v4();
                let msHarga = await sq.query(`select * from ms_harga mh where mh."deletedAt" isnull`,s);
                let hasil = [];

                for (let i = 0; i < bulk_tarif.length; i++) {
                   for (let j = 0; j < msHarga.length; j++) {
                    hasil.push({id:uuid_v4(),harga_beli:bulk_tarif[i].harga_beli,harga_jual:bulk_tarif[i].harga_jual,ms_jasa_id:idJasa,ms_tarif_id:bulk_tarif[i].ms_tarif_id,ms_harga_id:msHarga[j].id})
                   }
                }
                let data = await msJasa.create({id:idJasa,ms_jenis_jasa_id,nama_jasa},{transaction:t})
                await msHargaJasa.bulkCreate(hasil,{transaction:t});
                await t.commit();
                res.status(200).json({ status: 200, message: "sukses",data:data });
            }
        } catch (error) {
            await t.rollback()
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static update(req, res) {
        const { id, nama_jasa, ms_jenis_jasa_id } = req.body

        msJasa.update({ nama_jasa, ms_jenis_jasa_id }, { where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async updateBulk(req, res) {
        const { id, nama_jasa, ms_jenis_jasa_id, bulk_ms_harga_jasa } = req.body

        const t = await sq.transaction();
        try {
            await msJasa.update({nama_jasa, ms_jenis_jasa_id},{where:{id},transaction:t})
            await msHargaJasa.bulkCreate(bulk_ms_harga_jasa,{updateOnDuplicate:['harga_beli','harga_jual'],transaction:t})

            await t.commit();
            res.status(200).json({ status: 200, message: "sukses" })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async list(req, res) {
        const{nama_jasa,nama_jenis_jasa,ms_jenis_jasa_id,ms_harga_id,search} = req.body
        try {
            let isi = ''
            if(nama_jasa){
                isi+=` and mj.nama_jasa ilike '%${nama_jasa}%'`
            }
            if(nama_jenis_jasa){
                isi+=` and mjj.nama_jenis_jasa ilike '%${nama_jenis_jasa}%'`
            }
            if(ms_jenis_jasa_id){
                isi+=` and mj.ms_jenis_jasa_id='${ms_jenis_jasa_id}'`
            }
            if(search) {
                isi += ` and mjj.nama_jenis_jasa ilike '%${search}%' or mj.nama_jasa ilike '%${search}%' `
            }

            let msJasa = await sq.query(`select mj.id as ms_jasa_id,mj.*,mjj.nama_jenis_jasa from ms_jasa mj join ms_jenis_jasa mjj on mjj.id = mj.ms_jenis_jasa_id where mj."deletedAt" isnull ${isi} order by mj."createdAt" desc`, s);
           
            res.status(200).json({ status: 200, message: "sukses", data: msJasa })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listPerhalaman(req, res) {
        const{halaman,jumlah,nama_jasa,nama_jenis_jasa,ms_jenis_jasa_id,search} = req.body
        try {
            let isi = ''
            let offset = +halaman * jumlah;
            
            if(nama_jasa){
                isi+=` and mj.nama_jasa ilike '%${nama_jasa}%'`
            }
            if(nama_jenis_jasa){
                isi+=` and mjj.nama_jenis_jasa ilike '%${nama_jenis_jasa}%'`
            }
            if(ms_jenis_jasa_id){
                isi+=` and mj.ms_jenis_jasa_id='${ms_jenis_jasa_id}'`
            }
            if(search) {
                isi += ` and mjj.nama_jenis_jasa ilike '%${search}%' or mj.nama_jasa ilike '%${search}%' `
            }

            let msJasa = await sq.query(`select mj.id as ms_jasa_id,mj.*,mjj.nama_jenis_jasa from ms_jasa mj join ms_jenis_jasa mjj on mjj.id = mj.ms_jenis_jasa_id where mj."deletedAt" isnull ${isi} order by mj."createdAt" desc limit ${jumlah} offset ${offset}`, s);
            let jml = await sq.query(`select count(*)as total from ms_jasa mj join ms_jenis_jasa mjj on mjj.id = mj.ms_jenis_jasa_id where mj."deletedAt" isnull ${isi}`, s);
            
            res.status(200).json({ status: 200, message: "sukses", data:msJasa, count: jml[0].total, jumlah, halaman });
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async detailsById(req, res) {
        const { id } = req.body
        try {
            let msJasa = await sq.query(`select mj.id as ms_jasa_id,mj.*,mjj.nama_jenis_jasa from ms_jasa mj join ms_jenis_jasa mjj on mjj.id = mj.ms_jenis_jasa_id where mj."deletedAt" isnull and mj.id = '${id}' order by mj."createdAt" desc`, s);

            res.status(200).json({ status: 200, message: "sukses", data: msJasa })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listMsJasaByJenisJasaId(req, res) {
        const { ms_jenis_jasa_id } = req.body
        try {
            let msJasa = await sq.query(`select mj.id as ms_jasa_id,mj.*,mjj.nama_jenis_jasa from ms_jasa mj join ms_jenis_jasa mjj on mjj.id = mj.ms_jenis_jasa_id where mj."deletedAt" isnull and mj.ms_jenis_jasa_id='${ms_jenis_jasa_id}' order by mj."createdAt" desc`, s);

            res.status(200).json({ status: 200, message: "sukses", data: msJasa })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async delete(req, res) {
        const { id } = req.body
        
        const t = await sq.transaction();
        try {
            await msJasa.destroy({ where: { id },transaction:t })
            await msHargaJasa.destroy({where:{ms_jasa_id:id},transaction:t })
            await jasaDokter.destroy({where:{ms_jasa_id:id},transaction:t})
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