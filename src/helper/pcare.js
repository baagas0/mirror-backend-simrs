const CryptoJS = require("crypto-js");
const crypto = require('crypto');
const {decompressFromURL} =  require('@amoutonbrady/lz-string');
const Base64 = CryptoJS.enc.Base64;

const consid = process.env.CONSID_PCARE
const secretkey = process.env.SECRETKEY_PCARE
const userkey = process.env.USERKEY_PCARE
const username = process.env.USERNAME_PCARE
const pass = process.env.PASS_PCARE

function decriptPcare (data) {
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

function headerPcare (data) {
    return new Promise(async (resolve, reject) => {
        const {time} = data
        try {
            const xauthor = Buffer.from(username+':'+pass+':095').toString('base64');
            const hash = encodeURI(CryptoJS.HmacSHA256(`${consid}&${time}`,secretkey).toString(Base64));
            const hasil = {headers:{"X-cons-id":consid,"X-timestamp":time,"X-signature":hash,"user_key":userkey,"X-authorization":'Basic '+xauthor}}

            resolve(hasil)
        } catch (err) {
            reject(err)
        }
    });
}

module.exports = {decriptPcare,headerPcare}