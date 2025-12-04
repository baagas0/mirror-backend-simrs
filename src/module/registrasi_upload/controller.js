const {sq} = require('../../config/connection');
const {v4: uuidv4} = require('uuid');
const {QueryTypes} = require('sequelize');
const s = {type: QueryTypes.SELECT};
const {Op} = require('sequelize');
const register = require('../registrasi/model');
const registrasiUpload = require('../registrasi_upload/model');

class Controller {
    static async register(req, res) {
        const {judul, keterangan, registrasi_id} = req.body;
        let nama_file ='';
        let url ='';
        if(req.body.nama_file && req.body.nama_file.filename){
            nama_file = req.body.nama_file.filename;
            url = req.body.nama_file.url;
        }
        registrasiUpload.create({id: uuidv4(), judul, nama_file, url, keterangan, registrasi_id, created_by:req.dataUsers.id, created_name:req.dataUsers?.username}).then(hasil => {
            res.status(200).json({status: 200, message: 'sukses', data: hasil});
        }).catch(error => {
            console.log(error);
            res.status(500).json({status: 500, message: 'gagal', data: error});
        });
    }
    static async delete(req, res) {
        const {id} = req.body;
        try {
            await registrasiUpload.update({deleted_by:req.dataUsers.id, deleted_name:req.dataUsers?.username}, {where: {id}});
            await registrasiUpload.destroy({where: {id}});
            res.status(200).json({status: 200, message: 'sukses'});
        } catch (error) {
            console.log(error);
            res.status(500).json({status: 500, message: 'gagal', data: error});
        }
    }
    static async list(req, res) {
        const {registrasi_id} = req.body;
        let param = '';
        if (registrasi_id) {
            param += ` and ru.registrasi_id='${registrasi_id}'`;
        }
        try {
            let data = await sq.query(`select *, ru.id as registrasi_upload_id from registrasi_upload ru 
            left join registrasi r on r.id = ru.registrasi_id
            where ru."deletedAt" isnull${param}`, s);
            res.status(200).json({status: 200, message: 'sukses', data});
        } catch (error) {
            console.log(error);
            res.status(500).json({status: 500, message: 'gagal', data: error});
        }
    }
}

module.exports = Controller;