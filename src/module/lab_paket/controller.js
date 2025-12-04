const labPaket = require('./model');
const msGudang = require('../ms_gudang/model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT }

class Controller {
    
        static register(req, res) {
            labPaket.create({ id: uuid_v4(), ...req.body }).then(hasil => {
                res.status(200).json({ status: 200, message: "sukses", data: hasil })
            }).catch(error => {
                console.log(error);
                res.status(500).json({ status: 500, message: "gagal", data: error })
            })
        }
    
        static update(req, res) {
            const data = req.body
            delete data.createdAt
            delete data.deletedAt
            delete data.updatedAt
            labPaket.update({ ...req.body}, { where: { id:req.body.id } }).then(hasil => {
                res.status(200).json({ status: 200, message: "sukses" })
            }).catch(error => {
                console.log(error);
                res.status(500).json({ status: 500, message: "gagal", data: error })
            })
        }
    
        static async list(req, res) {
            const { nama_penunjang, search, halaman, jumlah } = req.body
            let offset=''
            let pagination=''
    
            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }
            
            try {
                let cond = ''
                if(nama_penunjang) {
                    cond += `
                        AND lp.id IN (
                            SELECT
                                lpl.lab_paket_id 
                            FROM
                                lab_paket_list lpl
                            LEFT JOIN penunjang p ON
                                p.id = lpl.penunjang_id 
                            WHERE
                                p.nama_penunjang ilike '%${nama_penunjang}%'
                        )
                    `
                }
                if(search) {
                    cond += `
                      and lp.nama_lab_paket ilike '%${search}%'
                    `
                }

                const q = `
                    select
                        lp.id as id_lab_paket,
                        *,
                        (
                            select jsonb_agg(jsonb_build_object(
                                'lab_paket_list_id', A.id,
                                'nama_penunjang', B.nama_penunjang
                            ))
                            from lab_paket_list A
                            join penunjang B on B.id = A.penunjang_id 
                            where A."deletedAt" isnull and A.lab_paket_id = lp.id 
                            
                        ) as penunjang
                    from
                        lab_paket lp
                    left join ms_gudang mg on
                        mg.id = lp.gudang_id
                    where
                        lp."deletedAt" isnull
                        and mg."deletedAt" isnull
                        ${cond}
                    ${pagination}
                `
                // console.log(q)
                let data = await sq.query(q, s)
                let jml = await sq.query(`
                    select
                        count(*)
                    from
                        lab_paket lp
                    left join ms_gudang mg on
                        mg.id = lp.gudang_id
                    where
                        lp."deletedAt" isnull
                        and mg."deletedAt" isnull
                        ${cond}
                `, s)
                // console.log(data);
                res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].count, jumlah, halaman })
            } catch (error) {
                console.log(error);
                res.status(500).json({ status: 500, message: "gagal", data: error })
            }
    
        }
    
        static async detailsById(req, res) {
            const { id } = req.body
            try {
                let data = await sq.query(`select lp.id as id_lab_paket, * from lab_paket lp
                left join ms_gudang mg on mg.id=lp.gudang_id
                where lp."deletedAt" isnull and mg."deletedAt" isnull and lp.id = '${id}'`, s)
                res.status(200).json({ status: 200, message: "sukses", data })
            }catch (error) {
                res.status(500).json({ status: 500, message: "gagal", data: error })   
            }
        }
        static delete(req, res) {
            const { id } = req.body
            labPaket.destroy({ where: { id } }).then(hasil => {
                res.status(200).json({ status: 200, message: "sukses" })
            }).catch(error => {
                console.log(error);
                res.status(500).json({ status: 500, message: "gagal", data: error })
            })
        }
        static async listWithParam(req, res) {
            const {gudang_id} = req.body;
            let params = {};
            if(gudang_id) params.gudang_id = gudang_id;
            labPaket.findAll({where: params}).then(hasil => {
                res.status(200).json({ status: 200, message: "sukses", data: hasil })
            }
            ).catch(error => {
                console.log(error);
                res.status(500).json({ status: 500, message: "gagal", data: error })   
            })
        }
}

module.exports = Controller