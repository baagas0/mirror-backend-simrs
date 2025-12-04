const CryptoJS = require("crypto-js");
const crypto = require('crypto');
const moment = require('moment');
const axios = require('axios');
const {decompressFromURL} =  require('@amoutonbrady/lz-string');
const Base64 = CryptoJS.enc.Base64;

const consid = process.env.CONSID_VCLAIM
const secretkey = process.env.SECRETKEY_VCLAIM
const userkey = process.env.USERKEY_VCLAIM
const vclaim_url = process.env.VCLAIM_URL


export function decript (data) {
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

function header (data) {
    return new Promise(async (resolve, reject) => {
        const {time} = data
        try {
            const hash = encodeURI(CryptoJS.HmacSHA256(`${consid}&${time}`,secretkey).toString(Base64));
            const hasil = {headers:{"X-cons-id":consid,"X-timestamp":time,"X-signature":hash,"user_key":userkey}}

            resolve(hasil)
        } catch (err) {
            reject(err)
        }
    });
}

function getBPJSnonDekrip (data){
    return new Promise(async (resolve, reject) => {
        const {url_bpjs} = data
        try {
            const time = moment().unix();
            const headers = await header({ time: time })
            headers.headers['Content-Type'] = `application/json`
            const hasil = await axios.get(`${vclaim_url}/${url_bpjs}`, headers);
            const respon = hasil.data;

            if (!respon.response) {
                resolve({ status: 204, message: respon.metaData })
            } else {
                const isi = respon.response
                resolve({ status: 200, message: "sukses", data: [isi] })
            }
        } catch (err) {
            reject(err)
        }
    });
}

function getBPJS (data){
    return new Promise(async (resolve, reject) => {
        const {url_bpjs} = data
        try {
            const time = moment().unix();
            const headers = await header({ time: time })
            headers.headers['Content-Type'] = `application/json`
            const hasil = await axios.get(`${vclaim_url}/${url_bpjs}`, headers);
            const respon = hasil.data;
            
            if (!respon.response) {
                resolve({ status: 204, message: respon.metaData.message })
            } else {
                const isi = respon.response
                const hasil_json = await decript({ time, isi });
                resolve({ status: 200, message: "sukses", data: [hasil_json] })
            }
        } catch (err) {
            // reject(err)
        }
    });
}

function postBPJS (data){
    return new Promise(async (resolve, reject) => {
        const {url_bpjs,payload} = data
        try {
            const time = moment().unix();
            const headers = await header({ time })
            headers.headers['Content-Type'] = `application/x-www-form-urlencoded`

            const hasil = await axios.post(`${vclaim_url}/${url_bpjs}`, JSON.stringify(payload), headers);
            const data = hasil.data;
            if (!data.response) {
                resolve({ status: 204, message: data.metaData.message, data })
            } else {
                const isi = data.response
                const hasil_json = await decript({ time, isi });
                resolve({ status: 200, message: "sukses", data: [hasil_json] })
            }
        } catch (err) {
            reject(err)
        }
    });
}

function putBPJS (data){
    return new Promise(async (resolve, reject) => {
        const {url_bpjs,payload} = data
        try {
            const time = moment().unix();
            const headers = await header({ time })
            headers.headers['Content-Type'] = `application/x-www-form-urlencoded`

            const hasil = await axios.put(`${vclaim_url}/${url_bpjs}`, JSON.stringify(payload), headers);
            const data = hasil.data;

            if (!data.response) {
                resolve({ status: data.metaData.code, message: data.metaData.message })
            } else {
                const isi = data.response
                const hasil_json = await decript({ time, isi });
                resolve({ status: 200, message: "sukses", data: [hasil_json] })
            }
        } catch (err) {
            reject(err)
        }
    });
}

function deleteBPJS (data){
    return new Promise(async (resolve, reject) => {
        const {url_bpjs,payload} = data
        try {
            const time = moment().unix();
            const headers = await header({ time })
            headers.headers['Content-Type'] = `application/x-www-form-urlencoded`
            const hasil = await axios.delete(`${vclaim_url}/${url_bpjs}`,{headers:headers.headers,data:JSON.stringify(payload)});
            const response = hasil.data;

            if (!response.response) {
                resolve({ status: 204, message: response.metaData.message })
            } else {
                const isi = response
                resolve({ status: 200, message: "sukses", data: [isi] })
            }
        } catch (err) {
            reject(err)
        }
    });
}

module.exports = {decript,header,getBPJS,getBPJSnonDekrip,postBPJS,putBPJS,deleteBPJS}