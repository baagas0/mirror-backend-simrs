const { axios_satu_sehat } = require("../../../helper/axios_satu_sehat")

class Controller {

    static async get_location_by_id(req, res) {
        const { id, puskesmas_id } = req.body
        // method,url,data
        try {
            let hasil = await axios_satu_sehat({method:'post',url:`Location/get_location_by_id`,payload:{id},puskesmas_id})
            let data = hasil.data
            if(data.status == 200){
                res.status(200).json({status:200,message:"sukses",data:[hasil.data.data]})
            }else{
                res.status(201).json({status:data.status,message:data.message})
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

    static async get_location(req, res) {
        const { organization,name,identifier,puskesmas_id } = req.body
        // method,url,data
        try {
            let hasil = await axios_satu_sehat({method:'post',url:`Location/get_location`,payload:{organization,name,identifier},puskesmas_id})
            let data = hasil.data
            if(data.status == 200){
                res.status(200).json({status:200,message: "sukses",data:[hasil.data.data]})
            }else{
                res.status(201).json({status:data.status,message:data.message})
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

    static async add_location(req, res) {
        const { organization_id, ms_poli_id, name_location, part_of, puskesmas_id } = req.body
        try {
            let hasil = await axios_satu_sehat({ method: 'post', url: `Location/add_location`, payload: { organization_id, ms_poli_id, name_location, part_of }, puskesmas_id })
            
            let data = hasil.data
            if (data.status != 200) {
                res.status(201).json({ status: data.status, message: data.message, data: [hasil.data.data] })
            } else {
                res.status(200).json({ status: 200, message: "sukses", data: [hasil.data.data] })
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