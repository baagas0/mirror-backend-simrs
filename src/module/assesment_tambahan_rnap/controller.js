const assesment_tambahan_rnap = require('./model')
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };


class Controller {
		static async register(req, res) {
				const { is_validasi_askep,json_askep, is_validasi_asmed, json_asmed,registrasi_id} = req.body;

				try {
						// console.log(req.dataUsers);

						let data= await assesment_tambahan_rnap.create({id:uuid_v4(),is_validasi_askep,json_askep, is_validasi_asmed, json_asmed,created_by:req.dataUsers.id,created_name:req.dataUsers.username,registrasi_id})
						res.status(200).json({ status: 200, message: "sukses",data })

				} catch (err) {
						console.log(req.body);
						console.log(err);
						res.status(500).json({ status: 500, message: "gagal", data: err });
				}
		}

		static async update(req, res) {
			const t = await sq.transaction()
			const { id,is_validasi_askep,json_askep, is_validasi_asmed, json_asmed,registrasi_id } = req.body;
		//   console.log(req.body);

			try {
					await assesment_tambahan_rnap.update({is_validasi_askep,json_askep, is_validasi_asmed, json_asmed,updated_by:req.dataUsers.id,updated_name:req.dataUsers.username,registrasi_id},{where:{
						id
				 }},{transaction:t})
				 await t.commit()
				 res.status(200).json({ status: 200, message: "sukses" })
			} catch (err) {
					console.log(req.body);
					console.log(err);
					await t.rollback()
					res.status(500).json({ status: 500, message: "gagal", data: err });
			}
		}

		static async delete(req, res) {
			const{id}= req.body

			try {
			 await assesment_tambahan_rnap.destroy({where:{id}})
			 await assesment_tambahan_rnap.update({deleted_by:req.dataUsers.id,deleted_name:req.dataUsers.username,registrasi_id},{where:{
				id
		 }})
			 res.status(200).json({ status: 200, message: "sukses" })
			} catch (error) {
				console.log(req.body);
				console.log(err);
				res.status(500).json({ status: 500, message: "gagal", data: err });
			}
		}

		static async list(req, res) {
			const{halaman,jumlah,id,registrasi_id}=req.body
			let isi = ''
			let offset=''
			let pagination=''

			if(halaman && jumlah){
				offset = (+halaman -1) * jumlah;
				pagination=`limit ${jumlah} offset ${offset}`
			}


			try {

				if(id){
					isi+= ` and amr.id = '${id}' `
				}
				if(registrasi_id){
					isi+= ` and amr.registrasi_id = '${registrasi_id}' `
				}

				let data = await sq.query(`select amr.id as assesment_tambahan_rnap_id,* from assesment_tambahan_rnap amr
				join registrasi r on r.id = amr.registrasi_id
				where amr."deletedAt" isnull ${isi} order by amr."createdAt" desc ${pagination}`,s)

				let jml = await sq.query(`select count(*) from assesment_tambahan_rnap amr
				join registrasi r on r.id = amr.registrasi_id
				where amr."deletedAt" isnull ${isi}`,s)

				res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })

			} catch (error) {
				console.log(req.body);
				console.log(error);
				res.status(500).json({ status: 500, message: "gagal", data: error });
			}

		}

		static async detailsById(req,res){
				const {id}=req.body

				try {
						let data = await sq.query(`select amr.id as assesment_tambahan_rnap_id,* from assesment_tambahan_rnap amr
						join registrasi r on r.id = amr.registrasi_id
						where amr."deletedAt" isnull and amr.id='${id}'`,s)
						res.status(200).json({ status: 200, message: "sukses",data })
				} catch (error) {
						console.log(err);
						res.status(500).json({ status: 500, message: "gagal", data: err });
				}
		}
}

module.exports = Controller