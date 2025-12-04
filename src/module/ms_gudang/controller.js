const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const msGudang = require("./model");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };

async function getChild(id){
    let params={
        ms_gudang_utama_id:id,
        id:{ [Op.not]: id }
    }
    
       return await msGudang.findAll({ where: params })
}
class Controller {

    static register(req, res) {
        let { ms_gudang_utama_id, nama_gudang,tipe_gudang} = req.body
        const id = uuid_v4();
        let is_utama=0;
        if(ms_gudang_utama_id){
            is_utama=1;
        }else{
            ms_gudang_utama_id=id;
        }
        msGudang.findAll({ where: { nama_gudang: { [Op.iLike]: nama_gudang } } }).then(data => {
            if (data.length > 0) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                msGudang.create({ id, ms_gudang_utama_id,nama_gudang,tipe_gudang,is_utama }).then(data => {
                    res.status(200).json({ status: 200, message: "sukses", data });
                }).catch(err => {
                    
                    res.status(500).json({ status: 500, message: "gagal", data: err });
                })
            }
        }).catch(err => {
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static update(req, res) {
        const { id, ms_gudang_utama_id, nama_gudang, tipe_gudang } = req.body
        let is_utama;
        if(!ms_gudang_utama_id || ms_gudang_utama_id==id){
            is_utama=0;
        }else{
            is_utama=1;
        }
        msGudang.update({ ms_gudang_utama_id, nama_gudang, tipe_gudang, is_utama}, { where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static delete(req, res) {
        const { id } = req.body
        msGudang.findAll({ where: { ms_gudang_utama_id: id } }).then(data => {
            if (data.length > 1) {
                const namaGudang = data.map((item) => {
                    if(item.dataValues.id!=id){
                        return item.dataValues.nama_gudang;
                    }
                  });
                res.status(201).json({ status: 204, message: `Tidak bisa di hapus, have a child ${namaGudang}` });
            } else {
                msGudang.destroy({ where: { id } }).then(data => {
                    res.status(200).json({ status: 200, message: "sukses" });
                }).catch(err => {
                    res.status(500).json({ status: 500, message: "gagal", data: err });
                })
            }
        }).catch(err => {
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        const{halaman,jumlah,nama_gudang,ms_gudang_utama_id,tipe_gudang,is_utama,nama_gudang_utama} = req.body

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if(nama_gudang){
                isi+= ` and mg.nama_gudang ilike '%${nama_gudang}%'`
            }
            if(ms_gudang_utama_id){
                isi+= ` and mg.ms_gudang_utama_id = '${ms_gudang_utama_id}'`
            }
            if(tipe_gudang){
                isi+= ` and mg.tipe_gudang ilike '${tipe_gudang}'`
            }
            if(is_utama){
                isi+= ` and mg.is_utama = '${is_utama}'`
            }
            if(nama_gudang_utama){
                isi+= ` and mg2.nama_gudang ilike '${nama_gudang_utama}'`
            }

            let data = await sq.query(`select mg.*,mg2.nama_gudang as nama_gudang_utama from ms_gudang mg join ms_gudang mg2 on mg2.id = mg.ms_gudang_utama_id where mg."deletedAt" isnull${isi} order by mg."createdAt" desc ${pagination}`,s);
            let jml = await sq.query(`select count(*) from ms_gudang mg join ms_gudang mg2 on mg2.id = mg.ms_gudang_utama_id where mg."deletedAt" isnull${isi}`,s);

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman });
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static detailsById(req, res) {
        const { id } = req.body

        msGudang.findAll({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses", data });
        }).catch(err => {
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }
    
     static async listWithParam(req, res) {
        const { id_parent,is_utama } = req.body
        let params={};
        if(id_parent){
            params.id=id;
        }
        if(is_utama){
            params.is_utama=is_utama;
        }
          await msGudang.findAll({ where: params }).then( async data => {
            for (let i = 0; i < data.length; i++) {              
                data[i].dataValues.child=await getChild(data[i].id);        
            }
            res.status(200).json({ status: 200, message: "sukses", data });
        }).catch(err => {
            console.log(err)
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
        
    }
    
}
module.exports = Controller;