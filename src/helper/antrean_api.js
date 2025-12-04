const axios = require("axios");
const moment = require("moment");
const CryptoJS = require("crypto-js");
const crypto = require('crypto');
const {decompressFromURL} =  require('@amoutonbrady/lz-string');
const antrianBpjsLog = require("../module/bpjs/model");
const Base64 = CryptoJS.enc.Base64;

const antrean_url = process.env.ANTREAN_URL;
const consid = process.env.CONSTID_ANTREAN;
const secretkey = process.env.SECRETKEY_ANTREAN;
const userkey = process.env.USERKEY_ANTREAN;

// Create axios instance
const antreanApi = axios.create({
  baseURL: antrean_url,
  timeout: 30000,
});

// Add request interceptor to automatically add headers
antreanApi.interceptors.request.use(
  (config) => {
    const time = moment().unix();
    const signature = CryptoJS.HmacSHA256(
      `${consid}&${time}`,
      secretkey
    ).toString(Base64);

    config.headers = {
      ...config.headers,
      "X-cons-id": consid,
      "X-timestamp": time,
      "X-signature": signature,
      user_key: userkey,
    };

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

function decript (data) {
    return new Promise(async (resolve, reject) => {
        const {time,isi} = data
        try {
                const sha = Buffer.from(crypto.createHash('sha256').update(`${consid}${secretkey}${time}`).digest());
                const key_dekrip = Buffer.from(sha.slice(0, 32));
                const iv = Buffer.from(sha.slice(0, 16));
                const dec = crypto.createDecipheriv('aes-256-cbc',key_dekrip,iv).setAutoPadding(false);
                const data_decoded = Buffer.from(isi, 'base64');
                const decrypted = Buffer.concat([dec.update(data_decoded), dec.final()]).toString();
                const hasil_json = JSON.parse(decompressFromURL(decrypted));

                resolve(hasil_json)
        } catch (err) {
            reject(err)
        }
    });
}


// Add response interceptor for error handling
antreanApi.interceptors.response.use(
  async (response) => {
    const timeHeader = response.config.headers['X-timestamp'];
    const enc = response?.data?.response;
    
    if (enc) {
      const res = await decript({time: timeHeader, isi: enc});
      response.data.response = res;
    }

    try {
      const payload = response.config.data ? JSON.parse(response.config.data) : null;
      const data = response.data;
      const fullPath = response.config.baseURL + response.config.url;
      const log = {
        kode_booking: payload?.kodebooking || '',
        url: fullPath,
        waktu: moment().toDate(),
        task_id: payload?.taskid || null,
        payload,
        response: data, // Simpan seluruh response
      }
      await antrianBpjsLog.create(log)
    } catch (error) {
      console.error("Error logging Antrean BPJS:", error);
    }

    return response
  },
  (error) => {
    console.log("Antrean API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

module.exports = antreanApi;
