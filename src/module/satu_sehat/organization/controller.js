const { axios_satu_sehat } = require("../../../helper/axios_satu_sehat")

class Controller {

    static async get_organization_by_id(req, res) {
        const { id, puskesmas_id } = req.body
        try {
            let hasil = await axios_satu_sehat({ method: 'post', url: `Organization/get_organization_by_id`, payload: { id }, puskesmas_id })
            let data = hasil.data
            if (data.status == 200) {
                res.status(200).json({ status: 200, message: "sukses", data: [hasil.data.data] })
            } else {
                res.status(201).json({ status: data.status, message: data.message })
            }
        } catch (error) {
            console.log(req.body)
            if (error.response) {
                if(error.response.data){
                    console.log(error.response.data.data)
                    res.status(201).json({ status: 204, message: "error", data: error.response.data.data })
                }else{
                    console.log(error.response)
                    res.status(201).json({ status: 204, message: error.response.data.message })
                }
            } else {
                console.log(error)
                res.status(500).json({ status: 500, message: "gagal", data: error })
            }
        }
    }

    static async get_organization(req, res) {
        const { part_of, name, puskesmas_id } = req.body
        try {
            let hasil = await axios_satu_sehat({ method: 'post', url: `Organization/get_organization`, payload: { part_of, name }, puskesmas_id })
            let data = hasil.data
            if (data.status == 200) {
                res.status(200).json({ status: 200, message: "sukses", data: [hasil.data.data] })
            } else {
                res.status(201).json({ status: data.status, message: data.message })
            }
        } catch (error) {
            console.log(req.body)
            if (error.response) {
                if(error.response.data){
                    console.log(error.response.data.data)
                    res.status(201).json({ status: 204, message: "error", data: error.response.data.data })
                }else{
                    console.log(error.response)
                    res.status(201).json({ status: 204, message: error.response.data.message })
                }
            } else {
                console.log(error)
                res.status(500).json({ status: 500, message: "gagal", data: error })
            }
        }
    }

    static async add_organization(req, res) {
        const { organization_id, ms_kelurahan_id, ms_kota_id, ms_kecamatan_id, ms_provinsi_id, name_organization, phone, email, addres, city, postal_code, puskesmas_id } = req.body
        try {
            let hasil = await axios_satu_sehat({ method: 'post', url: `Organization/add_organization`, payload: { organization_id, ms_kelurahan_id, ms_kota_id, ms_kecamatan_id, ms_provinsi_id, name_organization, phone, email, addres, city, postal_code }, puskesmas_id })
            let data = hasil.data
            if (data.status == 200) {
                res.status(200).json({ status: 200, message: "sukses", data: [hasil.data.data] })
            } else {
                res.status(201).json({ status: 200, message: "sukses" })
            }
        } catch (error) {
            console.log(req.body)
            if (error.response) {
                if(error.response.data){
                    console.log(error.response.data.data)
                    res.status(201).json({ status: 204, message: "error", data: error.response.data.data })
                }else{
                    console.log(error.response)
                    res.status(201).json({ status: 204, message: error.response.data.message })
                }
            } else {
                console.log(error)
                res.status(500).json({ status: 500, message: "gagal", data: error })
            }
        }
    }
}

module.exports = Controller;