const axios = require('axios') 
const tipe = require('../helper/type').tipe
const { sq } = require('../config/connection')

const URL = process.env.SATU_SEHAT_URL || 'https://api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1'

// static key staging
const CLIENT_ID = 'lDVWj7Mrshpqi1B8c5NWl4lG0GoNHlkuS3ACszarBVTUINzi'
const CLIENT_SECRET = 'XA0XBpmHNX9MjFfZsnZa889oZ9LqNnfKxEKloZLNQdESKBvnK8KO459nohtjFRJ5'
const TOKEN = 'iHIoiQaEzXhmSCCkaH53zUmX6GMv'

// const CLIENT_ID = process.env.SATU_SEHAT_CLIENT_ID
// const CLIENT_SECRET = process.env.SATU_SEHAT_CLIENT_SECRET
// const TOKEN = process.env.SATU_SEHAT_TOKEN

function axios_satu_sehat(data){
  return new Promise(async (resolve, reject) => {
    const { method, url, payload, puskesmas_id } = data
    try {
      let hasil = await axios({
        method:method,
        url: `${URL}/${url}`,
        data:payload,
        headers: {
          "Authorization": `Bearer ${TOKEN}`,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        }
      });
      
      resolve(hasil)
    } catch (err) {
      console.log('URL', err.config.url);
      console.log('PAYLOAD', err.config.data);
      // console.log(err.config.headers);
      console.log('RESPONSE', err.response.data);
      if(err.response.data.issue) console.log(err.response.data.issue);
      // console.log("error axios satu sehat");
      reject(err)
    }
  });
}

module.exports = {axios_satu_sehat}