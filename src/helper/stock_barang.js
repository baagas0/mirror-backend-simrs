const { sq } = require("../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };
const moment = require('moment');

function kurangiStock (data){
    return new Promise(async(resolve, reject) => {
        const {bulk_barang,ms_gudang_id,isi} = data
        try {
            let hasilCek = []
            let stockBarang = []
            let historyInv = []
            let tgl_transaksi = moment()
            let isiBarang = isi? ` and s.ms_barang_id in (${isi})`:""
            let cekStock = await sq.query(`select s.ms_barang_id,mb.nama_barang,mb.kode_produk,sum(s.qty)as qty,
            s.ms_gudang_id,mg.nama_gudang,mg.tipe_gudang
            from stock s 
            join ms_barang mb on mb.id = s.ms_barang_id 
            join ms_jenis_obat mjo on mjo.id = mb.ms_jenis_obat_id
            join ms_gudang mg on mg.id = s.ms_gudang_id 
            join ms_satuan_barang msb on msb.id = mb.ms_satuan_barang_id
            where s."deletedAt" isnull and mb."deletedAt" isnull and mg."deletedAt" isnull            
            and s.ms_gudang_id = '${ms_gudang_id}'${isiBarang}
            group by s.ms_barang_id,mb.nama_barang,mb.kode_produk,mb.qjb,
            mb.harga_pokok,mb.harga_tertinggi,mb.harga_beli_terahir,
            mb.ms_jenis_obat_id,mjo.nama_jenis_obat,mb.komposisi, mb.ms_satuan_jual_id,msb.nama_satuan,
            s.ms_gudang_id,mg.nama_gudang,mg.tipe_gudang order by mb.nama_barang`,s);
            let stock = await sq.query(`select s.id,s.ms_barang_id,mb.nama_barang,s.kode_batch,s.qty,
            s.ms_gudang_id,mg.nama_gudang,s.tgl_kadaluarsa,mb.harga_pokok  
            from stock s 
            join ms_barang mb on mb.id = s.ms_barang_id 
            join ms_gudang mg on mg.id = s.ms_gudang_id 
            where s."deletedAt" isnull 
            and s.ms_gudang_id = '${ms_gudang_id}'${isiBarang}
            order by mb.nama_barang,s.tgl_kadaluarsa,kode_batch`,s);

            for (let i = 0; i < bulk_barang.length; i++) {
                let qtyBeli = JSON.parse(JSON.stringify(bulk_barang[i].qty_barang))
                for (let j = 0; j < cekStock.length; j++) {
                    if(bulk_barang[i].ms_barang_id == cekStock[j].ms_barang_id){
                        if(bulk_barang[i].qty_barang>cekStock[j].qty){
                            hasilCek.push({ms_barang_id:cekStock[j].ms_barang_id,nama_barang:cekStock[j].nama_barang,kode_produk: cekStock[j].kode_produk,ms_gudang_id:cekStock[j].kode_produk,nama_gudang:cekStock[j].nama_gudang,tipe_gudang:cekStock[j].tipe_gudang,qty:JSON.parse(JSON.stringify(cekStock[j].qty)),qty_pesan:bulk_barang[i].qty_barang})
                        }
                    }
                }
                for (let j = 0; j < stock.length; j++) {
                    if(bulk_barang[i].ms_barang_id == stock[j].ms_barang_id){
                        if(qtyBeli>0){
                            let x = {id:uuid_v4(),tipe_transaksi:'penjualan',transaksi_id:bulk_barang[i].penjualan_id,debit_kredit:'k',stok_awal_per_gudang:0,stok_akhir_per_gudang:0,stok_awal_per_batch:stock[j].qty,stok_akhir_per_batch:0,qty:stock[j].qty,harga_pokok_awal:stock[j].harga_pokok,harga_pokok_akhir:stock[j].harga_pokok,tgl_transaksi:tgl_transaksi,ms_gudang_id,stock_id:stock[j].id,ms_barang_id:stock[j].ms_barang_id,nama_barang:stock[j].nama_barang}
                            if(stock[j].qty>=qtyBeli){
                                let stockAkhir = stock[j].qty-qtyBeli
                                stockBarang.push({id:stock[j].id,nama_barang:stock[j].nama_barang,kode_batch:stock[j].kode_batch,qtyAwal:stock[j].qty,qtyMinta:qtyBeli,qty:stockAkhir});
                                x.stok_akhir_per_batch = stockAkhir
                                x.qty = qtyBeli
                                for (let k = 0; k < cekStock.length; k++) {
                                    if(cekStock[k].ms_barang_id == stock[j].ms_barang_id){
                                        x.stok_awal_per_gudang = cekStock[k].qty
                                        x.stok_akhir_per_gudang = cekStock[k].qty - qtyBeli
                                        cekStock[k].qty -= qtyBeli
                                    }
                                }
                                qtyBeli = 0
                            }else if(stock[j].qty<qtyBeli){
                                stockBarang.push({id:stock[j].id,nama_barang:stock[j].nama_barang,kode_batch:stock[j].kode_batch,qtyAwal:stock[j].qty,qtyMinta:qtyBeli,qty:0})
                                x.stok_akhir_per_batch = 0
                                for (let k = 0; k < cekStock.length; k++) {
                                    if(cekStock[k].ms_barang_id == stock[j].ms_barang_id){
                                        x.stok_awal_per_gudang = cekStock[k].qty
                                        x.stok_akhir_per_gudang = cekStock[k].qty - stock[j].qty
                                        cekStock[k].qty -= stock[j].qty
                                    }
                                }
                                qtyBeli -= stock[j].qty
                            }
                            historyInv.push(x)
                        }
                    }
                }
            }

            if(hasilCek.length>0){
                resolve({cekHasil:hasilCek,stock:[],hisInv:[]})
            }else{
                resolve({cekHasil:hasilCek,stock:stockBarang,hisInv:historyInv})
            }
        } catch (err) {
            console.log(err);
            console.log("erorr kurangi stock");
            reject(err)
        }
    });
}

function kembaliStock (data){
    return new Promise(async(resolve, reject) => {
        const {bulk_barang,ms_gudang_id,isi} = data
        try {
            let stockBarang = []
            let historyInv = []
            let tgl_transaksi = moment()
            let isiBarang = isi? ` and s.ms_barang_id in (${isi})`:""
            let cekStock = await sq.query(`select s.ms_barang_id,mb.nama_barang,mb.kode_produk,sum(s.qty)as qty,
            s.ms_gudang_id,mg.nama_gudang,mg.tipe_gudang
            from stock s 
            join ms_barang mb on mb.id = s.ms_barang_id 
            join ms_jenis_obat mjo on mjo.id = mb.ms_jenis_obat_id
            join ms_gudang mg on mg.id = s.ms_gudang_id 
            join ms_satuan_barang msb on msb.id = mb.ms_satuan_barang_id
            where s."deletedAt" isnull and mb."deletedAt" isnull and mg."deletedAt" isnull            
            and s.ms_gudang_id = '${ms_gudang_id}'${isiBarang}
            group by s.ms_barang_id,mb.nama_barang,mb.kode_produk,mb.qjb,
            mb.harga_pokok,mb.harga_tertinggi,mb.harga_beli_terahir,
            mb.ms_jenis_obat_id,mjo.nama_jenis_obat,mb.komposisi, mb.ms_satuan_jual_id,msb.nama_satuan,
            s.ms_gudang_id,mg.nama_gudang,mg.tipe_gudang order by mb.nama_barang`,s);

            let stock = await sq.query(`select s.id,s.ms_barang_id,mb.nama_barang,s.kode_batch,s.qty,
            s.ms_gudang_id,mg.nama_gudang,s.tgl_kadaluarsa,mb.harga_pokok,
            case when (select hi.qty from history_inventory hi where hi."deletedAt" isnull 
            and hi.transaksi_id = '${bulk_barang[0].penjualan_id}' and hi.debit_kredit= 'k' 
            and hi.stock_id = s.id order by hi."createdAt" desc limit 1) isnull then 0
            else (select hi.qty from history_inventory hi where hi."deletedAt" isnull 
            and hi.transaksi_id = '${bulk_barang[0].penjualan_id}' and hi.debit_kredit= 'k' 
            and hi.stock_id = s.id order by hi."createdAt" desc limit 1) end stock_awal
            from stock s 
            join ms_barang mb on mb.id = s.ms_barang_id 
            join ms_gudang mg on mg.id = s.ms_gudang_id 
            where s."deletedAt" isnull              
            and s.ms_gudang_id = '${ms_gudang_id}'${isiBarang}
            order by mb.nama_barang,s.tgl_kadaluarsa,kode_batch`,s);

            for (let i = 0; i < bulk_barang.length; i++) {
                let qtyBarang = JSON.parse(JSON.stringify(bulk_barang[i].qty_barang))
                for (let j = 0; j < stock.length; j++) {
                    if(bulk_barang[i].ms_barang_id == stock[j].ms_barang_id){
                        if(qtyBarang>0){
                            if(stock[j].stock_awal>0){
                                let stockAkhir = stock[j].qty+stock[j].stock_awal
                                let x = {id:uuid_v4(),tipe_transaksi:'penjualan',transaksi_id:bulk_barang[i].penjualan_id,debit_kredit:'d',stok_awal_per_gudang:0,stok_akhir_per_gudang:0,stok_awal_per_batch:stock[j].qty,stok_akhir_per_batch:stockAkhir,qty:stock[j].stock_awal,harga_pokok_awal:stock[j].harga_pokok,harga_pokok_akhir:stock[j].harga_pokok,tgl_transaksi:tgl_transaksi,ms_gudang_id,stock_id:stock[j].id,ms_barang_id:bulk_barang[i].ms_barang_id,nama_barang:stock[j].nama_barang}
                                stockBarang.push({id:stock[j].id,nama_barang:stock[j].nama_barang,kode_batch:stock[j].kode_batch,qtyAwal:stock[j].qty,qtyTambah:stock[j].stock_awal,qty:stockAkhir});
                                for (let k = 0; k < cekStock.length; k++) {
                                    if(cekStock[k].ms_barang_id == stock[j].ms_barang_id){
                                        x.stok_awal_per_gudang =  cekStock[k].qty
                                        x.stok_akhir_per_gudang =  cekStock[k].qty + stock[j].stock_awal
                                        cekStock[k].qty += stock[j].stock_awal
                                    }
                                }
                                historyInv.push(x)
                                qtyBarang -= stock[j].stock_awal
                            }
                        }
                    }
                }
            }
            resolve({cekHasil:[],stock:stockBarang,hisInv:historyInv})
        } catch (err) {
            console.log(err);
            console.log("erorr kembali stock");
            reject(err)
        }
    });
}

function updateStock (data){
    return new Promise(async(resolve, reject) => {
        const {bulk_barang,ms_gudang_id,isi} = data
        try {
            let hasilCek = []
            let stockBarang = []
            let historyInv = []
            let tgl_transaksi = moment()
            let isiBarang = isi? ` and s.ms_barang_id in (${isi})`:""
            let cekStock = await sq.query(`select s.ms_barang_id,mb.nama_barang,mb.kode_produk,sum(s.qty)as qty,
            s.ms_gudang_id,mg.nama_gudang,mg.tipe_gudang
            from stock s 
            join ms_barang mb on mb.id = s.ms_barang_id 
            join ms_jenis_obat mjo on mjo.id = mb.ms_jenis_obat_id
            join ms_gudang mg on mg.id = s.ms_gudang_id 
            join ms_satuan_barang msb on msb.id = mb.ms_satuan_barang_id
            where s."deletedAt" isnull and mb."deletedAt" isnull and mg."deletedAt" isnull            
            and s.ms_gudang_id = '${ms_gudang_id}'${isiBarang}
            group by s.ms_barang_id,mb.nama_barang,mb.kode_produk,mb.qjb,
            mb.harga_pokok,mb.harga_tertinggi,mb.harga_beli_terahir,
            mb.ms_jenis_obat_id,mjo.nama_jenis_obat,mb.komposisi, mb.ms_satuan_jual_id,msb.nama_satuan,
            s.ms_gudang_id,mg.nama_gudang,mg.tipe_gudang order by mb.nama_barang`,s);

            let stock = await sq.query(` select s.id,s.ms_barang_id,mb.nama_barang,s.kode_batch,s.qty,
            s.ms_gudang_id,mg.nama_gudang,s.tgl_kadaluarsa,mb.harga_pokok,
            case when (select hi.qty from history_inventory hi where hi."deletedAt" isnull 
            and hi.transaksi_id = '${bulk_barang[0].penjualan_id}' and hi.debit_kredit= 'k' 
            and hi.stock_id = s.id order by hi."createdAt" desc limit 1) isnull then 0
            else (select hi.qty from history_inventory hi where hi."deletedAt" isnull 
            and hi.transaksi_id = '${bulk_barang[0].penjualan_id}' and hi.debit_kredit= 'k' 
            and hi.stock_id = s.id order by hi."createdAt" desc limit 1) end stock_awal
            from stock s 
            join ms_barang mb on mb.id = s.ms_barang_id 
            join ms_gudang mg on mg.id = s.ms_gudang_id 
            where s."deletedAt" isnull              
            and s.ms_gudang_id = '${ms_gudang_id}'${isiBarang}
            order by mb.nama_barang,s.tgl_kadaluarsa,kode_batch`,s);

            for (let i = 0; i < bulk_barang.length; i++) {
                let qtyBarang = JSON.parse(JSON.stringify(bulk_barang[i].qty_barang))
                for (let j = 0; j < stock.length; j++) {
                    if(bulk_barang[i].ms_barang_id == stock[j].ms_barang_id){
                        if(qtyBarang>0){
                            if(stock[j].stock_awal>0){
                                let stockAkhir = stock[j].qty+stock[j].stock_awal
                                let x = {id:uuid_v4(),tipe_transaksi:'penjualan',transaksi_id:bulk_barang[i].penjualan_id,debit_kredit:'d',stok_awal_per_gudang:0,stok_akhir_per_gudang:0,stok_awal_per_batch:stock[j].qty,stok_akhir_per_batch:stockAkhir,qty:stock[j].stock_awal,harga_pokok_awal:stock[j].harga_pokok,harga_pokok_akhir:stock[j].harga_pokok,tgl_transaksi:tgl_transaksi,ms_gudang_id,stock_id:stock[j].id,ms_barang_id:bulk_barang[i].ms_barang_id,nama_barang:stock[j].nama_barang}
                                stockBarang.push({id:stock[j].id,nama_barang:stock[j].nama_barang,kode_batch:stock[j].kode_batch,qtyAwal:stock[j].qty,qtyTambah:stock[j].stock_awal,qty:stockAkhir});
                                for (let k = 0; k < cekStock.length; k++) {
                                    if(cekStock[k].ms_barang_id == stock[j].ms_barang_id){
                                        x.stok_awal_per_gudang =  cekStock[k].qty
                                        x.stok_akhir_per_gudang =  cekStock[k].qty + stock[j].stock_awal
                                        cekStock[k].qty += stock[j].stock_awal
                                    }
                                }
                                historyInv.push(x)
                                qtyBarang -= stock[j].stock_awal
                                stock[j].qty = stockAkhir
                            }
                        }
                    }
                }
            }

            for (let i = 0; i < bulk_barang.length; i++) {
                let qtyBeli = JSON.parse(JSON.stringify(bulk_barang[i].qtyUpdate))
                for (let j = 0; j < cekStock.length; j++) {
                    if(bulk_barang[i].ms_barang_id == cekStock[j].ms_barang_id){
                        if(bulk_barang[i].qtyUpdate>cekStock[j].qty){
                            hasilCek.push({ms_barang_id:cekStock[j].ms_barang_id,nama_barang:cekStock[j].nama_barang,kode_produk: cekStock[j].kode_produk,ms_gudang_id:cekStock[j].kode_produk,nama_gudang:cekStock[j].nama_gudang,tipe_gudang:cekStock[j].tipe_gudang,qty:JSON.parse(JSON.stringify(cekStock[j].qty)),qty_pesan:bulk_barang[i].qtyUpdate})
                        }
                    }
                }
                for (let j = 0; j < stock.length; j++) {
                    let cek = false;
                    if(bulk_barang[i].ms_barang_id == stock[j].ms_barang_id){
                        if(qtyBeli>0){
                            let x = {id:uuid_v4(),tipe_transaksi:'penjualan',transaksi_id:bulk_barang[i].penjualan_id,debit_kredit:'k',stok_awal_per_gudang:0,stok_akhir_per_gudang:0,stok_awal_per_batch:stock[j].qty,stok_akhir_per_batch:0,qty:stock[j].qty,harga_pokok_awal:stock[j].harga_pokok,harga_pokok_akhir:stock[j].harga_pokok,tgl_transaksi:tgl_transaksi,ms_gudang_id,stock_id:stock[j].id,ms_barang_id:stock[j].ms_barang_id,nama_barang:stock[j].nama_barang}

                            let z = {id:stock[j].id,nama_barang:stock[j].nama_barang,kode_batch:stock[j].kode_batch,qtyAwal:stock[j].qty,qtyMinta:qtyBeli,qty:0}
                            
                            if(stock[j].qty>=qtyBeli){
                                let stockAkhir = stock[j].qty-qtyBeli
                                z.qty = stockAkhir
                                x.stok_akhir_per_batch = stockAkhir
                                x.qty = qtyBeli
                                for (let k = 0; k < cekStock.length; k++) {
                                    if(cekStock[k].ms_barang_id == stock[j].ms_barang_id){
                                        x.stok_awal_per_gudang = cekStock[k].qty
                                        x.stok_akhir_per_gudang = cekStock[k].qty - qtyBeli
                                        cekStock[k].qty -= qtyBeli
                                    }
                                }
                                qtyBeli = 0
                            }else if(stock[j].qty<qtyBeli){
                                x.stok_akhir_per_batch = 0
                                for (let k = 0; k < cekStock.length; k++) {
                                    if(cekStock[k].ms_barang_id == stock[j].ms_barang_id){
                                        x.stok_awal_per_gudang = cekStock[k].qty
                                        x.stok_akhir_per_gudang = cekStock[k].qty - stock[j].qty
                                        cekStock[k].qty -= stock[j].qty
                                    }
                                }
                                qtyBeli -= stock[j].qty
                            }
                            historyInv.push(x)
                            for (let k = 0; k < stockBarang.length; k++) {
                                if(stockBarang[k].id == z.id){
                                    stockBarang[k].qtyMinta = z.qtyMinta
                                    stockBarang[k].qty = z.qty
                                    cek = true
                                }
                            }
                            if(!cek){
                                stockBarang.push(z)
                            }
                        }
                    }
                }
            }
            // console.log(stockBarang);
            // console.log("=========================");
            // console.log(historyInv);
            if(hasilCek.length>0){
                resolve({cekHasil:hasilCek,stock:[],hisInv:[]})
            }else{
                resolve({cekHasil:hasilCek,stock:stockBarang,hisInv:historyInv})
            }
        } catch (err) {
            console.log(err);
            console.log("erorr update stock");
            reject(err)
        }
    });
}

module.exports = {kurangiStock,kembaliStock,updateStock}