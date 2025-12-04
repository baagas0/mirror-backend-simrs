const pembelian = require('./model')
const subPembelian = require('../sub_pembelian/model')
const msBarang = require('../ms_barang/model')
const stock = require('../stock/model')
const subPo = require('../sub_po/model')
const historyInventory = require('../history_inventory/model')
const satuanBarang = require('../ms_satuan_barang/model')
const pembayaranPembelian = require('../pembayaran_pembelian/model')
const periode = require('../periode/model')
const supplier = require('../ms_supplier/model')
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const subPO = require('../sub_po/model')
const s = { type: QueryTypes.SELECT };
const emitter = require('../../helper/event_emitter');
const settingKodeAkun = require('../setting_kode_akun/model')

async function createHPP(tot_harga,tot_qty,ms_barang_id,id_sub){
        const retrieveStock = await stock.sum('qty',{where:{ms_barang_id}});
        const retrieveBarang = await msBarang.findOne({where:{id:ms_barang_id}});
        const harga_pokok_awal = retrieveBarang.dataValues.harga_pokok;
        const harga_pokok_akhir = !id_sub?(retrieveStock*retrieveBarang.dataValues.harga_pokok+tot_harga)/(retrieveStock+tot_qty):(retrieveStock*retrieveBarang.dataValues.harga_pokok-tot_harga)/(retrieveStock-tot_qty);
        let param={
            ms_barang_id
        }
        if(id_sub){
            param.id={ [Op.not]: null }
        }
        let harga_tertinggi = await subPembelian.max('harga_per_satuan_simpan', { where: param })
        harga_tertinggi=(tot_harga/tot_qty)>harga_tertinggi?(tot_harga/tot_qty):harga_tertinggi;
        const harga_beli_terakhir = tot_harga/tot_qty;
        const data = {
            harga_pokok_awal,
            harga_pokok_akhir,
            harga_tertinggi,
            harga_beli_terakhir
        }
       return data;
}
class Controller {
    static async registerPo(req, res) {
        const t = await sq.transaction()
        const { id, tgl_po, sub_po, ms_suplier_id, ms_gudang_id} = req.body;

        let status_pembelian=1;
        let tahap='po';
        try {
                if(id){
                    const updatePembelianPo = await pembelian.update({tgl_po,ms_suplier_id,ms_gudang_id},{where:{id}},{transaction:t});
                    await subPO.destroy({ where: { pembelian_id:id },force:true }, { transaction: t })
                    let itemsPo=[]
                    if(sub_po){
                        sub_po.forEach( function(item) {
                            itemsPo.push({id:uuid_v4(),ms_barang_id:item.ms_barang_id,total_qty_satuan_simpan:item.total_qty_satuan_simpan,pembelian_id:id})
                        });
                    }
                    const jmbt= await subPo.bulkCreate(itemsPo,{transaction:t})
                    await t.commit()
                    return res.status(200).json({ status: 200, message: "sukses", data:updatePembelianPo })
                }
                const jml = await pembelian.count({where:{kode_po:{ [Op.not]: null }}});
                const kode_po = (jml+1);
                const pembelianPo= await pembelian.create({id:uuid_v4(), ms_suplier_id, ms_gudang_id, tgl_po, user_id:req.dataUsers.id, status_pembelian, tahap, kode_po}, { transaction: t });
                let itemsPo=[]
                if(sub_po){
                    sub_po.forEach( function(item) {
                        itemsPo.push({id:uuid_v4(),ms_barang_id:item.ms_barang_id,total_qty_satuan_simpan:item.total_qty_satuan_simpan,pembelian_id:pembelianPo.dataValues.id})
                    });
                }
                const jmbt= await subPo.bulkCreate(itemsPo,{transaction:t})
                    await t.commit()
                    return res.status(200).json({ status: 200, message: "sukses", data:pembelianPo })
            
        } catch (err) {
            await t.rollback()
            // console.log(req.body);
            console.log(err);
            return res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async register(req, res) {
        const t = await sq.transaction()
        const {id, ms_suplier_id, ms_gudang_id,no_faktur,tgl_po, tgl_faktur, biaya_lain, ongkos_kirim, pajak, potongan, tgl_jatuh_tempo, tgl_kedatangan,sub_pembelian } = req.body;

        let status_pembelian=2;
        let total_pembelian=0;
        let tahap='pembelian';
        try {
            const idPembelian=uuid_v4();
            let items=[]
                await Promise.all(sub_pembelian.map(async (item) => {
                    items.push({
                        id:uuid_v4(),
                        ms_barang_id:item.ms_barang_id,
                        ms_satuan_beli_id:item.ms_satuan_beli_id,
                        qty_satuan_simpan:item.qty_satuan_simpan,
                        ms_pembelian_id:id?id:idPembelian,
                        kode_batch:item.kode_batch,
                        qty_beli:item.qty_beli,
                        harga_per_satuan_simpan:item.harga_per_satuan_simpan,
                        harga_beli:item.harga_beli,
                        total_harga_beli:item.total_harga_beli,
                        total_qty_satuan_simpan:item.total_qty_satuan_simpan,
                        tgl_kadaluarsa:item.tgl_kadaluarsa
                    })
                    total_pembelian+=parseFloat(item.total_harga_beli);
                
                  }));
                
            if(id){
                const checkNoFaktur = await pembelian.findOne({where:{no_faktur,id:{ [Op.not]: id }},raw:true});
                if(checkNoFaktur){
                    return res.status(201).json({ status: 204, message: "No Faktur tidak boleh sama" });
                }
                await pembelian.update({ms_suplier_id, ms_gudang_id,no_faktur,tgl_po, tgl_faktur, biaya_lain, ongkos_kirim, pajak, potongan, tgl_jatuh_tempo, tgl_kedatangan, user_id:req.dataUsers.id, status_pembelian,total_pembelian,tahap}, { where: { id } }, { transaction: t });
                await subPembelian.destroy({ where: { ms_pembelian_id:id },force:true }, { transaction: t })
                const jmbt= await subPembelian.bulkCreate(items,{transaction:t})
                await t.commit()
                return res.status(200).json({ status: 200, message: "sukses", data:jmbt })
            }
            const checkNoFaktur = await pembelian.findOne({where:{no_faktur},raw:true});
            if(checkNoFaktur){
                return res.status(201).json({ status: 204, message: "No Faktur tidak boleh sama" });
            }
            const createPembelian= await pembelian.create({id:idPembelian,ms_suplier_id, ms_gudang_id,no_faktur,tgl_po, tgl_faktur, biaya_lain, ongkos_kirim, pajak, potongan, tgl_jatuh_tempo, tgl_kedatangan, user_id:req.dataUsers.id, status_pembelian,total_pembelian,tahap}, { transaction: t });
            const jmbt= await subPembelian.bulkCreate(items,{transaction:t});
            createPembelian.dataValues.subPembelian=jmbt;
            await t.commit()
            return res.status(200).json({ status: 200, message: "sukses", data:createPembelian })
    
        } catch (err) {
            await t.rollback()
            console.log(req.body);
            console.log(err);
            return res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
    static update(req, res) {
        const { id, no_faktur, tgl_po, status_pembelian, tgl_faktur, biaya_lain, ongkos_kirim, pajak, potongan, total_pembelian, ubah_harga_pokok, tgl_jatuh_tempo, tgl_kedatangan, ms_suplier_id, ms_gudang_id, user_id } = req.body;

        pembelian.update({ no_faktur, tgl_po, status_pembelian, tgl_faktur, biaya_lain, ongkos_kirim, pajak, potongan, total_pembelian, ubah_harga_pokok, tgl_jatuh_tempo, tgl_kedatangan, ms_suplier_id, ms_gudang_id, user_id }, { where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static delete(req, res) {
        const { id } = req.body;

        pembelian.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        const{halaman,jumlah,nama_tarif,keterangan} = req.body

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if(nama_tarif){
                isi+= ` and mt.nama_tarif ilike '%${nama_tarif}%'`
            }
            if(keterangan){
                isi+= ` and mt.keterangan ilike '%${nama_tarif}%'`
            }

            let data = await sq.query(`select p.id as pembelian_id,p.*,ms.nama_supplier,ms.no_hp_supplier,ms.alamat_supplier,
			mg.nama_gudang,mg.tipe_gudang,mg.is_utama,mg.ms_gudang_utama_id,u.username,u."role" 
            from pembelian p
            join ms_supplier ms on ms.id = p.ms_suplier_id 
            join ms_gudang mg on mg.id = p.ms_gudang_id 
            join users u on u.id = p.user_id 
            where p."deletedAt" isnull${isi}
            order by p."createdAt" desc ${pagination}`,s);
            let jml = await sq.query(`select count(*) from pembelian p
            join ms_supplier ms on ms.id = p.ms_suplier_id 
            join ms_gudang mg on mg.id = p.ms_gudang_id 
            join users u on u.id = p.user_id 
            where p."deletedAt" isnull${isi}`,s);

            emitter.emitEvent('message',{id:1});
            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async detailsById(req, res) {
        const { id } = req.body

        try {
            let data = await sq.query(`select p.id as pembelian_id,p.*,ms.nama_supplier,ms.no_hp_supplier,ms.alamat_supplier,
			mg.nama_gudang,mg.tipe_gudang,mg.is_utama,mg.ms_gudang_utama_id,u.username,u."role" 
            from pembelian p
            join ms_supplier ms on ms.id = p.ms_suplier_id 
            join ms_gudang mg on mg.id = p.ms_gudang_id 
            join users u on u.id = p.user_id 
            where p."deletedAt" isnull and p.id = '${id}'`,s);
            
            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async closed(req, res){
        const {id,tgl_masuk,ubah_harga_pokok}=req.body;
        const t = await sq.transaction()
        try {
            const dataPembelian = await pembelian.findOne({ where: {id},include: [{
                model: supplier,
                required: false
               }]
             });
            const dataSubPembelian = await subPembelian.findAll({where:{ms_pembelian_id:id}})
            let items=[];
            let itemsInventory=[];
                await Promise.all(dataSubPembelian.map(async (item) => {
                    //update mutasi_id
                    const checkStockPerBatch = await stock.sum('qty',{where:{ms_gudang_id:dataPembelian.dataValues.ms_gudang_id,ms_barang_id:item.ms_barang_id,kode_batch:item.kode_batch}});
                    const sumStockAll = await stock.sum('qty',{where:{ms_gudang_id:dataPembelian.dataValues.ms_gudang_id,ms_barang_id:item.ms_barang_id}});
                    const retrieveHPP = await createHPP(item.total_harga_beli, item.total_qty_satuan_simpan, item.ms_barang_id);
                    let totalQty = checkStockPerBatch?(item.total_qty_satuan_simpan+checkStockPerBatch):item.total_qty_satuan_simpan;
                    const stockId=uuid_v4();
                    const harga_pokok = ubah_harga_pokok?retrieveHPP.harga_pokok_akhir:retrieveHPP.harga_pokok_awal;
                        items.push({
                            id:stockId,
                            ms_barang_id:item.ms_barang_id,
                            ms_gudang_id:dataPembelian.dataValues.ms_gudang_id,
                            kode_batch:item.kode_batch,
                            qty:item.total_qty_satuan_simpan.toFixed(2),
                            pembelian_id:dataPembelian.dataValues.id,
                            tgl_masuk,
                            tgl_kadaluarsa:item.tgl_kadaluarsa
                        })
                        
                    itemsInventory.push({
                        id:uuid_v4(),
                        tipe_transaksi:'pembelian',
                        transaksi_id:id,
                        ms_gudang_id:dataPembelian.dataValues.ms_gudang_id,
                        stock_id:stockId,
                        debit_kredit:'d',
                        stok_awal_per_gudang:sumStockAll?sumStockAll.toFixed(2):0,
                        stok_akhir_per_gudang:(sumStockAll+item.total_qty_satuan_simpan).toFixed(2),
                        stok_awal_per_batch:checkStockPerBatch?checkStockPerBatch.toFixed(2):0,
                        stok_akhir_per_batch:totalQty.toFixed(2),
                        qty:item.total_qty_satuan_simpan.toFixed(2),
                        harga_pokok_awal:retrieveHPP.harga_pokok_awal?.toFixed(2) || '0.00',
                        harga_pokok_akhir:harga_pokok.toFixed(2),
                        tgl_transaksi:dataPembelian.dataValues.tgl_faktur,
                        ms_barang_id:item.ms_barang_id
                    })
                    const updatedBarang = {
                        harga_pokok:harga_pokok.toFixed(2),
                        harga_tertinggi:retrieveHPP.harga_tertinggi.toFixed(2),
                        harga_beli_terahir:retrieveHPP.harga_beli_terakhir.toFixed(2)
                    }   
                    await msBarang.update(updatedBarang,{where:{id:item.ms_barang_id}},{transaction:t})
                  }));
                    const tanggal=new Date(dataPembelian.dataValues.tgl_faktur);
                    const bulan=tanggal.getMonth();
                    const tahun=tanggal.getFullYear();
                    const retrievePeriode= await periode.findOne({where:{tahun,bulan},raw:true})
                    if(retrievePeriode && retrievePeriode.status){
                        let body={
                            idgl:'PBL_'+id,
                            tgl:new Date(),
                            judul:'Pembelian',
                            no_invoice:dataPembelian.dataValues.no_faktur,
                            remark:'',   
                        }
                        body.sub_transaksi=[];
                        const settingAkun = await settingKodeAkun.findAll({where:{kode_kategori:'pembelian'},raw:true});
                        for(let item of settingAkun){
                            let tempDebet=0;
                            let tempKredit=0;
                            if(item.kode=='PESE_MEDIS'){
                                if(item.d_k=='d'){
                                    tempDebet=dataPembelian.dataValues.total_pembelian>0?dataPembelian.dataValues.total_pembelian:0;
                                    tempKredit=dataPembelian.dataValues.total_pembelian<0?dataPembelian.dataValues.total_pembelian:0;
                                }else{
                                    tempDebet=dataPembelian.dataValues.total_pembelian<0?dataPembelian.dataValues.total_pembelian:0;
                                    tempKredit=dataPembelian.dataValues.total_pembelian>0?dataPembelian.dataValues.total_pembelian:0;
                                }
                                body.sub_transaksi.push({
                                    cc:dataPembelian.dataValues.ms_gudang_id,
                                    coa_code:item.setting_1,
                                    amount_debet:tempDebet.toFixed(2),
                                    amount_kredit:tempKredit.toFixed(2),
                                    remark:'Pembelian Obat',
                                    identitas_transaksi:'',
                                    type_penerima_id:'SP',
                                    penerima_id:dataPembelian.dataValues.ms_suplier_id,
                                    penerima_name:dataPembelian.dataValues.ms_supplier.dataValues.nama_supplier,//join dari suplier name
                                    sub_type_penerima_id:'KRY',
                                    sub_penerima_id:req.dataUsers.id,
                                    sub_penerima_name:req.dataUsers.username//join dari user ambil name
                                })
                            }
                            if(item.kode=='PPN'){
                                if(item.d_k=='d'){
                                    tempDebet=dataPembelian.dataValues.pajak?dataPembelian.dataValues.pajak>0?dataPembelian.dataValues.pajak:0:0;
                                    tempKredit=dataPembelian.dataValues.pajak?dataPembelian.dataValues.pajak<0?dataPembelian.dataValues.pajak:0:0;
                                }else{
                                    tempDebet=dataPembelian.dataValues.pajak?dataPembelian.dataValues.pajak<0?dataPembelian.dataValues.pajak:0:0;
                                    tempKredit=dataPembelian.dataValues.pajak?dataPembelian.dataValues.pajak>0?dataPembelian.dataValues.pajak:0:0;
                                }
                                body.sub_transaksi.push({
                                    cc:dataPembelian.dataValues.ms_gudang_id,
                                    coa_code:item.setting_1,
                                    amount_debet:tempDebet.toFixed(2),
                                    amount_kredit:tempKredit.toFixed(2),
                                    remark:'Pembelian Obat',
                                    identitas_transaksi:'',
                                    type_penerima_id:'SP',
                                    penerima_id:dataPembelian.dataValues.ms_suplier_id,
                                    penerima_name:dataPembelian.dataValues.ms_supplier.dataValues.nama_supplier,//join dari suplier name
                                    sub_type_penerima_id:'KRY',
                                    sub_penerima_id:req.dataUsers.id,
                                    sub_penerima_name:req.dataUsers.username//join dari user ambil name
                                })
                            }
                            if(item.kode=='ONGKIR'){
                                if(item.d_k=='d'){
                                    tempDebet=dataPembelian.dataValues.ongkos_kirim?dataPembelian.dataValues.ongkos_kirim>0?dataPembelian.dataValues.ongkos_kirim:0:0;
                                    tempKredit=dataPembelian.dataValues.ongkos_kirim?dataPembelian.dataValues.ongkos_kirim<0?dataPembelian.dataValues.ongkos_kirim:0:0;
                                }else{
                                    tempDebet=dataPembelian.dataValues.ongkos_kirim?dataPembelian.dataValues.ongkos_kirim<0?dataPembelian.dataValues.ongkos_kirim:0:0;
                                    tempKredit=dataPembelian.dataValues.ongkos_kirim?dataPembelian.dataValues.ongkos_kirim>0?dataPembelian.dataValues.ongkos_kirim:0:0;
                                }
                                body.sub_transaksi.push({
                                    cc:dataPembelian.dataValues.ms_gudang_id,
                                    coa_code:item.setting_1,
                                    amount_debet:tempDebet.toFixed(2),
                                    amount_kredit:tempKredit.toFixed(2),
                                    remark:'Pembelian Obat',
                                    identitas_transaksi:'',
                                    type_penerima_id:'SP',
                                    penerima_id:dataPembelian.dataValues.ms_suplier_id,
                                    penerima_name:dataPembelian.dataValues.ms_supplier.dataValues.nama_supplier,//join dari suplier name
                                    sub_type_penerima_id:'KRY',
                                    sub_penerima_id:req.dataUsers.id,
                                    sub_penerima_name:req.dataUsers.username//join dari user ambil name
                                })
                            }
                            if(item.kode=='BLL'){
                                console.log('ini BLL');
                                if(item.d_k=='d'){
                                    tempDebet=dataPembelian.dataValues.biaya_lain?dataPembelian.dataValues.biaya_lain>0?dataPembelian.dataValues.biaya_lain:0:0;
                                    tempKredit=dataPembelian.dataValues.biaya_lain?dataPembelian.dataValues.biaya_lain<0?dataPembelian.dataValues.biaya_lain:0:0;
                                }else{
                                    tempDebet=dataPembelian.dataValues.biaya_lain?dataPembelian.dataValues.biaya_lain<0?dataPembelian.dataValues.biaya_lain:0:0;
                                    tempKredit=dataPembelian.dataValues.biaya_lain?dataPembelian.dataValues.biaya_lain>0?dataPembelian.dataValues.biaya_lain:0:0;
                                }
                                body.sub_transaksi.push({
                                    cc:dataPembelian.dataValues.ms_gudang_id,
                                    coa_code:item.setting_1,
                                    amount_debet:tempDebet.toFixed(2),
                                    amount_kredit:tempKredit.toFixed(2),
                                    remark:'Pembelian Obat',
                                    identitas_transaksi:'',
                                    type_penerima_id:'SP',
                                    penerima_id:dataPembelian.dataValues.ms_suplier_id,
                                    penerima_name:dataPembelian.dataValues.ms_supplier.dataValues.nama_supplier,//join dari suplier name
                                    sub_type_penerima_id:'KRY',
                                    sub_penerima_id:req.dataUsers.id,
                                    sub_penerima_name:req.dataUsers.username//join dari user ambil name
                                })
                            }
                            if(item.kode=='HUTANG'){
                                let nominal=(dataPembelian.dataValues.total_pembelian+(dataPembelian.dataValues.pajak||0)+(dataPembelian.dataValues.ongkos_kirim||0)+(dataPembelian.dataValues.biaya_lain||0)-(dataPembelian.dataValues.potongan||0))
                                if(item.d_k=='d'){
                                    tempDebet=nominal>0?nominal:0;
                                    tempKredit=nominal<0?nominal:0;
                                }else{
                                    tempDebet=nominal<0?nominal:0;
                                    tempKredit=nominal>0?nominal:0;
                                }
                                body.sub_transaksi.push({
                                    cc:dataPembelian.dataValues.ms_gudang_id,
                                    coa_code:item.setting_1,
                                    amount_debet:tempDebet.toFixed(2),
                                    amount_kredit:tempKredit.toFixed(2),
                                    remark:'Pembelian Obat',
                                    identitas_transaksi:'',
                                    type_penerima_id:'SP',
                                    penerima_id:dataPembelian.dataValues.ms_suplier_id,
                                    penerima_name:dataPembelian.dataValues.ms_supplier.dataValues.nama_supplier,//join dari suplier name
                                    sub_type_penerima_id:'KRY',
                                    sub_penerima_id:req.dataUsers.id,
                                    sub_penerima_name:req.dataUsers.username//join dari user ambil name
                                })
                            }
                            if(item.kode=='DISKON'){
                                if(item.d_k=='d'){
                                    tempDebet=dataPembelian.dataValues.potongan?dataPembelian.dataValues.potongan>0?dataPembelian.dataValues.potongan:0:0;
                                    tempKredit=dataPembelian.dataValues.potongan?dataPembelian.dataValues.potongan<0?dataPembelian.dataValues.potongan:0:0;
                                }else{
                                    tempDebet=dataPembelian.dataValues.potongan?dataPembelian.dataValues.potongan<0?dataPembelian.dataValues.potongan:0:0;
                                    tempKredit=dataPembelian.dataValues.potongan?dataPembelian.dataValues.potongan>0?dataPembelian.dataValues.potongan:0:0;
                                }
                                body.sub_transaksi.push({
                                    cc:dataPembelian.dataValues.ms_gudang_id,
                                    coa_code:item.setting_1,
                                    amount_debet:tempDebet.toFixed(2),
                                    amount_kredit:tempKredit.toFixed(2),
                                    remark:'Pembelian Obat',
                                    identitas_transaksi:'',
                                    type_penerima_id:'SP',
                                    penerima_id:dataPembelian.dataValues.ms_suplier_id,
                                    penerima_name:dataPembelian.dataValues.ms_supplier.dataValues.nama_supplier,//join dari suplier name
                                    sub_type_penerima_id:'KRY',
                                    sub_penerima_id:req.dataUsers.id,
                                    sub_penerima_name:req.dataUsers.username//join dari user ambil name
                                })
                            }
                        }
                        const options={body,returnNull:true}
                        emitter.emitEvent('createJurnal',options);
                    }                  
                    
                
            await stock.bulkCreate(items,{transaction:t});
            await historyInventory.bulkCreate(itemsInventory,{transaction:t});
            await pembelian.update({status_pembelian:3,ubah_harga_pokok,sisa_pembayaran:dataPembelian.dataValues.total_pembelian},{where:{id}},{transaction:t})
            await t.commit()
            res.status(200).json({ status: 200, message: "sukses" });
        } catch (error) {
            await t.rollback()
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error });
        }
    }
    static async getWithSub(req, res){
        const {id} = req.body;
        try {
            if(id){
                let data = await pembelian.findAll({where:{id}});
                const dataSubPo = await subPO.findAll({where:{pembelian_id:id},include:[msBarang]});
                const dataSubPembelian = await subPembelian.findAll({where:{ms_pembelian_id:id},include:[msBarang,satuanBarang]});
                data.dataValues.subPo = dataSubPo;
                data.dataValues.subPembelian= dataSubPembelian;
                return res.status(200).json({ status: 200, message: "sukses", data })
            }
            let data = await pembelian.findAll();
            await Promise.all(data.map(async (item,index) => {
                const dataSubPo = await subPO.findAll({where:{pembelian_id:item.id},include:[msBarang]});
                const dataSubPembelian = await subPembelian.findAll({where:{ms_pembelian_id:item.id},include:[msBarang,satuanBarang]});
                data[index].dataValues.subPo = dataSubPo;
                data[index].dataValues.subPembelian = dataSubPembelian;
            }))
            return res.status(200).json({ status: 200, message: "sukses", data })
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
    static async changeStatus(req, res){
        const {id,status_pembelian} = req.body;
        if(status_pembelian==3){
            return res.status(201).json({ status: 204, message: "Not Allowed" });
        }
        pembelian.update({ status_pembelian}, { where: { id } }).then(data => {
            return res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            return res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }
    static async havePo(req, res){
        const {halaman,jumlah,kode_po,tgl_awal,tgl_akhir,ms_gudang_id, ms_suplier_id, status_pembelian}=req.body;
        let paramQ=kode_po?` and p.kode_po = ${kode_po}`:'';
        paramQ += tgl_awal?` and p.tgl_po >= '${tgl_awal}' `:'';
        paramQ += tgl_akhir?` and p.tgl_po <= '${tgl_akhir}' `:'';
        paramQ += ms_gudang_id?` and p.ms_gudang_id = '${ms_gudang_id}' `:'';
        paramQ += ms_suplier_id?` and p.ms_suplier_id = '${ms_suplier_id}' `:'';
        paramQ += status_pembelian?` and p.status_pembelian = ${status_pembelian} `:'';
        try {
            let offset = (+halaman - 1) * jumlah;
            let data = await sq.query(`select *, p.id as "pembelian_id" from pembelian p
            join ms_supplier ms on ms.id = p.ms_suplier_id 
            join ms_gudang mg on mg.id = p.ms_gudang_id
            join users u on u.id = p.user_id 
            where p."deletedAt" isnull and ms."deletedAt" isnull and mg."deletedAt" isnull and (select count(sp.id) from sub_po sp where sp."deletedAt" isnull and sp.pembelian_id=p.id)>0${paramQ} order by p."createdAt" desc limit ${jumlah} offset ${offset}`, s);
            let jml = await sq.query(`select count(*) as total from pembelian p
            join ms_supplier ms on ms.id = p.ms_suplier_id 
            join ms_gudang mg on mg.id = p.ms_gudang_id
            join users u on u.id = p.user_id 
            where p."deletedAt" isnull and ms."deletedAt" isnull and mg."deletedAt" isnull and (select count(sp.id) from sub_po sp where sp."deletedAt" isnull and sp.pembelian_id=p.id)>0${paramQ}`, s)
            res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].total, jumlah, halaman })
        } catch (err) {
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
    static async haveSub(req, res){
        const {halaman,jumlah,no_faktur,tgl_awal,tgl_akhir,ms_gudang_id,ms_suplier_id}=req.body;
        let paramQ=no_faktur?` and p.no_faktur LIKE '%${no_faktur}%'`:'';
        paramQ += tgl_awal?` and p.tgl_faktur >= '${tgl_awal}' `:'';
        paramQ += tgl_akhir?` and p.tgl_faktur <= '${tgl_akhir}' `:'';
        paramQ += ms_gudang_id?` and p.ms_gudang_id = '${ms_gudang_id}' `:'';
        paramQ += ms_suplier_id?` and p.ms_suplier_id = '${ms_suplier_id}' `:'';
        try {
            let offset = (+halaman - 1) * jumlah;
            let data = await sq.query(`select p.id as "pembelian_id", * from pembelian p
            join ms_supplier ms on ms.id = p.ms_suplier_id 
            join ms_gudang mg on mg.id = p.ms_gudang_id
            join users u on u.id = p.user_id 
            where p."deletedAt" isnull and ms."deletedAt" isnull and mg."deletedAt" isnull and (select count(sp.id) from sub_pembelian sp where sp."deletedAt" isnull and sp.ms_pembelian_id=p.id)>0${paramQ} order by p."createdAt" desc limit ${jumlah} offset ${offset}`, s);
            let jml = await sq.query(`select count(*) as total from pembelian p
            join ms_supplier ms on ms.id = p.ms_suplier_id 
            join ms_gudang mg on mg.id = p.ms_gudang_id
            join users u on u.id = p.user_id 
            where p."deletedAt" isnull and ms."deletedAt" isnull and mg."deletedAt" isnull and (select count(sp.id) from sub_pembelian sp where sp."deletedAt" isnull and sp.ms_pembelian_id=p.id)>0${paramQ}`, s)
            res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].total, jumlah, halaman })
        } catch (err) {
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async listClosedPembelian(req, res){
        try {
            let data = await sq.query(`select p.id as "pembelian_id", p.no_faktur ,p.total_pembelian ,p.sisa_pembayaran 
            from pembelian p 
            join ms_supplier ms on ms.id = p.ms_suplier_id 
            join ms_gudang mg on mg.id = p.ms_gudang_id 
            where p."deletedAt" isnull and p.status_pembelian = 3 and p.sisa_pembayaran <> 0 
            order by p."createdAt" desc`, s);
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (err) {
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
    static async hapus(req, res){
        const {id}=req.body;
        const t = await sq.transaction()
        try {
            const dataPembelian = await pembelian.findOne({ where: {id} });
            const checkPembayaranPembelian = await pembayaranPembelian.findAll({where:{pembelian_id:id}});
            if(checkPembayaranPembelian.length>0){
                return res.status(201).json({ status: 204, message: "Not Allowed, its paid" });
            }
            const dataSubPembelian = await subPembelian.findAll({where:{ms_pembelian_id:id}})
            
            let history_inventory=[];
            for(let item of dataSubPembelian){
                const checkStockPerBatch = await stock.sum('qty',{where:{ms_gudang_id:dataPembelian.dataValues.ms_gudang_id,ms_barang_id:item.ms_barang_id,kode_batch:item.kode_batch}});
                if(item.total_qty_satuan_simpan>checkStockPerBatch){
                    return res.status(201).json({ status: 204, message: "Not Allowed, not enough stock" });
                }
                const sumStockAll = await stock.sum('qty',{where:{ms_gudang_id:dataPembelian.dataValues.ms_gudang_id,ms_barang_id:item.ms_barang_id}});
                const retrieveHPP = await createHPP(item.total_harga_beli, item.total_qty_satuan_simpan, item.ms_barang_id, item.id);
                const checkStockAsli = await stock.findOne({where:{pembelian_id:id,kode_batch:item.kode_batch,ms_barang_id:item.ms_barang_id},raw: true});
                let checkStockLain = await stock.findAll({where:{pembelian_id:{ [Op.not]: id },kode_batch:item.kode_batch,ms_barang_id:item.ms_barang_id,ms_gudang_id:dataPembelian.dataValues.ms_gudang_id},raw: true});
                let stockUpdate = checkStockAsli.qty-item.total_qty_satuan_simpan;
                let tempCount=0;
                
                const harga_pokok = dataPembelian.dataValues.ubah_harga_pokok?retrieveHPP.harga_pokok_akhir:retrieveHPP.harga_pokok_awal;
                if(stockUpdate<0){
                    const mergeStock=[checkStockAsli,...checkStockLain];
                    tempCount= item.total_qty_satuan_simpan;
                    for(let i=0;i<mergeStock.length;i++){
                        //console.log(mergeStock[i].id, mergeStock[i].qty, '-',tempCount)
                        tempCount=mergeStock[i].qty-tempCount; // -10
                        if(tempCount>0){
                            if(mergeStock[i].qty!=tempCount){
                                history_inventory.push({
                                    id:uuid_v4(),
                                    tipe_transaksi:'hapus pembelian',
                                    transaksi_id:id,
                                    ms_gudang_id:mergeStock[i].ms_gudang_id,
                                    stock_id:mergeStock[i].id,
                                    debit_kredit:'k',
                                    stok_awal_per_gudang:sumStockAll.toFixed(2),
                                    stok_akhir_per_gudang:(sumStockAll-item.total_qty_satuan_simpan).toFixed(2),
                                    stok_awal_per_batch:checkStockPerBatch.toFixed(2),
                                    stok_akhir_per_batch:(checkStockPerBatch-item.total_qty_satuan_simpan).toFixed(2),
                                    qty:(mergeStock[i].qty-tempCount).toFixed(2),
                                    harga_pokok_awal:retrieveHPP.harga_pokok_awal.toFixed(2),
                                    harga_pokok_akhir:harga_pokok.toFixed(2),
                                    tgl_transaksi:new Date(),
                                    ms_barang_id:item.ms_barang_id
                                })
                            }
                            mergeStock[i].qty=tempCount
                            tempCount=0;        
                        }else if(tempCount<0){
                            history_inventory.push({
                                id:uuid_v4(),
                                tipe_transaksi:'hapus pembelian',
                                transaksi_id:id,
                                ms_gudang_id:mergeStock[i].ms_gudang_id,
                                stock_id:mergeStock[i].id,
                                debit_kredit:'k',
                                stok_awal_per_gudang:sumStockAll.toFixed(2),
                                stok_akhir_per_gudang:(sumStockAll-item.total_qty_satuan_simpan).toFixed(2),
                                stok_awal_per_batch:checkStockPerBatch.toFixed(2),
                                stok_akhir_per_batch:(checkStockPerBatch-item.total_qty_satuan_simpan).toFixed(2),
                                qty:mergeStock[i].qty.toFixed(2),
                                harga_pokok_awal:retrieveHPP.harga_pokok_awal.toFixed(2),
                                harga_pokok_akhir:harga_pokok.toFixed(2),
                                tgl_transaksi:new Date(),
                                ms_barang_id:item.ms_barang_id
                            })
                            mergeStock[i].qty=0;
                            tempCount=Math.abs(tempCount);
                        }else{
                            history_inventory.push({
                                id:uuid_v4(),
                                tipe_transaksi:'hapus pembelian',
                                transaksi_id:id,
                                ms_gudang_id:mergeStock[i].ms_gudang_id,
                                stock_id:mergeStock[i].id,
                                debit_kredit:'k',
                                stok_awal_per_gudang:sumStockAll.toFixed(2),
                                stok_akhir_per_gudang:(sumStockAll-item.total_qty_satuan_simpan).toFixed(2),
                                stok_awal_per_batch:checkStockPerBatch.toFixed(2),
                                stok_akhir_per_batch:(checkStockPerBatch-item.total_qty_satuan_simpan).toFixed(2),
                                qty:mergeStock[i].qty.toFixed(2),
                                harga_pokok_awal:retrieveHPP.harga_pokok_awal.toFixed(2),
                                harga_pokok_akhir:harga_pokok.toFixed(2),
                                tgl_transaksi:new Date(),
                                ms_barang_id:item.ms_barang_id
                            })
                            mergeStock[i].qty=tempCount;
                        }
                        
                    }
                    await stock.bulkCreate(mergeStock, {
                        updateOnDuplicate: ["qty"]
                    },{transaction:t} )
                    //console.log(mergeStock);
                }else{
                    history_inventory.push({
                        id:uuid_v4(),
                        tipe_transaksi:'hapus pembelian',
                        transaksi_id:id,
                        ms_gudang_id:checkStockAsli.ms_gudang_id,
                        stock_id:checkStockAsli.id,
                        debit_kredit:'k',
                        stok_awal_per_gudang:sumStockAll.toFixed(2),
                        stok_akhir_per_gudang:(sumStockAll-item.total_qty_satuan_simpan).toFixed(2),
                        stok_awal_per_batch:checkStockPerBatch.toFixed(2),
                        stok_akhir_per_batch:(checkStockPerBatch-item.total_qty_satuan_simpan).toFixed(2),
                        qty:item.total_qty_satuan_simpan.toFixed(2),
                        harga_pokok_awal:retrieveHPP.harga_pokok_awal.toFixed(2),
                        harga_pokok_akhir:harga_pokok.toFixed(2),
                        tgl_transaksi:new Date(),
                        ms_barang_id:item.ms_barang_id
                    })
                    const updateStock = await stock.update({qty:stockUpdate},{where:{id:checkStockAsli.id}},{transaction:t});
                }
                await subPembelian.destroy({ where: { id:item.id } },{transaction:t})
                const hargaTerakhir =  await sq.query(`select sp.harga_per_satuan_simpan from sub_pembelian sp 
                join pembelian p on sp.ms_pembelian_id=p.id where sp."deletedAt" isnull and p."deletedAt" isnull and sp.ms_barang_id='${item.ms_barang_id}' order by p.tgl_faktur desc limit 1`, s);
                const updatedBarang = {
                    harga_pokok:harga_pokok.toFixed(2),
                    harga_tertinggi:retrieveHPP.harga_tertinggi.toFixed(2),
                    harga_beli_terahir:hargaTerakhir[0].harga_per_satuan_simpan.toFixed(2)
                }
                //console.log(updatedBarang);   
                await msBarang.update(updatedBarang,{where:{id:item.ms_barang_id}},{transaction:t})
                
            }
            //console.log(history_inventory);
            await historyInventory.bulkCreate(history_inventory,{transaction:t} )
            await t.commit()
           return res.status(200).json({ status: 200, message: "sukses", data:'jmbt' })
        } catch (err) {
            await t.rollback()
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
}

module.exports = Controller