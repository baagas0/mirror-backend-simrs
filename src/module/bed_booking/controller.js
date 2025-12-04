const bedBooking = require('./model');
const {sq} = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');


const s = {type:QueryTypes.SELECT}


class Controller{

    static register(req,res){
        const{keterangan_bed_booking,registrasi_id,ms_bed_id}=req.body
        
        bedBooking.create({id:uuid_v4(),keterangan_bed_booking,registrasi_id,ms_bed_id}).then(data =>{
            res.status(200).json({ status: 200, message: "sukses",data})
        }).catch(error=>{
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error})
        })
    }

    static update(req,res){
        const{id,keterangan_bed_booking,registrasi_id,ms_bed_id}= req.body

        bedBooking.update({keterangan_bed_booking,registrasi_id,ms_bed_id},{where:{id}
        }).then(data =>{
            res.status(200).json({ status: 200, message: "sukses"})
        }).catch(error=>{
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error})
        })
    }

    static async list(req,res){
        const{halaman,jumlah,keterangan_bed_booking,registrasi_id,ms_bed_id} = req.body
       
        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if(keterangan_bed_booking){
                isi+= ` and bb.keterangan_bed_booking ilike '%${keterangan_bed_booking}%'`
            }
            if(registrasi_id){
                isi+= ` and bb.registrasi_id = '${registrasi_id}'`
            }
            if(ms_bed_id){
                isi+= ` and bb.ms_bed_id = '${ms_bed_id}'`
            }

            let data =await sq.query(`select bb.id as bed_booking_id, * from bed_booking bb 
            join registrasi r on r.id = bb.registrasi_id 
            join ms_bed mb on mb.id = bb.ms_bed_id 
            join pasien p on p.id = r.pasien_id 
            where bb."deletedAt" isnull${isi} order by bb."createdAt" desc ${pagination}`,s)
            let jml = await sq.query(`select count(*) from bed_booking bb 
            join registrasi r on r.id = bb.registrasi_id 
            join ms_bed mb on mb.id = bb.ms_bed_id 
            join pasien p on p.id = r.pasien_id 
            where bb."deletedAt" isnull${isi}`,s)

             res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error})
        }
    }


    static async detailsById(req,res){  
        const {id}=req.body
        try {
            let data =await sq.query(`select bb.id as bed_booking_id,* from bed_booking bb join registrasi r on r.id = bb.registrasi_id join ms_bed mb on mb.id = bb.ms_bed_id where bb."deletedAt" isnull and bb.id = '${id}'`,s);
            
            res.status(200).json({ status: 200, message: "sukses",data})
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error})
        }

    }

    static delete(req,res){
        const{id}=req.body

        bedBooking.destroy({where:{id}}).then(data =>{
            res.status(200).json({ status: 200, message: "sukses"})
        }).catch(error=>{
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error})
        })

    }

}

module.exports=Controller