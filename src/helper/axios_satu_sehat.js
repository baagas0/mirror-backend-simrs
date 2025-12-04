const axios = require("axios");
const tipe = require("../helper/type").tipe;
const { sq } = require("../config/connection");

// INIT REDIS
const { createClient } = require("redis");
const client = createClient({
  url: `redis://${process.env.HOST_REDIS}:${process.env.PORT_REDIS}`,
  legacyMode: true,
});
client.connect().catch(console.error);
const { promisify } = require("util");
const setRedisAsync = promisify(client.set).bind(client);
const getRedisAsync = promisify(client.get).bind(client);
const delRedisAsync = promisify(client.del).bind(client);

// INIT SATU SEHAT URL
const debug = String(process.env.SATU_SEHAT_DEBUG).toLowerCase() === "true";

const auth_url_stg = "https://api-satusehat-stg.dto.kemkes.go.id/oauth2/v1/";
const base_url_stg = "https://api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1/";
const consent_url_stg =
  "https://api-satusehat-stg.dto.kemkes.go.id/consent/v1/";

const auth_url_prd = "https://api-satusehat.kemkes.go.id/oauth2/v1";
const base_url_prd = "https://api-satusehat.kemkes.go.id/fhir-r4/v1";
const consent_url_prd = "https://api-satusehat.dto.kemkes.go.id/consent/v1";

const auth_url = debug === false ? auth_url_prd : auth_url_stg;
const base_url = debug === false ? base_url_prd : base_url_stg;
const consent_url = debug === false ? consent_url_prd : consent_url_stg;

// DEFIND TOKEN KEY SATU SEHAT
const token_key = "token_satu_sehat_busel";

// CREATE INSTANCE AXIOS SATU SEHAT
const api = axios.create({
  baseURL: base_url,
  maxBodyLength: Infinity,
});

function axios_satu_sehat(method = "get", uri = "", data = {}, params = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      // INIT HEADER REQUEST
      let token = await getRedisAsync(token_key);
      if (!token) token = await get_token();

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
      console.log('token satu sehat:', token);

      let hasil = null;

      if (method === "get")
        hasil = await api[method](`${uri}`, {
          params: params,
          headers: headers,
        }); // GET TIDAK KIRIM DATA
      else
        hasil = await api[method](`${uri}`, data, {
          params: params,
          headers: headers,
        });

      resolve(hasil);
    } catch (err) {
      console.log("error axios satu sehat");
      // console.log(`Status Satu Sehat: ${err.response.status}`)
      if (err.response) {
        // Ada respon dari satu sehat, dan ingin mengembalikan nilai respon tersebut
        if (
          err.response &&
          err.response.status &&
          err.response.status === 401
        ) {
          // HAPUS KEY REDIS TOKEN SATU SEHAT
          await delRedisAsync(token_key);
          err.response.status = 500; // kalau ngga dirubah nanti fe nya direct ke halaman login :(
        }
        resolve(err.response);
      }

      reject(err);
    }
  });
}

function get_token() {
  return new Promise(async (resolve, reject) => {
    try {
      const req = await axios.create({
        baseURL: auth_url,
        maxBodyLength: Infinity,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      console.log(
        process.env.SATU_SEHAT_CLIENT_ID,
        process.env.SATU_SEHAT_CLIENT_SECRET
      );
      const res = await req.post("accesstoken?grant_type=client_credentials", {
        client_id: process.env.SATU_SEHAT_CLIENT_ID,
        client_secret: process.env.SATU_SEHAT_CLIENT_SECRET,
      });

      const access_token = res.data.access_token;
      const resRedis = await setRedisAsync(
        token_key,
        access_token,
        "EX",
        parseInt(res.data.expires_in)
      );

      if (resRedis === "OK") resolve(access_token);
      else
        reject({ message: "Kesalahan redis saat otentikasi pada satu sehat" });
    } catch (error) {
      if (error.response.data && error.response.data.issue && error.response.data.issue.length) reject({ message: error.response.data.issue[0].details.text });
      reject({ message: "Kesalahan otentikasi pada satu sehat", });
    }
  });
}

module.exports = { token_key, get_token, axios_satu_sehat };
