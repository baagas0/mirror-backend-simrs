const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const msCoa = require("./model");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };

async function createBracket(arr, parent) {
    var out = []
    for(var i in arr) {
        if(arr[i].parent_code == parent) {
            var child= await createBracket(arr, arr[i].code)

            if(child.length) {
                arr[i].child = child
            }
            out.push(arr[i])
        }
    }
    return out
}

class Controller {

    static async register(req, res) {
        const { code, parent_code, d_k, name, remark, status, level, saldo_awal } = req.body

        msCoa.findAll({ where: { code: { [Op.iLike]: code } } }).then( async data => {
            if (data.length) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                await msCoa.create({ id: uuid_v4(), code, parent_code, d_k, name, remark, status, level, saldo_awal }).then(data2 => {
                    res.status(200).json({ status: 200, message: "sukses", data: data2 });
                })
            }
        }).catch(err => {
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static update(req, res) {
        const { id, code, parent_code, d_k, name, remark, status, level, saldo_awal } = req.body
        msCoa.findAll({ where: { [Op.and]:{ code: { [Op.iLike]: code },id:{[Op.not]:id} }}}).then(data => {
            if (data.length > 0) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                msCoa.update({ code, parent_code, d_k, name, remark, status, level, saldo_awal  }, { where: { id } }).then(dataa => {
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

        msCoa.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        const{halaman,jumlah,code,parent_code,d_k,name,remark,status,level,saldo_awal} = req.body

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if(code){
                isi+= ` and mc.code = '${code}'`
            }
            if(parent_code){
                isi+= ` and mc.parent_code = '${parent_code}'`
            }
            if(d_k){
                isi+= ` and mc.d_k ilike '${d_k}'`
            }
            if(name){
                isi+= ` and mc."name" ilike '%${keterangan_kelas_kamar}%'`
            }
            if(remark){
                isi+= ` and mc.remark ilike '%${remark}%'`
            }
            if(status){
                isi+= ` and mc.status = ${status}`
            }
            if(level){
                isi+= ` and mc."level" = ${level}`
            }
            if(saldo_awal){
                isi+= ` and mc.saldo_awal = '${saldo_awal}'`
            }


            let data = await sq.query(`select * from ms_coa mc where mc."deletedAt" isnull${isi} order by mc.code ${pagination}`,s);
            let jml = await sq.query(`select count(*) from ms_coa mc where mc."deletedAt" isnull${isi}`,s)

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static detailsById(req, res) {
        const { id } = req.body

        msCoa.findAll({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses", data });
        }).catch(err => {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async listBrackets(req, res){
        try {
            let datane = await msCoa.findAll({raw:true})
            let data = await createBracket(datane) 
            return res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            return res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async listCoaByParentLevel(req, res){
        const {level,parent_code} = req.body;

        try {
            let isi = ''
            if(level){
                isi+=` and mc."level" = ${level}`
            }
            if(parent_code){
                isi+=` and mc.parent_code = '${parent_code}'`
            }

            let data = await sq.query(`select * from ms_coa mc where mc."deletedAt" isnull${isi} order by mc.code `,s)
            
            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
    
}
module.exports = Controller;