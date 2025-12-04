const labHasil = require('./model');
const labPaket = require('../lab_paket/model');
const penunjang = require('../penunjang/model');
const labRegis = require('../lab_regis/model');
const {sq} = require('../../config/connection');
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };
const { v4: uuid_v4 } = require("uuid");

class Controller {
    static register(req, res) {
        labHasil.create({ id:uuid_v4(), ...req.body }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses", data: hasil })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static update(req, res) {
        labHasil.update({ ...req.body }, { where: { id: req.body.id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async list(req, res) {
        const { id, lab_regis_id, registrasi_id } = req.body;
        let param='';
        if(id){
            param=` and lh.id='${id}'`
        }
        if(lab_regis_id){
            param+=` and lh.lab_regis_id='${lab_regis_id}'`
        }
        if(registrasi_id){
            param+=` and lr.registrasi_id='${registrasi_id}'`
        }
        try {
            let data = await sq.query(`select lh.id as id_lab_hasil, *, lh.satuan as satuan from lab_hasil lh
            left join lab_regis lr on lr.id=lh.lab_regis_id
            left join lab_paket lp on lp.id=lh.lab_paket_id
            left join penunjang p on p.id=lh.penunjang_id
            where lh."deletedAt" isnull and lr."deletedAt" isnull ${param}`, s)
            // console.log(data);
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static async detailsById(req, res) {
        const { id } = req.body
        try {
            let data = await sq.query(`select lh.id as id_lab_hasil, *, lh.satuan as satuan from lab_hasil lh
            left join lab_regis lr on lr.id=lh.lab_regis_id
            left join lab_paket lp on lp.id=lh.lab_paket_id
            left join penunjang p on p.id=lh.penunjang_id
            where lh."deletedAt" isnull and lr."deletedAt" isnull and lh.id = '${id}'`, s)
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }
    static delete(req, res) {
        const { id } = req.body
        labHasil.destroy({ where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }
        ).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

}

module.exports = Controller