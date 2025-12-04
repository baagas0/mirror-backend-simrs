const waktu = require('./model');
const { v4: uuidv4 } = require('uuid');
const { QueryTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const s = { type: QueryTypes.SELECT }

class Controller {
    
        static register(req, res) {
            const { nama_waktu, status_waktu } = req.body
            waktu.create({ id: uuidv4(), nama_waktu, status_waktu }).then(hasil => {
                res.status(200).json({ status: 200, message: "sukses", data: hasil })
            }).catch(error => {
                console.log(error);
                res.status(500).json({ status: 500, message: "gagal", data: error })
            })
        }
    
        static update(req, res) {
            const { id, nama_waktu, status_waktu } = req.body
            waktu.update({ nama_waktu, status_waktu }, { where: { id } }).then(hasil => {
                res.status(200).json({ status: 200, message: "sukses" })
            }).catch(error => {
                console.log(error);
                res.status(500).json({ status: 500, message: "gagal", data: error })
            })
        }
    
        static async list(req, res) {
    
            try {
                let data = await sq.query(`select * from waktu w where w."deletedAt" isnull`, s)
                // console.log(data);
                res.status(200).json({ status: 200, message: "sukses", data })
            } catch (error) {
                console.log(error);
                res.status(500).json({ status: 500, message: "gagal", data: error })
            }
    
        }
    
        static async detailsById(req, res) {
            const { id } = req.body;
            try {
                let data = await sq.query(`select * from waktu w where w."deletedAt" isnull and w.id = '${id}'`, s)
                res.status(200).json({ status: 200, message: "sukses", data })
            } catch (error) {
                res.status(500).json({ status: 500, message: "gagal", data: error })
    
            }
    
        }
    
        static delete(req, res) {
            const { id } = req.body
            waktu.destroy({ where: { id } }).then(hasil => {
                res.status(200).json({ status: 200, message: "sukses" })
            }
            ).catch(error => {
                console.log(error);
                res.status(500).json({ status: 500, message: "gagal", data: error })
            })
        }
    }

module.exports = Controller