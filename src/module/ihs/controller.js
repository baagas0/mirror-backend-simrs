const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, json } = require("sequelize");
const s = { type: QueryTypes.SELECT };
const axios = require("axios");
const moment = require("moment");

const { axios_satu_sehat } = require("../../helper/axios_satu_sehat");

class Controller {
  static organization_id(req, res) {
    try {
      const org_id = process.env.SATU_SEHAT_ORGANIZATION_ID;
      res.status(200).json({
        status: 200,
        message: "Berhasil",
        data: {
          organization_id: org_id || null,
        },
      });
    } catch (error) {
      res.status(403).json({
        status: 403,
        message: "Gagal",
        data: {
          organization_id: null,
        },
      });
    }
  }

  static async request(req, res) {
    // method : GET, POST, PATCH, DELETE, PUT
    // uri : ''
    // data : data yang kirim saat metode POST, PATCH dan PUT
    // params : data url param saat metode GET => ?param=tes
    let { method, uri, data, params } = req.body;

    try {
      if (!uri)
        res
          .status(500)
          .json({ status: 500, message: "URI satu sehat tidak ditemukan" });

      let hasil = await axios_satu_sehat(method, uri, data, params);

      let message = "terhubung satu sehat";
      // console.log(hasil.data.issue)
      Ïif(hasil.data.issue && hasil.data.issue.length);
      message = hasil.data.issue[0].details.text;
      if (hasil.data.fault && hasil.data.fault.faultstring)
        message = hasil.data.fault.faultstring;

      return res.status(hasil.status).json({
        status: hasil.status,
        message: message,
        data: hasil.data,
        payload: { ...data, ...params },
      });
    } catch (error) {
      console.log("error disini");
      return res.status(500).json({
        status: 500,
        message: error.message ?? "gagal",
        data: error.data ?? [],
      });
    }
  }
}

module.exports = Controller;
