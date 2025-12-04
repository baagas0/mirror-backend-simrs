const { QueryTypes, json } = require('sequelize');
const s = { type: QueryTypes.SELECT }
const moment = require('moment');
const vclaim = require('../../../../helper/vclaim');

class Controller {
    static async getPesertaByNoKartu(req, res) {
        let { noKartu, jenis } = req.body

        try {
            // jenis => nik / bpjs
            if (jenis == 'bpjs') {
                jenis = 'nokartu'
            }

            let hasil = await vclaim.getBPJS({url_bpjs:`peserta/${jenis}/${noKartu}/tglSEP/${moment().format('YYYY-MM-DD')}`})

            if (hasil.status != 200) {
                res.status(201).json({ status: hasil.status, message: hasil.message })
            } else {
                res.status(200).json({ status: 200, message: "sukses", data:hasil.data })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }
}

module.exports = Controller