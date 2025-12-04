const { sq } = require("../config/connection");
const { QueryTypes, json } = require("sequelize");
const s = { type: QueryTypes.SELECT };
const logEklaim = require("../module/log_eklaim/model");

const crypto = require("crypto");
const axios = require("axios");
const { enc } = require("crypto-js");

const tagihanEklaim = require("../module/eklaim/model");
const { log } = require("console");
const { v4: uuid_v4 } = require("uuid");

const key = process.env.EKLAIM_KEY
// const key = "af0ccf846068aa3c92de7e5f83d80c1cddf29f9d39ff27275c5d2ba26b2b677e";
const eklaim_url = process.env.EKLAIM_URL;
// const eklaim_url = 'http://10.211.55.3/E-Klaim/ws.php';

let idLog = "";
axios.interceptors.request.use(async (request) => {
  if (request.url == eklaim_url) {
    idLog = uuid_v4();
    const payload_default = request.data;
    request.data = await Signature.encrypt(request.data);
    await logEklaim.create({
      id: idLog,
      payload_default,
      payload_encrypted: request.data,
    });
  }
  return request;
});

axios.interceptors.response.use(async (response) => {
  if (response.config.url == eklaim_url) {
    let status = response.status == 200 ? "sukses" : "gagal";
    let code = response.status;
    let message = response.statusText;
    if (response.data) {
      if (typeof response.data === "string") {
        response.data = response.data
          .replace("----BEGIN ENCRYPTED DATA----", "")
          .replace("----END ENCRYPTED DATA----", "")
          .replace(/(\r\n|\n|\r)/gm, "");
        response.data = await Signature.decrypt(response.data);
        response.data = JSON.parse(response.data);
        status = response.data.metadata.code == 200 ? "sukses" : "gagal";
        code = response.data.metadata.code;
        message = response.data.metadata.message;
        await logEklaim.update(
          { status, code, message, response: response.data },
          { where: { id: idLog } }
        );
      }
    }
  }
  return response;
});
class Signature {
  static async dataEklaim(nomor_sep, data = null) {
    return new Promise(async (resolve, reject) => {
      try {
        if (data === null) {
          console.log("Signature get data eklaim => database");
          let tagihanEklaimData = await tagihanEklaim.findOne({
            where: { nomor_sep },
          });
          // console.log(tagihanEklaimData);

          resolve(tagihanEklaimData.dataValues);
        } else {
          console.log("Signature update data eklaim => database");
          await tagihanEklaim.update(data, { where: { nomor_sep } });

          resolve(true);
        }
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });
  }

  static async new_claim(data, sent_to_eklaim = false) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("NEW CLAIM");

        const origin_data = data;

        const param = {
          metadata: {
            method: "new_claim",
          },
          data: data.data.new_claim,
        };

        // console.log(param);
        const encrypt = await Signature.encrypt(JSON.stringify(param));
        const send = await axios.post(`${eklaim_url}`, encrypt);
        let res_data_decrypt = await Signature.decrypt(send.data);
        let res_data = JSON.parse(res_data_decrypt);

        // await Signature.send(origin_data);
        resolve(res_data);
      } catch (err) {
        console.log("Start => Gagal Fetch NEW Eklaim");
        console.log(err);
        console.log("Start => Gagal Fetch NEW Eklaim");

        reject(err);
      }
    });
  }

  static async set_claim_data(data, try_status = 0) {
    return new Promise(async (resolve, reject) => {
      try {
        const encrypt = await Signature.encrypt(JSON.stringify(data));
        const send = await axios.post(`${eklaim_url}`, encrypt);

        let res_data_decrypt = await Signature.decrypt(send.data);
        let res_data = JSON.parse(res_data_decrypt);

        if (res_data.metadata.error_no == "E2004" && try_status === 0) {
          let new_claim = await Signature.new_claim(data, true); // Buat Pasien & Eklaim

          try_status = 1;
          await Signature.set_claim_data(data, try_status);
        }
        // console.log(res_data.response.special_cmg)
        resolve(res_data);
      } catch (error) {
        console.log("Start => Gagal Fetch Eklaim");
        console.log(error.code);
        console.log("End => Gagal Fetch Eklaim");

        if (error.code == "ENETUNREACH") {
          reject({
            metadata: {
              code: 500,
              message: "Tidak dapat terhubung ke server eklaim",
            },
          });
        }

        await Signature.dataEklaim(data.data.nomor_sep, {
          set_claim_data_response: error.response,
          set_claim_data_status: "gagal",
        });
        reject(error);
      }
    });
  }

  static async decrypt(data) {
    //Replacing Text
    if (typeof data === "string") {
      data = data.replace(/----BEGIN ENCRYPTED DATA----/g, "")
				.replace(/----END ENCRYPTED DATA----/g, "")
				.trim();
    } else {
      return `Should be String input`;
    }

		const keyBuffer = Buffer.from(key, "hex");
		if (keyBuffer.length !== 32) throw new Error("Needs a 256-bit keyBuffer (32 bytes)");

		const decoded = Buffer.from(data.replace(/\r?\n|\r/g, ""), "base64");

		const signature = decoded.subarray(0, 10);
		const iv = decoded.subarray(10, 26);
		const encrypted = decoded.subarray(26);

		const calcSig = crypto
			.createHmac("sha256", keyBuffer)
			.update(encrypted)
			.digest()
			.subarray(0, 10);

		if (!signature.equals(calcSig)) {
			throw new Error("SIGNATURE_NOT_MATCH");
		}

		const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuffer, iv);
		const decrypted = Buffer.concat([
			decipher.update(encrypted),
			decipher.final(),
		]);
		return decrypted.toString("utf8");
  }
  static async encrypt(data) {
		if (typeof data == 'object') {
			data = JSON.stringify(data)
		}

    const keyBuffer = Buffer.from(key, "hex");
    if (keyBuffer.length !== 32) throw new Error("Needs a 256-bit keyBuffer (32 bytes)");

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, iv);
    const encrypted = Buffer.concat([
      cipher.update(data, "utf8"),
      cipher.final(),
    ]);

    const signature = crypto
      .createHmac("sha256", keyBuffer)
      .update(encrypted)
      .digest()
      .subarray(0, 10);
    const finalBuffer = Buffer.concat([signature, iv, encrypted]);
    const encoded = finalBuffer.toString("base64");

    // Split to match E-Klaim format
    return encoded.match(/.{1,64}/g).join("\n");
  }
  static async compare(signature, encrypt) {
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
  }

  static async ngepost(data) {
    return new Promise(async (resolve, reject) => {
      try {
        const headers = {
          "Content-Type": "application/x-www-form-urlencoded",
        };
        axios.post(`${eklaim_url}`, data, { headers }).then(async (res) => {
          resolve(res.data);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = Signature;
