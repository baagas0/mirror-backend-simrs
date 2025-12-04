const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const msTipeGl = require("./model");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };


class Controller {

    static async register(req, res) {
        const { code, name, remark, sequence } = req.body

        msTipeGl.findAll({ where: { code: { [Op.iLike]: code } } }).then( async data => {
            if (data.length) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                await msTipeGl.create({ id: uuid_v4(), code, name, remark, sequence }).then(data2 => {
                    res.status(200).json({ status: 200, message: "sukses", data: data2 });
                })
            }
        }).catch(err => {
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static update(req, res) {
        const { id, name, remark, sequence } = req.body
        
        msTipeGl.update({ name, remark, sequence  }, { where: { id } }).then(dataa => {
            console.log(dataa);
            res.status(200).json({ status: 200, message: "sukses" });
                
            
        }).catch(err => {
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
        
    }

    static delete(req, res) {
        const { id } = req.body

        msTipeGl.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        const{halaman,jumlah,code,name,remark,sequence} = req.body

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if(code){
                isi+= ` and mtg.code ilike '%${code}%'`
            }
            if(name){
                isi+= ` and mtg."name" ilike '%${name}%'`
            }
            if(remark){
                isi+= ` and mtg.remark ilike '%${remark}%'`
            }
            if(sequence){
                isi+= ` and mtg."sequence" = '${sequence}'`
            }


            let data = await sq.query(`select * from ms_tipe_gl mtg where mtg."deletedAt" isnull${isi} order by mtg."createdAt" desc ${pagination}`,s);
            let jml = await sq.query(`select count(*) from ms_tipe_gl mtg where mtg."deletedAt" isnull${isi}`,s)

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static detailsById(req, res) {
        const { id } = req.body

        msTipeGl.findAll({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses", data });
        }).catch(err => {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static listParam(req, res) {
        const {sequence}=req.body;
        let q={where:{}};
        if(sequence){
            q=sequence==0?{where:{sequence:'0'}}:{where:{sequence:{ [Op.not]: '0' }}}
        }
        msTipeGl.findAll(q,{ order: [['createdAt', 'DESC']] }).then(data => {
            res.status(200).json({ status: 200, message: "sukses", data });
        }).catch(err => {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }
}
module.exports = Controller;