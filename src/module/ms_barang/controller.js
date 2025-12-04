const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const msBarang = require("./model");
const subPembelian = require("../sub_pembelian/model");
const pembelian = require("../pembelian/model");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };


class Controller {

    static register(req, res) { // Register Obat
        const { type, nama_barang, kode_produk, qjb, komposisi, harga_pokok, ms_satuan_barang_id, ms_kelas_terapi_id, ms_golongan_barang_id, ms_produsen_id, ms_jenis_obat_id, ms_satuan_jual_id,tarif_cbg_id, harga_tertinggi, harga_beli_terahir } = req.body

        msBarang.findAll({ where: { kode_produk: { [Op.iLike]: kode_produk } } }).then(data => {
            if (data.length > 0) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                msBarang.create({ id: uuid_v4(), nama_barang, kode_produk, qjb, komposisi, harga_pokok, ms_satuan_barang_id, ms_kelas_terapi_id, ms_golongan_barang_id, ms_produsen_id, ms_jenis_obat_id, ms_satuan_jual_id,tarif_cbg_id, harga_tertinggi, harga_beli_terahir }).then(data => {
                    res.status(200).json({ status: 200, message: "sukses", data });
                }).catch(err => {
                    res.status(500).json({ status: 500, message: "gagal", data: err });
                })
            }
        }).catch(err => {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static registerAlatMedis(req, res) { // Register Alat Medis
        const { nama_barang, kode_produk, qjb, komposisi, harga_pokok, ms_satuan_barang_id, ms_produsen_id, ms_satuan_jual_id, harga_tertinggi, harga_beli_terahir } = req.body

        msBarang.findAll({ where: { kode_produk: { [Op.iLike]: kode_produk } } }).then(data => {
            if (data.length > 0) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                msBarang.create({ id: uuid_v4(), type: 'Alat Medis', nama_barang, kode_produk, qjb, komposisi, harga_pokok, ms_satuan_barang_id, ms_produsen_id, ms_satuan_jual_id, harga_tertinggi, harga_beli_terahir }).then(data => {
                    res.status(200).json({ status: 200, message: "sukses", data });
                }).catch(err => {
                    res.status(500).json({ status: 500, message: "gagal", data: err });
                })
            }
        }).catch(err => {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async update(req, res) {
        const { type, id, nama_barang, kode_produk, qjb, komposisi, harga_pokok, ms_satuan_barang_id, ms_kelas_terapi_id, ms_golongan_barang_id, ms_produsen_id, ms_jenis_obat_id, ms_satuan_jual_id,tarif_cbg_id } = req.body
        const barang= await msBarang.findAll({where:{id}});
        if(barang[0].harga_pokok!=harga_pokok){
            const checkSudahDibeli = await subPembelian.findAll({where:{ms_barang_id:id,'$pembelian.ubah_harga_pokok$':true},include:[pembelian]})
            // console.log(checkSudahDibeli);
            if(checkSudahDibeli.length>0){
               return res.status(201).json({ status: 204, message: "Tidak bisa ganti harga pokok" });
            }
        }

        msBarang.findAll({ where: { [Op.and]:{ kode_produk: { [Op.iLike]: kode_produk },id:{[Op.not]:id} }}}).then(data => {
            if (data.length > 0) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                msBarang.update({ nama_barang, kode_produk, qjb, komposisi, harga_pokok, ms_satuan_barang_id, ms_kelas_terapi_id, ms_golongan_barang_id, ms_produsen_id, ms_jenis_obat_id, ms_satuan_jual_id,tarif_cbg_id }, { where: { id } }).then(dataa => {
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

        msBarang.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        const{type, halaman,jumlah,nama_barang,kode_produk,komposisi,ms_satuan_barang_id,ms_kelas_terapi_id,ms_golongan_barang_id,ms_produsen_id,ms_jenis_obat_id,ms_satuan_jual_id,tarif_cbg_id,search} = req.body

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }
            
            if(nama_barang){
                isi+= ` and mb.nama_barang ilike '%${nama_barang}%'`
            }
            if(kode_produk){
                isi+= ` and mb.kode_produk ilike '%${kode_produk}%'`
            }
            if(komposisi){
                isi+= ` and mb.komposisi ilike '%${kode_produk}%'`
            }
            if(ms_satuan_barang_id){
                isi+= ` and mb.ms_satuan_barang_id = '${ms_satuan_barang_id}'`
            }
            if(ms_kelas_terapi_id){
                isi+= ` and mb.ms_kelas_terapi_id = '${ms_kelas_terapi_id}'`
            }
            if(ms_golongan_barang_id){
                isi+= ` and mb.ms_golongan_barang_id = '${ms_golongan_barang_id}'`
            }
            if(ms_produsen_id){
                isi+= ` and mb.ms_produsen_id = '${ms_produsen_id}'`
            }
            if(ms_jenis_obat_id){
                isi+= ` and mb.ms_jenis_obat_id = '${ms_jenis_obat_id}'`
            }
            if(ms_satuan_jual_id){
                isi+= ` and mb.ms_satuan_jual_id = '${ms_satuan_jual_id}'`
            }
            if(tarif_cbg_id){
                isi+= ` and mb.tarif_cbg_id = '${tarif_cbg_id}'`
            }
            if(search) {
                isi += ` and mb.nama_barang ilike '%${search}%' or mb.kode_produk ilike '%${search}%' `
            }
            if(type) {
                isi += ` and mb.type = '${type}' `
            }

            let data = await sq.query(`select mb.id as ms_barang_id,mb.*,msb.nama_satuan,mkt.nama_kelas_terapi,mkt.is_narkotik,mp.nama_produsen,mjo.nama_jenis_obat,msb2.nama_satuan as nama_satuan_jual,
            (select coalesce (sum(s.qty),0) as qty_per_rs from stock s where s."deletedAt" isnull and s.ms_barang_id = mb.id),
            (coalesce((select coalesce (sum(s.qty),0) as qty_per_rs from stock s where s."deletedAt" isnull and s.ms_barang_id = mb.id)*mb.harga_pokok,0))as persediaan_medis,tc.* 
            from ms_barang mb 
            join ms_satuan_barang msb on msb.id = mb.ms_satuan_barang_id 
            left join ms_kelas_terapi mkt on mkt.id = mb.ms_kelas_terapi_id 
            join ms_produsen mp on mp.id = mb.ms_produsen_id 
            left join ms_jenis_obat mjo on mjo.id = mb.ms_jenis_obat_id 
            join ms_satuan_barang msb2 on msb2.id = mb.ms_satuan_jual_id 
            left join tarif_cbg tc on tc.id = mb.tarif_cbg_id
            where mb."deletedAt" isnull ${isi} order by mb."createdAt" desc ${pagination}`,s);

            let jml = await sq.query(`select count(*) from ms_barang mb 
            join ms_satuan_barang msb on msb.id = mb.ms_satuan_barang_id 
            left join ms_kelas_terapi mkt on mkt.id = mb.ms_kelas_terapi_id 
            join ms_produsen mp on mp.id = mb.ms_produsen_id 
            join ms_jenis_obat mjo on mjo.id = mb.ms_jenis_obat_id 
            join ms_satuan_barang msb2 on msb2.id = mb.ms_satuan_jual_id 
            where mb."deletedAt" isnull${isi}`,s)

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
       } catch (err) {
        console.log(err);
        res.status(500).json({ status: 500, message: "gagal", data: err });
       }
    }

    static async detailsById(req, res) {
        const { id } = req.body

        try {
            let data = await sq.query(`select mb.id as ms_barang_id,mb.*,msb.nama_satuan,mkt.nama_kelas_terapi,mkt.is_narkotik,mp.nama_produsen,mjo.nama_jenis_obat,msb2.nama_satuan as nama_satuan_jual,
            (select coalesce (sum(s.qty),0) as qty_per_rs from stock s where s."deletedAt" isnull and s.ms_barang_id = mb.id),
            (coalesce((select coalesce (sum(s.qty),0) as qty_per_rs from stock s where s."deletedAt" isnull and s.ms_barang_id = mb.id)*mb.harga_pokok,0))as persediaan_medis,tc.*
            from ms_barang mb 
            join ms_satuan_barang msb on msb.id = mb.ms_satuan_barang_id 
            left join ms_kelas_terapi mkt on mkt.id = mb.ms_kelas_terapi_id 
            join ms_produsen mp on mp.id = mb.ms_produsen_id 
            left join ms_jenis_obat mjo on mjo.id = mb.ms_jenis_obat_id 
            join ms_satuan_barang msb2 on msb2.id = mb.ms_satuan_jual_id 
            left join tarif_cbg tc on tc.id = mb.tarif_cbg_id
            where mb."deletedAt" isnull and mb.id = '${id}'`,s);
    
            res.status(200).json({ status: 200, message: "sukses", data });
           } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
           }
    }
}
module.exports = Controller;