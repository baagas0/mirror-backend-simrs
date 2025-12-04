const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, json } = require("sequelize");
const s = { type: QueryTypes.SELECT };
const axios = require("axios");
const moment = require("moment");
const signature = require("../../helper/signature");
const { enc } = require("crypto-js");
const tagihanEklaim = require("./model");
const historyEklaim = require("../history_eklaim/model");
const { buildFilter } = require("../../helper/general");
class Controller {
  static async send_to_eklaim(req, res) {
    try {
      const { nomor_sep } = req.body.data;
      let metadata = req.body.metadata;

      let tagihan_eklaim = await tagihanEklaim.findOrCreate({
        where: { nomor_sep },
        defaults: {
          id: uuid_v4(),
          nomor_sep,
          id_tagihan: "Sementara SEP dulu",
        },
      });
      const eklaim = tagihan_eklaim[0].dataValues;

      let response = await signature.set_claim_data(req.body);

      if (metadata.method == "set_claim_data") {
        await signature.dataEklaim(nomor_sep, {
          set_claim_data_request: req.body,
          set_claim_data_response: response,
          set_claim_data_status:
            response.metadata.code == 200 ? "sukses" : "gagal",
        });
      } else if (metadata.method == "grouper" && metadata?.stage == "1") {
        await signature.dataEklaim(nomor_sep, {
          group_stage_1_response: response,
          group_stage_1_date: moment(),
        });
      } else if (metadata.method == "grouper" && metadata?.stage == "2") {
        await signature.dataEklaim(nomor_sep, {
          group_stage_2_response: response,
          group_stage_2_date: moment(),
        });
      }

      res
        .status(200)
        .json({
          status: 200,
          message: "Eklaim berhasil dikirim",
          data: response,
        });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({
          status: error?.metadata?.code,
          message: error?.metadata?.message,
          data: error,
        });
    }
  }

  static async send_grouper_1(req, res) {
    try {
      const { nomor_sep } = req.body.data;

      // let response = await signature.send_grouper_1(req.body);

      res
        .status(200)
        .json({
          status: 200,
          message: "Eklaim berhasil dikirim",
          data: response,
        });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({
          status: error?.metadata?.code,
          message: error?.metadata?.message,
          data: error,
        });
    }
  }

  static async list(req, res) {
    try {
      let req_query = req._parsedOriginalUrl.query;
      let query = {};
      for (let text of req_query.split("&")) {
        text = text.split("=");
        if (text[0] !== undefined && text[1] !== undefined) {
          query[text[0]] = text[1];
        }
      }

      let filter = buildFilter([
        { as: "a", field: "nomor_sep", type: "=", value: query.nomor_sep },
      ]);

      let data = await sq.query(
        `select * from tagihan_eklaim a where true ${filter} and a."deletedAt" isnull`,
        s
      );

      res.status(200).json({ status: 200, message: "sukses", data });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({
          status: error?.metadata?.code,
          message: error?.metadata?.message,
          data: error,
        });
    }
  }

  //
  static async encrypt(req, res) {
    try {
      let encrypt = await signature.encrypt(req.body);

      res.status(200).json({ status: 200, message: "sukses", data: encrypt });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error });
    }
  }

  static async decrypt(req, res) {
    try {
      let encrypt = await signature.decrypt(req.body.encrypt);
      const result = JSON.parse(encrypt);

      res.status(200).json({ status: 200, message: "sukses", data: result });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error });
    }
  }

  static async search_diagnosis(req, res) {
    const { keyword } = req.body;
    const obj = {
      "metadata": {
        "method": "retrieve_claim_status"
      },
      "data": {
        "as": "0000668870001",
        "nomor_sep": "0001R0016120507422",
        "nomor_rm": "123-45-67",
        "nama_pasien": "NAMA TEST PASIEN",
        "tgl_lahir": "1940-01-01 02:00:00",
        "gender": "2"
      }
    }
    try {
      let result = await signature.ngepost(obj);
      if (result.metadata.code == 200) {
        res
          .status(200)
          .json({
            status: 200,
            message: result.metadata.message,
            respon_eklaim: result,
            data: result.response.data,
            count: result.response.count,
          });
      } else {
        res
          .status(500)
          .json({
            status: 500,
            message: result.metadata.message,
            respon_eklaim: result,
            data: result.response?.data ? result.response.data : [],
            count: result?.response?.count ? result?.response?.count : 0,
          });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error });
    }
  }

  static async new_claim(req, res) {
    const { nomor_kartu, nomor_sep, nomor_rm, nama_pasien, tgl_lahir, gender } =
      req.body;
    const obj = {
      metadata: {
        method: "new_claim",
      },
      data: {
        nomor_kartu,
        nomor_sep,
        nomor_rm,
        nama_pasien,
        tgl_lahir,
        gender,
      },
    };
    try {
      const result = await signature.ngepost(obj);
      if (result.metadata.code == 200) {
        res
          .status(200)
          .json({
            status: 200,
            message: result.metadata.message,
            respon_eklaim: result,
          });
      } else {
        res
          .status(500)
          .json({
            status: 500,
            message: result.metadata.message,
            respon_eklaim: result,
          });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error });
    }
  }

  static async update_patient(req, res) {
    const { nomor_kartu, nomor_rm, nama_pasien, tgl_lahir, gender } = req.body;
    const obj = {
      metadata: {
        method: "update_patient",
        nomor_rm,
      },
      data: {
        nomor_kartu,
        nomor_rm,
        nama_pasien,
        tgl_lahir,
        gender,
      },
    };
    try {
      const result = await signature.ngepost(obj);
      if (result.metadata.code == 200) {
        res
          .status(200)
          .json({
            status: 200,
            message: result.metadata.message,
            respon_eklaim: result,
          });
      } else {
        res
          .status(500)
          .json({
            status: 500,
            message: result.metadata.message,
            respon_eklaim: result,
          });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error });
    }
  }

  static async delete_patient(req, res) {
    const { nomor_rm, coder_nik } = req.body;
    const obj = {
      metadata: {
        method: "delete_patient",
      },
      data: {
        nomor_rm,
        coder_nik,
      },
    };
    try {
      const result = await signature.ngepost(obj);
      if (result.metadata.code == 200) {
        res
          .status(200)
          .json({
            status: 200,
            message: result.metadata.message,
            respon_eklaim: result,
          });
      } else {
        res
          .status(500)
          .json({
            status: 500,
            message: result.metadata.message,
            respon_eklaim: result,
          });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error });
    }
  }

  static async set_claim_data(req, res) {
    const { tagihan_id, idrg_diagnosa, idrg_prosedur, diagnosa_inagrouper, procedure_inagrouper, diagnosa } = req.body;
    delete req.body.tagihan_id;
    const obj = {
      metadata: {
        method: "set_claim_data",
        nomor_sep: req.body.nomor_sep,
      },
      data: {
        // ...req.body,
        nomor_sep: req.body.nomor_sep,
        nomor_kartu: req.body.nomor_kartu,
        tgl_masuk: req.body.tgl_masuk,
        tgl_pulang: req.body.tgl_pulang,
        cara_masuk: req.body.cara_masuk,
        jenis_rawat: req.body.jenis_rawat,
        kelas_rawat: req.body.kelas_rawat,
        adl_sub_acute: req.body.adl_sub_acute,
        adl_chronic: req.body.adl_chronic,
        icu_indikator: req.body.icu_indikator,
        icu_los: req.body.icu_los,
        ventilator_hour: req.body.ventilator_hour,
        ventilator: req.body.ventilator,
        upgrade_class_ind: req.body.upgrade_class_ind,
        upgrade_class_class: req.body.upgrade_class_class,
        upgrade_class_los: req.body.upgrade_class_los,
        upgrade_class_payor: req.body.upgrade_class_payor,
        add_payment_pct: req.body.add_payment_pct,
        birth_weight: req.body.birth_weight,
        sistole: req.body.sistole,
        diastole: req.body.diastole,
        discharge_status: req.body.discharge_status,
        tarif_rs: req.body.tarif_rs,
        tarif_poli_eks: req.body.tarif_poli_eks,
        nama_dokter: req.body.nama_dokter,
        kode_tarif: req.body.kode_tarif,
        payor_id: req.body.payor_id,
        payor_cd: req.body.payor_cd,
        cob_cd: req.body.cob_cd,
        coder_nik: req.body.coder_nik,
        dializer_single_use: req.body.dializer_single_use,
        kantong_darah: req.body.kantong_darah,
        alteplase_ind: req.body.alteplase_ind,
        apgar: req.body.apgar,
        persalinan: req.body.persalinan,
        nomor_kartu_t: req.body.nomor_kartu_t,
        bayi_lahir_status_cd: req.body.bayi_lahir_status_cd,
      },
    };
    try {
      const result = await signature.ngepost(obj);
      if (result.metadata.code == 200) {
        const checkHistory = await historyEklaim.findOne({
          where: { tagihan_id },
        });
        if (!checkHistory) {
          const createHistory = await historyEklaim.create({
            id: uuid_v4(),
            tagihan_id,
            nomor_sep: req.body.nomor_sep,
            request_eklaim: obj,
            respon_eklaim: result,
            created_by: req.dataUsers.id,
          });
        } else {
          const updateHistory = await historyEklaim.update(
            {
              nomor_sep: req.body.nomor_sep,
              request_eklaim: obj,
              respon_eklaim: result,
              updated_by: req.dataUsers.id,
              griuping_stage_one: null,
              tanggal_stage_one: null,
              grouping_stage_two: null,
              tanggal_stage_two: null,
              final_klaim: false,
              tgl_final: null,
              data_center_klaim: false,
              tgl_data_center: null,
            },
            { where: { tagihan_id } }
          );
        }
        return res
          .status(200)
          .json({ status: 200, message: "sukses", respon_eklaim: result });
      } else {
        if (result.metadata.error_no == "E2004") {
          const {
            nomor_kartu,
            nomor_sep,
            nomor_rm,
            nama_pasien,
            tgl_lahir,
            gender,
          } = req.body;
          const obj2 = {
            metadata: {
              method: "new_claim",
            },
            data: {
              nomor_kartu,
              nomor_sep,
              nomor_rm,
              nama_pasien,
              tgl_lahir,
              gender,
            },
          };
          const resultNewClaim = await signature.ngepost(obj2);
          if (resultNewClaim.metadata.code == 200) {
            const resultSetClaim = await signature.ngepost(obj);
            if (resultSetClaim.metadata.code == 200) {
              const checkHistory = await historyEklaim.findOne({
                where: { tagihan_id },
              });
              if (!checkHistory) {
                const createHistory = await historyEklaim.create({
                  id: uuid_v4(),
                  tagihan_id,
                  nomor_sep: req.body.nomor_sep,
                  request_eklaim: obj,
                  respon_eklaim: resultSetClaim,
                  created_by: req.dataUsers.id,
                });
              } else {
                const updateHistory = await historyEklaim.update(
                  {
                    nomor_sep: req.body.nomor_sep,
                    request_eklaim: obj,
                    respon_eklaim: resultSetClaim,
                    updated_by: req.dataUsers.id,
                    griuping_stage_one: null,
                    tanggal_stage_one: null,
                    grouping_stage_two: null,
                    tanggal_stage_two: null,
                    final_klaim: false,
                    tgl_final: null,
                    data_center_klaim: false,
                    tgl_data_center: null,
                  },
                  { where: { tagihan_id } }
                );
              }
              return res
                .status(200)
                .json({
                  status: 200,
                  message: resultSetClaim.metadata.message,
                  respon_eklaim: resultSetClaim,
                });
            } else {
              return res
                .status(500)
                .json({
                  status: 500,
                  message: resultSetClaim.metadata.message,
                  respon_eklaim: resultSetClaim,
                });
            }
          } else {
            return res
              .status(500)
              .json({
                status: 500,
                message: resultNewClaim.metadata.message,
                respon_eklaim: resultNewClaim,
              });
          }
        }
        return res
          .status(500)
          .json({
            status: 500,
            message: result.metadata.message,
            respon_eklaim: result,
          });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error });
    }
  }

  static async grouper(req, res) {
    const { nomor_sep, tagihan_id } = req.body;
    const obj = {
      metadata: {
        method: "grouper",
        stage: "1",
      },
      data: {
        nomor_sep,
      },
    };
    try {
      const result = await signature.ngepost(obj);
      if (result.metadata.code == 200) {
        const updateHistory = await historyEklaim.update(
          {
            grouping_stage_one: result,
            tanggal_stage_one: moment(),
            updated_by: req.dataUsers.id,
            grouping_stage_two: null,
            tanggal_stage_two: null,
            final_klaim: false,
            tgl_final: null,
            data_center_klaim: false,
            tgl_data_center: null,
          },
          { where: { tagihan_id } }
        );
        res
          .status(200)
          .json({
            status: 200,
            message: result.metadata.message,
            respon_eklaim: result,
          });
      } else {
        res
          .status(500)
          .json({
            status: 500,
            message: result.metadata.message,
            respon_eklaim: result,
          });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error });
    }
  }
  static async grouper2(req, res) {
    const { nomor_sep, special_cmg, tagihan_id } = req.body;
    const obj = {
      metadata: {
        method: "grouper",
        stage: "2",
      },
      data: {
        nomor_sep,
        special_cmg,
      },
    };
    try {
      const result = await signature.ngepost(obj);
      if (result.metadata.code == 200) {
        const updateHistory = await historyEklaim.update(
          {
            grouping_stage_two: result,
            tanggal_stage_two: moment(),
            updated_by: req.dataUsers.id,
            final_klaim: false,
            tgl_final: null,
            data_center_klaim: false,
            tgl_data_center: null,
          },
          { where: { tagihan_id } }
        );
        res
          .status(200)
          .json({
            status: 200,
            message: result.metadata.message,
            respon_eklaim: result,
          });
      } else {
        res
          .status(500)
          .json({
            status: 500,
            message: result.metadata.message,
            respon_eklaim: result,
          });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error });
    }
  }

  static async claim_final(req, res) {
    const { nomor_sep, coder_nik, tagihan_id } = req.body;
    const obj = {
      metadata: {
        method: "claim_final",
      },
      data: {
        nomor_sep,
        coder_nik,
      },
    };
    try {
      const result = await signature.ngepost(obj);
      if (result.metadata.code == 200) {
        const updateHistory = await historyEklaim.update(
          {
            final_klaim: true,
            tgl_final: moment(),
            updated_by: req.dataUsers.id,
            data_center_klaim: false,
            tgl_data_center: null,
          },
          { where: { tagihan_id } }
        );
        res
          .status(200)
          .json({
            status: 200,
            message: result.metadata.message,
            respon_eklaim: result,
          });
      } else {
        res
          .status(500)
          .json({
            status: 500,
            message: result.metadata.message,
            respon_eklaim: result,
          });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error });
    }
  }

  static async reedit_claim(req, res) {
    const { nomor_sep, tagihan_id } = req.body;
    const obj = {
      metadata: {
        method: "reedit_claim",
      },
      data: {
        nomor_sep,
      },
    };
    try {
      const result = await signature.ngepost(obj);
      if (result.metadata.code == 200) {
        const updateHistory = await historyEklaim.update(
          {
            final_klaim: false,
            tgl_final: null,
            updated_by: req.dataUsers.id,
            data_center_klaim: false,
            tgl_data_center: null,
          },
          { where: { tagihan_id } }
        );
        res
          .status(200)
          .json({
            status: 200,
            message: result.metadata.message,
            respon_eklaim: result,
          });
      } else {
        res
          .status(500)
          .json({
            status: 500,
            message: result.metadata.message,
            respon_eklaim: result,
          });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error });
    }
  }
  static async send_claim(req, res) {
    const { start_dt, stop_dt, jenis_rawat, date_type } = req.body;
    const obj = {
      metadata: {
        method: "send_claim",
      },
      data: {
        start_dt,
        stop_dt,
        jenis_rawat,
        date_type,
      },
    };
    try {
      const result = await signature.ngepost(obj);
      if (result.metadata.code == 200) {
        console.log(result);
        for (let item of result.response.data) {
          const updateHistory = await historyEklaim.update(
            {
              data_center_klaim: true,
              tgl_data_center: moment(),
              updated_by: req.dataUsers.id,
            },
            { where: { nomor_sep: item.SEP } }
          );
        }
        // const updateHistory = await historyEklaim.update({data_center_klaim: true, tgl_data_center: moment(), updated_by:req.dataUsers.id}, {where: {tagihan_id}});
        res
          .status(200)
          .json({
            status: 200,
            message: result.metadata.message,
            respon_eklaim: result,
          });
      } else {
        res
          .status(500)
          .json({
            status: 500,
            message: result.metadata.message,
            respon_eklaim: result,
          });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error });
    }
  }

  static async send_claim_individual(req, res) {
    const { nomor_sep, tagihan_id } = req.body;
    const obj = {
      metadata: {
        method: "send_claim_individual",
      },
      data: {
        nomor_sep,
      },
    };
    try {
      const result = await signature.ngepost(obj);
      if (result.metadata.code == 200) {
        const updateHistory = await historyEklaim.update(
          {
            data_center_klaim: true,
            tgl_data_center: moment(),
            updated_by: req.dataUsers.id,
          },
          { where: { tagihan_id } }
        );
        res
          .status(200)
          .json({
            status: 200,
            message: result.metadata.message,
            respon_eklaim: result,
          });
      } else {
        res
          .status(500)
          .json({
            status: 500,
            message: result.metadata.message,
            respon_eklaim: result,
          });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error });
    }
  }
  static async delete_claim(req, res) {
    const { nomor_sep, coder_nik, tagihan_id } = req.body;
    const obj = {
      metadata: {
        method: "delete_claim",
      },
      data: {
        nomor_sep,
        coder_nik,
      },
    };
    try {
      const result = await signature.ngepost(obj);
      if (result.metadata.code == 200) {
        const updateHistory = await historyEklaim.update(
          { deleted_by: req.dataUsers.id },
          { where: { tagihan_id } }
        );
        await historyEklaim.destroy({ where: { tagihan_id } });
        res
          .status(200)
          .json({
            status: 200,
            message: result.metadata.message,
            respon_eklaim: result,
          });
      } else {
        res
          .status(500)
          .json({
            status: 500,
            message: result.metadata.message,
            respon_eklaim: result,
          });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error });
    }
  }

  static async claim_print(req, res) {
    const { nomor_sep } = req.body;
    const obj = {
      metadata: {
        method: "claim_print",
      },
      data: {
        nomor_sep,
      },
    };
    try {
      const result = await signature.ngepost(obj);
      if (result.metadata.code == 200) {
        res
          .status(200)
          .json({
            status: 200,
            message: result.metadata.message,
            respon_eklaim: result,
          });
      } else {
        res
          .status(500)
          .json({
            status: 500,
            message: result.metadata.message,
            respon_eklaim: result,
          });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error });
    }
  }

  static async search_procedures(req, res) {
    const { keyword } = req.body;
    const obj = {
      metadata: {
        method: "search_procedures",
      },
      data: {
        keyword,
      },
    };
    try {
      const result = await signature.ngepost(obj);
      if (result.metadata.code == 200) {
        res
          .status(200)
          .json({
            status: 200,
            message: result.metadata.message,
            respon_eklaim: result,
            data: result.response.data,
            count: result.response.count,
          });
      } else {
        res
          .status(500)
          .json({
            status: 500,
            message: result.metadata.message,
            respon_eklaim: result,
            data: result.response.data ? result.response.data : [],
            count: result.response.count ? result.response.count : 0,
          });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error });
    }
  }
  static async search_diagnosis_inagrouper(req, res) {
    const { keyword } = req.body;
    const obj = {
      metadata: {
        method: "search_diagnosis_inagrouper",
      },
      data: {
        keyword,
      },
    };
    try {
      const result = await signature.ngepost(obj);
      if (result.metadata.code == 200) {
        res
          .status(200)
          .json({
            status: 200,
            message: result.metadata.message,
            respon_eklaim: result,
          });
      } else {
        res
          .status(500)
          .json({
            status: 500,
            message: result.metadata.message,
            respon_eklaim: result,
          });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error });
    }
  }
  static async search_procedures_inagrouper(req, res) {
    const { keyword } = req.body;
    const obj = {
      metadata: {
        method: "search_procedures_inagrouper",
      },
      data: {
        keyword,
      },
    };
    try {
      const result = await signature.ngepost(obj);
      if (result.metadata.code == 200) {
        res
          .status(200)
          .json({
            status: 200,
            message: result.metadata.message,
            respon_eklaim: result,
          });
      } else {
        res
          .status(500)
          .json({
            status: 500,
            message: result.metadata.message,
            respon_eklaim: result,
          });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error });
    }
  }

  static async sitb_validate(req, res) {
    const { nomor_sep, nomor_register_sitb } = req.body;
    const obj = {
      metadata: {
        method: "sitb_validate",
      },
      data: {
        nomor_sep,
        nomor_register_sitb,
      },
    };
    try {
      const result = await signature.ngepost(obj);
      if (result.metadata.code == 200) {
        res
          .status(200)
          .json({
            status: 200,
            message: result.metadata.message,
            respon_eklaim: result,
          });
      } else {
        res
          .status(500)
          .json({
            status: 500,
            message: result.metadata.message,
            respon_eklaim: result,
          });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error });
    }
  }
  static async sitb_invalidate(req, res) {
    const { nomor_sep } = req.body;
    const obj = {
      metadata: {
        method: "sitb_invalidate",
      },
      data: {
        nomor_sep,
      },
    };
    try {
      const result = await signature.ngepost(obj);
      if (result.metadata.code == 200) {
        res
          .status(200)
          .json({
            status: 200,
            message: result.metadata.message,
            respon_eklaim: result,
          });
      } else {
        res
          .status(500)
          .json({
            status: 500,
            message: result.metadata.message,
            respon_eklaim: result,
          });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error });
    }
  }
  static async get_claim_data(req, res) {
    const { nomor_sep } = req.body;
    const obj = {
      metadata: {
        method: "get_claim_data",
      },
      data: {
        nomor_sep,
      },
    };
    try {
      const result = await signature.ngepost(obj);
      if (result.metadata.code == 200) {
        return res
          .status(200)
          .json({
            status: 200,
            message: result.metadata.message,
            respon_eklaim: result,
          });
      } else {
        return res
          .status(500)
          .json({
            status: 500,
            message: result.metadata.message,
            respon_eklaim: result,
          });
      }
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: 500, message: "gagal", data: error });
    }
  }
  static async generate_claim_number(req, res) {
      const {nomor_sep} = req.body;
      const obj = {
          "metadata": {
              "method": "generate_claim_number"
          },
          "data": {
              "payor_id": "1",
          } 
      }
      try {
          const result = await signature.ngepost(obj);
              if(result.metadata.code == 200) {
                  return res.status(200).json({ status: 200, message:result.metadata.message, respon_eklaim: result })
              }else{
                  return res.status(500).json({ status: 500, message:result.metadata.message, respon_eklaim: result })
              } 
      } catch (error) {
          console.log(error);
          return res.status(500).json({ status: 500, message: "gagal", data: error })
      }
  }
}

module.exports = Controller;
