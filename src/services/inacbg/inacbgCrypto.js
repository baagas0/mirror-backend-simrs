const crypto = require("crypto");
const axios = require('axios');

const inacbg_decrypt = (data, key) => {
  try {
    if (typeof data === "string") {
      data = data.replace(
        /----BEGIN ENCRYPTED DATA----|----END ENCRYPTED DATA----/g,
        ""
      );
    } else {
      return "Should be String input";
    }
    let keys = Buffer.from(key, "hex");
    let data_decoded = Buffer.from(data, "base64");
    let iv = Buffer.from(data_decoded.slice(10, 26));
    let dec = crypto.createDecipheriv("aes-256-cbc", keys, iv);
    let encoded = Buffer.from(data_decoded.slice(26));
    let signature = data_decoded.slice(0, 10);
    if (!inacbg_compare(signature, encoded, key)) {
      return "SIGNATURE_NOT_MATCH";
    }
    let decrypted = Buffer.concat([dec.update(encoded), dec.final()]);
    return decrypted.toString("utf8");
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error(`Decryption failed: ${error.message}`);
  }
};
const inacbg_encrypt = async (data, key) => {
  try {
    // return 'lU4maTVjlMPzax2pdJpNfPHMKqQQWyoj+3ANefRIjuJXDqJvojcBJGFCerUPyLKZ2+POPXia9baivznWUXcLxi/kBxapacX1fRenEgGZd6mPlPDiFS5ypF9oRn/0H0p0XzenMa53g2IjQ5RT9bS8TvLg/5mQ/Q9Njk0='
    const payload = { data: data, key }
    const res = await axios.post('https://inacbg-integration.onrender.com/encrypt', payload);
    // const res = await axios.post('http://localhost:3000/encrypt', payload);
    return res.data.encrypted;
  } catch (error) {
    console.log('===> inacbgCrypto.js:29 ~ error', error.response.data);
    throw new Error(`Encryption failed: ${error.message}`);
  }
  const info = crypto.getCipherInfo('aes-256-cbc')
  console.log('===> inacbgCrypto.js:31 ~ info', info);
  console.log('===> inacbgCrypto.js:30 ~ data', data);
  try {
    console.log('===> inacbgCrypto.js:31 ~ typeof data', typeof data);
    if (typeof data === "object") {
      data = JSON.stringify(data);
    } 
    let data_encoded = Buffer.from(JSON.stringify(data));
    let keys = Buffer.from(key, "hex");
    console.log('===> inacbgCrypto.js:37 ~ key', {key});
    let iv = crypto.randomBytes(16);
    console.log('===> inacbgCrypto.js:38 ~ iv', iv);
    let enc = crypto.createCipheriv("aes-256-cbc", keys, iv);
    let encrypt = Buffer.concat([enc.update(data_encoded), enc.final()]);
    let signature = crypto
      .createHmac("sha256", keys)
      .update(encrypt)
      .digest()
      .slice(0, 10);
    return Buffer.concat([signature, iv, encrypt]).toString("base64");
  } catch (error) {
    console.log('===> inacbgCrypto.js:33 ~ error', error);
  }
};
const inacbg_compare = (signature, encrypt, key) => {
  let keys = Buffer.from(key, "hex");
  let calc_signature = crypto
    .createHmac("sha256", keys)
    .update(encrypt)
    .digest()
    .slice(0, 10);
  if (signature.compare(calc_signature) === 0) {
    return true;
  }
  return false;
};

module.exports = {
    inacbg_decrypt,
    inacbg_encrypt,
    inacbg_compare
};