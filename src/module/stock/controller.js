const stock = require('./model')
const historyInventory = require('../history_inventory/model')
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };
const ExcelJS = require("exceljs");
const moment = require('moment');

class Controller {
    static async register(req, res) {
        const { tgl_masuk, pembelian_id } = req.body;

        const t = await sq.transaction()
        try {
            let cek_barang = await sq.query(`select p.id as "pembelian_id", p.ms_gudang_id ,sp.kode_batch ,sp.qty_beli as qty ,sp.tgl_kadaluarsa ,sp.ms_barang_id ,mb.harga_pokok ,mb.harga_tertinggi ,mb.harga_beli_terahir 
            from pembelian p join sub_pembelian sp on sp.ms_pembelian_id = p.id 
            join ms_barang mb on mb.id = sp.ms_barang_id 
            where p."deletedAt" isnull and sp."deletedAt" isnull and p.id = '${pembelian_id}'`, s)

            for (let i = 0; i < cek_barang.length; i++) {
                cek_barang[i].id = uuid_v4()
                cek_barang[i].tgl_masuk = tgl_masuk
            }

            let item_history = []
            for (let j = 0; j < cek_barang.length; j++) {
                let obj = {
                    id: uuid_v4(),
                    tipe_transaksi: 'pembelian',
                    debit_kredit: 'debit',
                    stok_awal: cek_barang[j].qty,
                    stok_akhir: cek_barang[j].qty,
                    qty: cek_barang[j].qty,
                    harga_pokok_awal: cek_barang[j].harga_pokok,
                    harga_pokok_akhir: cek_barang[j].harga_beli_terakhir,
                    tgl_transaksi: cek_barang[j].tgl_masuk,
                    ms_gudang_id: cek_barang[j].ms_gudang_id,
                    stock_id: cek_barang[j].id,
                    ms_barang_id: cek_barang[j].ms_barang_id
                }
                item_history.push(obj)
            }

            let data_stock = await stock.bulkCreate(cek_barang, { transaction: t })
            let data_history = await historyInventory.bulkCreate(item_history, { transaction: t })

            await t.commit()
            res.status(200).json({ status: 200, message: "sukses", data: data_stock })
        } catch (err) {
            await t.rollback()
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static update(req, res) {
        const { id, kode_batch, qty, tgl_masuk, tgl_kadaluarsa } = req.body;

        stock.update({ kode_batch, qty, tgl_masuk, tgl_kadaluarsa }, { where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static delete(req, res) {
        const { id } = req.body;

        stock.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        const {ms_barang_id,ms_gudang_id,nama_barang,nama_gudang} = req.body;
        let param='';
        if(ms_barang_id){
            param+=` and s.ms_barang_id = '${ms_barang_id}'`
        }
        if(ms_gudang_id){
            param+=` and s.ms_gudang_id = '${ms_gudang_id}'`
        }
        if(nama_barang){
            param+=` and mb.nama_barang ilike '%${nama_barang}%'`
        }
        if(nama_gudang){
            param+=` and mg.nama_gudang ilike '%${nama_gudang}%'`
        }
        try {
            let data = await sq.query(`select s.ms_barang_id , mb.nama_barang ,s.ms_gudang_id , mg.nama_gudang ,sum(s.qty) as "jumlah_barang"
            from stock s 
            join ms_barang mb on mb.id = s.ms_barang_id 
            join ms_gudang mg on mg.id = s.ms_gudang_id 
            where mb."deletedAt" isnull and mg."deletedAt" isnull${param} 
            group by s.ms_barang_id , s.ms_gudang_id , mb.nama_barang ,mg.nama_gudang`, s)

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async detailStockBarangByGudang(req, res) {
        const { ms_barang_id, ms_gudang_id } = req.body

        try {
            let data = await sq.query(`select s.id as "stock_id", * 
            from stock s 
            join ms_barang mb on mb.id = s.ms_barang_id 
            join ms_gudang mg on mg.id = s.ms_gudang_id 
            where mb."deletedAt" isnull and mg."deletedAt" isnull 
            and s.ms_barang_id = '${ms_barang_id}' and s.ms_gudang_id = '${ms_gudang_id}'`, s)

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async listStockByGudangId(req, res) {
        const { ms_gudang_id } = req.body

        try {
            let data = await sq.query(`select s.id as "stock_id", * from stock s 
            join ms_barang mb on mb.id = s.ms_barang_id 
            join ms_gudang mg on mg.id = s.ms_gudang_id 
            where s."deletedAt" isnull and mb."deletedAt" isnull and mg."deletedAt" isnull and s.ms_gudang_id = '${ms_gudang_id}' 
            order by s."createdAt" desc`, s)

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    } 
    
    static async listStockBarangJualPerHalaman(req, res) {
        const { halaman,jumlah,ms_gudang_id,nama_barang,kode_produk,ms_jenis_obat_id,ms_tarif_id,ms_harga_id, search } = req.body

        try {
            let offset = (+halaman-1) * jumlah
            let isi = ''
            if(nama_barang){
                isi+= ` and mb.nama_barang ilike '%${nama_barang}%'`
            }
            if(kode_produk){
                isi+= ` and mb.kode_produk ilike '%${kode_produk}%'`
            }
            if(ms_jenis_obat_id){
                isi+= ` and mb.ms_jenis_obat_id = '${kode_produk}'`
            }
            if(search) {
                isi += ` and ( mb.nama_barang ilike '%${search}%' or mb.kode_produk ilike '%${search}%' ) `
            }

            let data = await sq.query(`select s.ms_barang_id,mb.nama_barang,mb.kode_produk,sum(s.qty)as qty,mb.qjb,mb.harga_pokok,mb.harga_tertinggi,mb.harga_beli_terahir,
            mb.ms_jenis_obat_id,mjo.nama_jenis_obat,mb.komposisi, mb.ms_satuan_jual_id,msb.nama_satuan,
            s.ms_gudang_id,mg.nama_gudang,mg.tipe_gudang,(mb.harga_pokok * (select fh.persentase from formula_harga fh where fh."deletedAt" isnull 
            and fh.ms_tarif_id = '${ms_tarif_id}' and fh.ms_harga_id = '${ms_harga_id}')) as harga_barang
            from stock s 
            join ms_barang mb on mb.id = s.ms_barang_id 
            join ms_jenis_obat mjo on mjo.id = mb.ms_jenis_obat_id
            join ms_gudang mg on mg.id = s.ms_gudang_id 
            join ms_satuan_barang msb on msb.id = mb.ms_satuan_barang_id
            where s."deletedAt" isnull and mb."deletedAt" isnull and mg."deletedAt" isnull            
            and s.ms_gudang_id = '${ms_gudang_id}' ${isi}
            group by s.ms_barang_id,mb.nama_barang,mb.kode_produk,mb.qjb,
            mb.harga_pokok,mb.harga_tertinggi,mb.harga_beli_terahir,
            mb.ms_jenis_obat_id,mjo.nama_jenis_obat,mb.komposisi, mb.ms_satuan_jual_id,msb.nama_satuan,
            s.ms_gudang_id,mg.nama_gudang,mg.tipe_gudang order by mb.nama_barang limit ${jumlah} offset ${offset}`, s)
            let jml = await sq.query(`select count(*) as total
            from stock s 
            join ms_barang mb on mb.id = s.ms_barang_id 
            join ms_jenis_obat mjo on mjo.id = mb.ms_jenis_obat_id
            join ms_gudang mg on mg.id = s.ms_gudang_id 
            join ms_satuan_barang msb on msb.id = mb.ms_satuan_barang_id
            where s."deletedAt" isnull and mb."deletedAt" isnull and mg."deletedAt" isnull            
            and s.ms_gudang_id = '${ms_gudang_id}' ${isi}
            group by s.ms_barang_id,mb.nama_barang,mb.kode_produk,mb.qjb,
            mb.harga_pokok,mb.harga_tertinggi,mb.harga_beli_terahir,
            mb.ms_jenis_obat_id,mjo.nama_jenis_obat,mb.komposisi, mb.ms_satuan_jual_id,msb.nama_satuan,
            s.ms_gudang_id,mg.nama_gudang,mg.tipe_gudang`, s)

            res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].total, jumlah, halaman });
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
   

    static async listStockByGudangIdPerHalaman(req, res) {
        const { ms_gudang_id, halaman, jumlah } = req.body

        try {
            let offset = (+halaman - 1) * jumlah;
            let data = await sq.query(`select s.id as "stock_id", * from stock s 
            join ms_barang mb on mb.id = s.ms_barang_id 
            join ms_gudang mg on mg.id = s.ms_gudang_id 
            where s."deletedAt" isnull and mb."deletedAt" isnull and mg."deletedAt" isnull and s.ms_gudang_id = '${ms_gudang_id}' 
            order by s."createdAt" desc limit ${jumlah} offset ${offset}`, s)
            let jml = await sq.query(`select count(*) as "total" from stock s 
            join ms_barang mb on mb.id = s.ms_barang_id 
            join ms_gudang mg on mg.id = s.ms_gudang_id 
            where s."deletedAt" isnull and mb."deletedAt" isnull and mg."deletedAt" isnull and s.ms_gudang_id = '${ms_gudang_id}' `, s)
            res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].total, jumlah, halaman })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async kartuStok(req, res) {
        const { ms_barang_id, ms_gudang_id, tgl_awal, tgl_akhir, halaman, jumlah } = req.body

        try {
            let isi = ''
            let offset = (+halaman - 1) * jumlah;

            if (ms_barang_id) {
                isi += ` and hi.ms_barang_id = '${ms_barang_id}' `
            }
            if (ms_gudang_id) {
                isi += ` and hi.ms_gudang_id = '${ms_gudang_id}' `
            }
            if (tgl_awal) {
                isi += ` and date(hi."createdAt") >= '${tgl_awal}' `
            }
            if (tgl_akhir) {
                isi += ` and date(hi."createdAt") <= '${tgl_akhir}' `
            }

            let data = await sq.query(`select hi.id as "history_inventory_id",hi.tgl_transaksi ,hi.tipe_transaksi ,hi.debit_kredit , hi.qty,hi.stok_awal_per_gudang , hi.stok_akhir_per_gudang ,
            p.user_id as user_id_pembelian ,so.user_id as user_id_stock_opname ,a.user_id as user_id_adjustment , mg.nama_gudang ,mb.nama_barang ,hi."createdAt" 
            from history_inventory hi 
            left join pembelian p on p.id = hi.transaksi_id 
            left join stock_opname so on so.id = hi.transaksi_id 
            left join adjustment a on a.id = hi.transaksi_id 
            left join ms_gudang mg on mg.id = hi.ms_gudang_id 
            join ms_barang mb on mb.id = hi.ms_barang_id 
            where hi."deletedAt" isnull ${isi} order by hi."createdAt" desc limit ${jumlah} offset ${offset}`, s)

            let data2 = await sq.query(`select * from users u where u."deletedAt" isnull`, s)

            for (let i = 0; i < data.length; i++) {
                if (data[i].debit_kredit == 'd') {
                    data[i].stok_masuk = data[i].qty
                    data[i].stok_keluar = 0
                }
                if (data[i].debit_kredit == 'k') {
                    data[i].stok_keluar = data[i].qty
                    data[i].stok_masuk = 0
                }
                for (let j = 0; j < data2.length; j++) {
                    if (data[i].user_id_pembelian == data2[j].id || data[i].user_id_stock_opname == data2[j].id || data[i].user_id_adjustment == data2[j].id) {
                        data[i].user = data2[j].username
                    }
                }
            }

            let jml = await sq.query(`select count(*) as total from history_inventory hi where hi."deletedAt" isnull ${isi}`, s)

            res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].total, jumlah, halaman });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static async laporanNarkotik(req, res) {
        const { tgl_awal, tgl_akhir, nama_barang, halaman, jumlah } = req.body

        try {
            let isi = ''
            let offset = (+halaman - 1) * jumlah;

            if (tgl_awal) {
                isi += ` and date(hi."tgl_transaksi") >= '${tgl_awal}' `
            }
            if (tgl_akhir) {
                isi += ` and date(hi."tgl_transaksi") <= '${tgl_akhir}' `
            }
            if (nama_barang) {
                isi += ` and mb.nama_barang ilike '%${nama_barang}%' `
            }

            let data = await sq.query(`select hi.ms_barang_id, mb.kode_produk, mb.nama_barang , sum(hi.qty) as "pembelian_tgl_proses", sum(hi.stok_awal_per_gudang) as "stok_awal", sum(hi.stok_akhir_per_gudang) as "stok_akhir" 
            from history_inventory hi 
            join ms_barang mb on mb.id = hi.ms_barang_id 
            join ms_kelas_terapi mkt on mkt.id = mb.ms_kelas_terapi_id 
            join pembelian p on p.id = hi.transaksi_id 
            where hi."deletedAt" isnull and mkt.is_narkotik is true ${isi} 
            group by hi.tipe_transaksi ,hi.ms_barang_id ,mb.kode_produk ,mb.nama_barang 
            limit ${jumlah} offset ${offset}`, s)

            let jml = await sq.query(`select count(*) as "total" 
            from history_inventory hi 
            join ms_barang mb on mb.id = hi.ms_barang_id 
            join ms_kelas_terapi mkt on mkt.id = mb.ms_kelas_terapi_id 
            join pembelian p on p.id = hi.transaksi_id 
            where hi."deletedAt" isnull 
            and mkt.is_narkotik is true ${isi}`, s) 

            for (let i = 0; i < data.length; i++) {
                data[i].pembelian_tgl_faktur = 0 
                data[i].jumlah_penjualan = 0
            }

            res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].total, jumlah, halaman });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static async downloadKartuStok(req, res) {
        const { ms_barang_id, ms_gudang_id, tgl_awal, tgl_akhir } = req.query

        try {
            let isi = ''

            if (ms_barang_id) {
                isi += ` and hi.ms_barang_id = '${ms_barang_id}' `
            }
            if (ms_gudang_id) {
                isi += ` and hi.ms_gudang_id = '${ms_gudang_id}' `
            }
            if (tgl_awal) {
                isi += ` and date(hi."createdAt") >= '${tgl_awal}' `
            }
            if (tgl_akhir) {
                isi += ` and date(hi."createdAt") <= '${tgl_akhir}' `
            }

            let data = await sq.query(`select hi.id as "history_inventory_id",hi.tgl_transaksi ,hi.tipe_transaksi ,hi.debit_kredit , hi.qty, hi.stok_akhir_per_gudang ,
            p.user_id as user_id_pembelian ,so.user_id as user_id_stock_opname ,a.user_id as user_id_adjustment , mg.nama_gudang ,mb.nama_barang 
            from history_inventory hi 
            left join pembelian p on p.id = hi.transaksi_id 
            left join stock_opname so on so.id = hi.transaksi_id 
            left join adjustment a on a.id = hi.transaksi_id 
            left join ms_gudang mg on mg.id = hi.ms_gudang_id 
            join ms_barang mb on mb.id = hi.ms_barang_id 
            where hi."deletedAt" isnull ${isi}`, s);

            let data2 = await sq.query(`select * from users u where u."deletedAt" isnull`, s)

            for (let i = 0; i < data.length; i++) {
                data[i].no = i + 1
                if (data[i].debit_kredit == 'd') {
                    data[i].stok_masuk = data[i].qty
                    data[i].stok_keluar = 0
                }
                if (data[i].debit_kredit == 'k') {
                    data[i].stok_keluar = data[i].qty
                    data[i].stok_masuk = 0
                }
                for (let j = 0; j < data2.length; j++) {
                    if (data[i].user_id_pembelian == data2[j].id || data[i].user_id_stock_opname == data2[j].id || data[i].user_id_adjustment == data2[j].id) {
                        data[i].user = data2[j].username
                    }
                }
            }

            let workbook = new ExcelJS.Workbook();
            let worksheet = workbook.addWorksheet("sheet1");

            let x = [
                { header: "NO", key: "no", width: 5, style: { alignment: { horizontal: 'center' } } },
                { header: "TANGGAL", key: "tgl_transaksi", width: 20, style: { alignment: { horizontal: 'center' } } },
                { header: "KETERANGAN", key: "tipe_transaksi", width: 30, style: { alignment: { horizontal: 'center' } } },
                { header: "STOK MASUK", key: "stok_masuk", width: 20, style: { alignment: { horizontal: 'center' } } },
                { header: "STOK KELUAR", key: "stok_keluar", width: 20, style: { alignment: { horizontal: 'center' } } },
                { header: "STOK AKHIR", key: "stok_akhir_per_gudang", width: 20, style: { alignment: { horizontal: 'center' } } },
                { header: "NAMA BARANG", key: "nama_barang", width: 20, style: { alignment: { horizontal: 'center' } } },
                { header: "NAMA GUDANG", key: "nama_gudang", width: 20, style: { alignment: { horizontal: 'center' } } },
                { header: "USER", key: "user", width: 10, style: { alignment: { horizontal: 'center' } } },
            ];

            let tgl = moment().format('YYYY-MM-DD')
            let file_name = `KARTU-STOK-${tgl}.xlsx`
            worksheet.columns = x;
            worksheet.addRows(data);

            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.setHeader("Content-Disposition", "attachment; filename=" + file_name);

            await workbook.xlsx.write(res);
            res.end();
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async downloadLaporanNarkotik(req, res) {
        const { tgl_awal, tgl_akhir, nama_barang } = req.query

        try {
            let isi = ''

            if (tgl_awal) {
                isi += ` and date(hi."tgl_transaksi") >= '${tgl_awal}' `
            }
            if (tgl_akhir) {
                isi += ` and date(hi."tgl_transaksi") <= '${tgl_akhir}' `
            }
            if (nama_barang) {
                isi += ` and mb.nama_barang ilike '%${nama_barang}%' `
            }

            let data = await sq.query(`select hi.ms_barang_id, mb.kode_produk, mb.nama_barang , sum(hi.qty) as "pembelian_tgl_proses", sum(hi.stok_awal_per_gudang) as "stok_awal", sum(hi.stok_akhir_per_gudang) as "stok_akhir" 
            from history_inventory hi 
            join ms_barang mb on mb.id = hi.ms_barang_id 
            join ms_kelas_terapi mkt on mkt.id = mb.ms_kelas_terapi_id 
            join pembelian p on p.id = hi.transaksi_id 
            where hi."deletedAt" isnull and mkt.is_narkotik is true ${isi} 
            group by hi.tipe_transaksi ,hi.ms_barang_id ,mb.kode_produk ,mb.nama_barang `, s);

            for (let i = 0; i < data.length; i++) {
                data[i].no = i + 1
                data[i].pembelian_tgl_faktur = 0 
                data[i].jumlah_penjualan = 0
            }

            let workbook = new ExcelJS.Workbook();
            let worksheet = workbook.addWorksheet("sheet1");

            let x = [
                { header: "NO", key: "no", width: 5, style: { alignment: { horizontal: 'center' } } },
                { header: "KODE PRODUK", key: "kode_produk", width: 20, style: { alignment: { horizontal: 'center' } } },
                { header: "NAMA BARANG", key: "nama_barang", width: 20, style: { alignment: { horizontal: 'center' } } },
                { header: "STOK AWAL", key: "stok_awal", width: 20, style: { alignment: { horizontal: 'center' } } },
                { header: "PEMBELIAN TGL PROSES", key: "pembelian_tgl_proses", width: 30, style: { alignment: { horizontal: 'center' } } },
                { header: "PEMBELIAN TGL FAKTUR", key: "pembelian_tgl_faktur", width: 30, style: { alignment: { horizontal: 'center' } } },
                { header: "JUMLAH PENJUALAN", key: "jumlah_penjualan", width: 30, style: { alignment: { horizontal: 'center' } } },
                { header: "STOK AKHIR", key: "stok_akhir", width: 20, style: { alignment: { horizontal: 'center' } } },
            ];

            let tgl = moment().format('YYYY-MM-DD')
            let file_name = `LAPORAN-BARANG-NARKOTIK-${tgl}.xlsx`
            worksheet.columns = x;
            worksheet.addRows(data);

            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.setHeader("Content-Disposition", "attachment; filename=" + file_name);

            await workbook.xlsx.write(res);
            res.end();
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
}

module.exports = Controller