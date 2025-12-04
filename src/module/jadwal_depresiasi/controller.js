const jadwalDepresiasi = require('./model');
const depresiasiModel = require('../depresiasi/model');
const fixassetModel = require('../fixasset/model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT }
const moment = require('moment');

class Controller {

    static async cronJob(done) {
        try {
            // await sq.query(`delete from jadwal_depresiasi`); // For Development Only
            // await sq.query(`delete from depresiasi`); // For Development Only
            
            let depresiasi_selesai = 0;
            let depresiasi_gagal = 0;

            let date = moment().format('YYYY-MM-DD HH:mm');
            let fixasset = await sq.query(`select a.id, a.nilai_asset, a.nilai_penyusutan, a.nilai_sisaditaksir, a.total_penyusutan, a.total_cicilan, type_fiscal_id from fixasset a where a.nilai_sisaditaksir > 0 and a."deletedAt" is null`, s);
            
            /** Validation last month */
            let endDate = moment().endOf('month');
            if(moment() !== endDate) {
                throw "Wait for end month";
            }

            /** Validation Existing Jadwal Depresiasi Month */
            let check_jadwal_depresiasi = await sq.query(`
                select a.id, a.date 
                from jadwal_depresiasi a 
                where to_char(a.date, 'YYYY-MM') = '${moment().format('YYYY-MM')}'
            `, s);
            if(check_jadwal_depresiasi.length) {
                throw "Jadwal Depresiasi has been called for this month";
            }

            let data_jadwal_depresiasi = {
                id: uuid_v4(),
                date: date,
                jumlah_asset: fixasset.length,
                depresiasi_selesai: depresiasi_selesai,
                depresiasi_gagal: depresiasi_gagal,
                is_proses: 1,
            };

            let jadwal_depresiasi = await jadwalDepresiasi.create(data_jadwal_depresiasi);

            for (const fa of fixasset) {
                let data_depresiasi = {
                    id: uuid_v4(),
                    jadwal_depresiasi_id: jadwal_depresiasi.id,
                    fixasset_id: fa.id,
                    date: date,
                    idgl: '-',
                    jumlah: fa.nilai_penyusutan > fa.nilai_sisaditaksir ? fa.nilai_sisaditaksir : fa.nilai_penyusutan
                };

                let depresiasi = await depresiasiModel.create(data_depresiasi);
                
                let update_data_fixasset = {
                    nilai_sisaditaksir: fa.nilai_sisaditaksir - data_depresiasi.jumlah,
                    total_penyusutan: fa.total_penyusutan + data_depresiasi.jumlah
                };

                let update_fixasset = await fixassetModel.update(update_data_fixasset, { where: { id: fa.id } });

                if(depresiasi && update_fixasset) {
                    depresiasi_selesai++;
                } else {
                    depresiasi_gagal++;
                }
            }

            await jadwalDepresiasi.update({
                depresiasi_selesai,
                depresiasi_gagal,
                is_proses: 0
            }, { where: { id: jadwal_depresiasi.id } });
            
            // res.status(200).json({ status: 200, message: "sukses", data: {date, jadwal_depresiasi} })
        } catch (error) {
            // throw error
            console.log(error)
            // res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async list(req, res) {
        try {
            let tgl = moment().format('YYYY-MM-DD')
            let data = await sq.query(`
                select 
                    a.*,
                    (
                        select
                            jsonb_agg(
                                json_build_object(
                                    'fixasset_nama', c."name",
                                    'fixasset_nilai_sisaditaksir', c.nilai_sisaditaksir,
                                    'jumlah', b.jumlah
                                ) 
                            ) 
                        from depresiasi b
                        left join fixasset c on c.id = b.fixasset_id 
                        where b.jadwal_depresiasi_id = a.id
                    ) as depresiasi
                from jadwal_depresiasi a 
            `, s)
            
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

}

module.exports = Controller