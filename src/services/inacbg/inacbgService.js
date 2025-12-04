const axios = require('axios');
const { inacbg_encrypt, inacbg_decrypt } = require('./inacbgCrypto');
const inacbg = require('../../module/inacbg/model');
const inacbg_log = require('../../module/inacbg_log/model');
var request = require('request');

const baseUrl = process.env.EKLAIM_URL || ''

const getEncryptionKey = async () => {
  const token = process.env.EKLAIM_KEY;
  if (!token) {
    throw new Error('Encryption key not found. Please set the key first.');
  }

  return token;
};

/**
 * Call the INACBG Web Service API.
 * @param {string} method - The INACBG API method to call (e.g., 'new_claim').
 * @param {object} data - The payload data for the method.
 * @returns {object} The decrypted response data.
 */
const callInacbgApi = async (data) => {
  let requestPayload; 
  try {
    const key = await getEncryptionKey();
    requestPayload = await inacbg_encrypt({...data, data: { ...data.data, coder_nik: '3320091409030002' }}, key);
    var options = {
      'method': 'POST',
      'url': baseUrl,
      body: requestPayload
    };
    const response2 = await new Promise((resolve, reject) => {
      request(options, function (error, response) {
        if (error) return reject(error);
        resolve(response);
      });
    });
    // LOG
    const isSuccess = response2.statusCode >= 200 && response2.statusCode < 300;
    
    const decrypt = await inacbg_decrypt(response2.body, key);
    const createLog = {
      method: data.metadata ? data.metadata.method : 'unknown',
      request_payload: requestPayload || 'N/A',
      response_status: response2?.status || 200,
      response_body: response2.body,
      is_success: isSuccess,
      response_data: decrypt // Store parsed response
    };
    await inacbg_log.create(createLog);
    return typeof decrypt === 'string' ? JSON.parse(decrypt) : decrypt;
  } catch (error) {
    // LOG ERROR
    console.error('Error in callInacbgApi:', error);
    await inacbg_log.create({
      method: data.metadata ? data.metadata.method : 'unknown',
      request_payload: requestPayload || 'N/A',
      response_status: 400,
      response_body: JSON.stringify(error),
      is_success: false,
      response_data: null
    });
    throw new Error(error);
  }
};

module.exports = {
  getEncryptionKey,
  callInacbgApi,
};
