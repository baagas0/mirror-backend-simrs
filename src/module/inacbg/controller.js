const cppt = require('./model')
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };
const registrasiModel = require('../registrasi/model');
const tagihanModel = require('../tagihan/model');
const { callInacbgApi } = require('../../services/inacbg/inacbgService');
const moment = require('moment');
const HistoryEklaimHelper = require('./historyHelper');

class Controller {
  static async new_claim(req, res) {
    const requestData = req.body;
    const { registrasi_id } = requestData;

    try {
      console.log('===> controller.js:13 ~ registrasi_id', registrasi_id);

      const registrasi = await registrasiModel.findOne({
        where: { id: registrasi_id },
        include: ['pasien']
      });

      if (!registrasi) {
        return res.status(404).json({ status: 404, message: "Registrasi tidak ditemukan" });
      }

      const formattedTglLahir = moment(registrasi.pasien.tgl_lahir).format('YYYY-MM-DD HH:mm:ss');
      const nomor_sep = registrasi?.no_sep || registrasi?.no_kontrol || registrasi?.no_rujukan;

      // Check if history exists, create if not
      let history = await HistoryEklaimHelper.getHistoryBySep(nomor_sep);
      if (!history) {
        history = await HistoryEklaimHelper.createHistory(
          nomor_sep,
          registrasi.tagihan?.id || '',
          HistoryEklaimHelper.STAGES.NEW_CLAIM
        );
      }

      // Check if this stage can be executed
      const canExecute = await HistoryEklaimHelper.canExecuteStage(nomor_sep, HistoryEklaimHelper.STAGES.NEW_CLAIM);
      if (!canExecute) {
        return res.status(400).json({
          status: 400,
          message: "Workflow stage tidak dapat dieksekusi. Pastikan stage sebelumnya sudah selesai."
        });
      }

      const apiRequestData = {
        nomor_kartu: registrasi.no_asuransi_registrasi,
        nomor_sep,
        nomor_rm: registrasi.pasien.no_rm,
        nama_pasien: registrasi.pasien.nama_lengkap,
        tgl_lahir: formattedTglLahir,
        gender: registrasi.pasien.jenis_kelamin === 'P' ? 2 : 1,
      };

      const response = await callInacbgApi({
        metadata: { method: 'new_claim' },
        data: apiRequestData
      });

      // Update history
      await HistoryEklaimHelper.updateStageHistory(
        nomor_sep,
        HistoryEklaimHelper.STAGES.NEW_CLAIM,
        requestData,
        response,
        response?.metadata?.code === 200,
        response?.metadata?.message || null
      );

      res.status(200).json({
        status: response?.metadata?.code || 200,
        message: "sukses",
        data: response?.response?.data === 'EMPTY' ? [] : (response?.response?.data || []),
        count: response?.response?.count || 0,
        history_id: history.id
      });

    } catch (error) {
      console.log('===> controller.js:29 ~ error', error);

      // Update history with error if we have nomor_sep
      if (registrasi_id) {
        try {
          const registrasi = await registrasiModel.findOne({
            where: { id: registrasi_id },
            include: ['pasien']
          });
          if (registrasi) {
            const nomor_sep = registrasi?.no_sep || registrasi?.no_kontrol || registrasi?.no_rujukan;
            await HistoryEklaimHelper.updateStageHistory(
              nomor_sep,
              HistoryEklaimHelper.STAGES.NEW_CLAIM,
              requestData,
              null,
              false,
              error.message
            );
          }
        } catch (historyError) {
          console.error('Error updating history:', historyError);
        }
      }

      res.status(500).json({ status: 500, message: "gagal", data: error.message });
    }
  }

  // static async new_claim(req, res) {
  //   try {
  //     const { nomor_kartu, nomor_sep, nomor_rm, nama_pasien, tgl_lahir, gender } = req.body;
  //     const response = await callInacbgApi({
  //       metadata: { method: 'new_claim' },
  //       data: {
  //         nomor_kartu,
  //         nomor_sep,
  //         nomor_rm,
  //         nama_pasien,
  //         tgl_lahir,
  //         gender
  //       }
  //     });
  //     res.status(response?.metadata?.code || 200).json({ status: response?.metadata?.code || 200, message: response?.metadata?.message || "sukses", data: response?.response?.data === 'EMPTY' ? [] : (response?.response?.data || []), count: response?.response?.count || 0 });
  //   } catch (error) {
  //     console.log('===> controller.js:20 ~ error', error);
  //     res.status(500).json({ status: 500, message: "gagal", data: error.message });
  //   }
  // }

  static async update_patient(req, res) {
    try {
      const { nomor_rm: metadata_nomor_rm, nomor_kartu, nomor_rm, nama_pasien, tgl_lahir, gender } = req.body;
      const response = await callInacbgApi({
        metadata: { method: 'update_patient', nomor_rm: metadata_nomor_rm },
        data: {
          nomor_kartu,
          nomor_rm,
          nama_pasien,
          tgl_lahir,
          gender
        }
      });
      res.status(response?.metadata?.code || 200).json({ status: response?.metadata?.code || 200, message: response?.metadata?.message || "sukses", data: response?.response?.data === 'EMPTY' ? [] : (response?.response?.data || []), count: response?.response?.count || 0 });
    } catch (error) {
      console.log('===> controller.js:20 ~ error', error);
      res.status(500).json({ status: 500, message: "gagal", data: error.message });
    }
  }

  static async delete_patient(req, res) {
    try {
      const { nomor_rm, coder_nik } = req.body;
      const response = await callInacbgApi({
        metadata: { method: 'delete_patient' },
        data: {
          nomor_rm,
          coder_nik
        }
      });
      res.status(response?.metadata?.code || 200).json({ status: response?.metadata?.code || 200, message: response?.metadata?.message || "sukses", data: response?.response?.data === 'EMPTY' ? [] : (response?.response?.data || []), count: response?.response?.count || 0 });
    } catch (error) {
      console.log('===> controller.js:20 ~ error', error);
      res.status(500).json({ status: 500, message: "gagal", data: error.message });
    }
  }

  static async set_claim_data(req, res) {
    const requestData = req.body;
    const { nomor_sep: metadata_nomor_sep } = requestData;

    try {
      // Check if this stage can be executed
      const canExecute = await HistoryEklaimHelper.canExecuteStage(metadata_nomor_sep, HistoryEklaimHelper.STAGES.SET_CLAIM_DATA);
      if (!canExecute) {
        return res.status(400).json({
          status: 400,
          message: "Workflow stage tidak dapat dieksekusi. Pastikan stage sebelumnya sudah selesai."
        });
      }

      const response = await callInacbgApi({
        metadata: { method: 'set_claim_data', nomor_sep: metadata_nomor_sep },
        data: {
          ...requestData,
          payor_id: '3', // Hardcoded for BPJS

        }
      });

      // Update history
      await HistoryEklaimHelper.updateStageHistory(
        metadata_nomor_sep,
        HistoryEklaimHelper.STAGES.SET_CLAIM_DATA,
        requestData,
        response,
        response?.metadata?.code === 200,
        response?.metadata?.message || null
      );

      res.status(200).json({
        status: response?.metadata?.code || 200,
        message: "sukses",
        data: response?.response?.data === 'EMPTY' ? [] : (response?.response?.data || []),
        count: response?.response?.count || 0
      });
    } catch (error) {
      console.log('===> controller.js:20 ~ error', error);

      // Update history with error
      try {
        await HistoryEklaimHelper.updateStageHistory(
          metadata_nomor_sep,
          HistoryEklaimHelper.STAGES.SET_CLAIM_DATA,
          requestData,
          null,
          false,
          error.message
        );
      } catch (historyError) {
        console.error('Error updating history:', historyError);
      }

      res.status(500).json({ status: 500, message: "gagal", data: error.message });
    }
  }

  static async idrg_diagnosa_set(req, res) {
    const { nomor_sep, diagnosa } = req.body;
    let requestData = req.body;
    try {
      requestData = {
        metadata: { method: 'idrg_diagnosa_set', nomor_sep },
        data: {
          diagnosa
        }
      }
      const response = await callInacbgApi(requestData);
      console.log('===> controller.js:235 ~ response', response);

      // Update history
      await HistoryEklaimHelper.updateStageHistory(
        nomor_sep,
        HistoryEklaimHelper.STAGES.IDRG_DIAGNOSA_SET,
        requestData,
        response,
        response?.metadata?.code === 200,
        response?.metadata?.message || null
      );

      res.status(response?.metadata?.code || 200).json({ status: response?.metadata?.code || 200, message: response?.metadata?.message || "sukses", data: response?.response?.data === 'EMPTY' ? [] : (response?.response?.data || []), count: response?.response?.count || 0 });
    } catch (error) {
      console.log('===> controller.js:20 ~ error', error);
      await HistoryEklaimHelper.updateStageHistory(
        nomor_sep,
        HistoryEklaimHelper.STAGES.IDRG_DIAGNOSA_SET,
        requestData,
        null,
        false,
        error.message
      );
      res.status(500).json({ status: 500, message: "gagal", data: error.message });
    }
  }

  static async idrg_diagnosa_get(req, res) {
    try {
      const { nomor_sep } = req.body;
      const response = await callInacbgApi({
        metadata: { method: 'idrg_diagnosa_get' },
        data: {
          nomor_sep
        }
      });
      res.status(response?.metadata?.code || 200).json({ status: response?.metadata?.code || 200, message: response?.metadata?.message || "sukses", data: response?.response?.data === 'EMPTY' ? [] : (response?.response?.data || []), count: response?.response?.count || 0 });
    } catch (error) {
      console.log('===> controller.js:20 ~ error', error);
      res.status(500).json({ status: 500, message: "gagal", data: error.message });
    }
  }

  static async idrg_prosedur_set(req, res) {
    try {
      const { nomor_sep, procedure } = req.body;
      const response = await callInacbgApi({
        metadata: { method: 'idrg_prosedur_set', nomor_sep },
        data: {
          procedure
        }
      });
      res.status(response?.metadata?.code || 200).json({ status: response?.metadata?.code || 200, message: response?.metadata?.message || "sukses", data: response?.response?.data === 'EMPTY' ? [] : (response?.response?.data || []), count: response?.response?.count || 0 });
    } catch (error) {
      console.log('===> controller.js:20 ~ error', error);
      res.status(500).json({ status: 500, message: "gagal", data: error.message });
    }
  }

  static async idrg_prosedur_get(req, res) {
    try {
      const { nomor_sep } = req.body;
      const response = await callInacbgApi({
        metadata: { method: 'idrg_prosedur_get' },
        data: {
          nomor_sep
        }
      });
      res.status(response?.metadata?.code || 200).json({ status: response?.metadata?.code || 200, message: response?.metadata?.message || "sukses", data: response?.response?.data === 'EMPTY' ? [] : (response?.response?.data || []), count: response?.response?.count || 0 });
    } catch (error) {
      console.log('===> controller.js:20 ~ error', error);
      res.status(500).json({ status: 500, message: "gagal", data: error.message });
    }
  }

  static async grouper_idrg_stage_1(req, res) {
    const requestData = req.body;
    const { nomor_sep } = requestData;

    try {
      // Check if this stage can be executed
      const canExecute = await HistoryEklaimHelper.canExecuteStage(nomor_sep, HistoryEklaimHelper.STAGES.GROUPER_IDRG_STAGE1);
      if (!canExecute) {
        return res.status(400).json({
          status: 400,
          message: "Workflow stage tidak dapat dieksekusi. Pastikan stage sebelumnya sudah selesai."
        });
      }

      const response = await callInacbgApi({
        metadata: { method: 'grouper', stage: 1, grouper: 'idrg' },
        data: { nomor_sep }
      });

      // Update history with tariff information from grouper response
      await HistoryEklaimHelper.updateStageHistory(
        nomor_sep,
        HistoryEklaimHelper.STAGES.GROUPER_IDRG_STAGE1,
        requestData,
        response,
        response?.metadata?.code === 200,
        response?.metadata?.message || null
      );

      res.status(200).json({
        status: response?.metadata?.code || 200,
        message: "sukses",
        data: response?.response?.data === 'EMPTY' ? [] : (response?.response?.data || []),
        count: response?.response?.count || 0
      });
    } catch (error) {
      console.log('===> controller.js:20 ~ error', error);

      // Update history with error
      try {
        await HistoryEklaimHelper.updateStageHistory(
          nomor_sep,
          HistoryEklaimHelper.STAGES.GROUPER_IDRG_STAGE1,
          requestData,
          null,
          false,
          error.message
        );
      } catch (historyError) {
        console.error('Error updating history:', historyError);
      }

      res.status(500).json({ status: 500, message: "gagal", data: error.message });
    }
  }

  static async idrg_grouper_final(req, res) {
    try {
      const { nomor_sep } = req.body;
      const response = await callInacbgApi({
        metadata: { method: 'idrg_grouper_final' },
        data: {
          nomor_sep
        }
      });
      res.status(response?.metadata?.code || 200).json({ status: response?.metadata?.code || 200, message: response?.metadata?.message || "sukses", data: response?.response?.data === 'EMPTY' ? [] : (response?.response?.data || []), count: response?.response?.count || 0 });
    } catch (error) {
      console.log('===> controller.js:20 ~ error', error);
      res.status(500).json({ status: 500, message: "gagal", data: error.message });
    }
  }

  static async idrg_grouper_reedit(req, res) {
    try {
      const { nomor_sep } = req.body;
      const response = await callInacbgApi({
        metadata: { method: 'idrg_grouper_reedit' },
        data: {
          nomor_sep
        }
      });
      res.status(response?.metadata?.code || 200).json({ status: response?.metadata?.code || 200, message: response?.metadata?.message || "sukses", data: response?.response?.data === 'EMPTY' ? [] : (response?.response?.data || []), count: response?.response?.count || 0 });
    } catch (error) {
      console.log('===> controller.js:20 ~ error', error);
      res.status(500).json({ status: 500, message: "gagal", data: error.message });
    }
  }

  static async idrg_to_inacbg_import(req, res) {
    try {
      const { nomor_sep } = req.body;
      const response = await callInacbgApi({
        metadata: { method: 'idrg_to_inacbg_import' },
        data: {
          nomor_sep
        }
      });
      res.status(response?.metadata?.code || 200).json({ status: response?.metadata?.code || 200, message: response?.metadata?.message || "sukses", data: response?.response?.data === 'EMPTY' ? [] : (response?.response?.data || []), count: response?.response?.count || 0 });
    } catch (error) {
      console.log('===> controller.js:20 ~ error', error);
      res.status(500).json({ status: 500, message: "gagal", data: error.message });
    }
  }

  static async inacbg_diagnosa_set(req, res) {
    try {
      const { nomor_sep, diagnosa } = req.body;
      const response = await callInacbgApi({
        metadata: { method: 'inacbg_diagnosa_set', nomor_sep },
        data: {
          diagnosa
        }
      });
      res.status(response?.metadata?.code || 200).json({ status: response?.metadata?.code || 200, message: response?.metadata?.message || "sukses", data: response?.response?.data === 'EMPTY' ? [] : (response?.response?.data || []), count: response?.response?.count || 0 });
    } catch (error) {
      console.log('===> controller.js:20 ~ error', error);
      res.status(500).json({ status: 500, message: "gagal", data: error.message });
    }
  }

  static async inacbg_prosedur_set(req, res) {
    try {
      const { nomor_sep, procedure } = req.body;
      const response = await callInacbgApi({
        metadata: { method: 'inacbg_prosedur_set', nomor_sep },
        data: {
          procedure
        }
      });
      res.status(response?.metadata?.code || 200).json({ status: response?.metadata?.code || 200, message: response?.metadata?.message || "sukses", data: response?.response?.data === 'EMPTY' ? [] : (response?.response?.data || []), count: response?.response?.count || 0 });
    } catch (error) {
      console.log('===> controller.js:20 ~ error', error);
      res.status(500).json({ status: 500, message: "gagal", data: error.message });
    }
  }

  static async grouper_inacbg_stage_1(req, res) {
    try {
      const { nomor_sep } = req.body;
      const response = await callInacbgApi({
        metadata: { method: 'grouper', stage: 1, grouper: 'inacbg' },
        data: {
          nomor_sep
        }
      });
      res.status(response?.metadata?.code || 200).json({ status: response?.metadata?.code || 200, message: response?.metadata?.message || "sukses", data: response?.response?.data === 'EMPTY' ? [] : (response?.response?.data || []), count: response?.response?.count || 0 });
    } catch (error) {
      console.log('===> controller.js:20 ~ error', error);
      res.status(500).json({ status: 500, message: "gagal", data: error.message });
    }
  }

  static async grouper_inacbg_stage_2(req, res) {
    try {
      const { nomor_sep, special_cmg } = req.body;
      const response = await callInacbgApi({
        metadata: { method: 'grouper', stage: 2, grouper: 'inacbg' },
        data: {
          nomor_sep,
          special_cmg
        }
      });
      res.status(response?.metadata?.code || 200).json({ status: response?.metadata?.code || 200, message: response?.metadata?.message || "sukses", data: response?.response?.data === 'EMPTY' ? [] : (response?.response?.data || []), count: response?.response?.count || 0 });
    } catch (error) {
      console.log('===> controller.js:20 ~ error', error);
      res.status(500).json({ status: 500, message: "gagal", data: error.message });
    }
  }

  static async inacbg_grouper_final(req, res) {
    try {
      const { nomor_sep } = req.body;
      const response = await callInacbgApi({
        metadata: { method: 'inacbg_grouper_final' },
        data: {
          nomor_sep
        }
      });
      res.status(response?.metadata?.code || 200).json({ status: response?.metadata?.code || 200, message: response?.metadata?.message || "sukses", data: response?.response?.data === 'EMPTY' ? [] : (response?.response?.data || []), count: response?.response?.count || 0 });
    } catch (error) {
      console.log('===> controller.js:20 ~ error', error);
      res.status(500).json({ status: 500, message: "gagal", data: error.message });
    }
  }

  static async inacbg_grouper_reedit(req, res) {
    try {
      const { nomor_sep } = req.body;
      const response = await callInacbgApi({
        metadata: { method: 'inacbg_grouper_reedit' },
        data: {
          nomor_sep
        }
      });
      res.status(response?.metadata?.code || 200).json({ status: response?.metadata?.code || 200, message: response?.metadata?.message || "sukses", data: response?.response?.data === 'EMPTY' ? [] : (response?.response?.data || []), count: response?.response?.count || 0 });
    } catch (error) {
      console.log('===> controller.js:20 ~ error', error);
      res.status(500).json({ status: 500, message: "gagal", data: error.message });
    }
  }

  static async claim_final(req, res) {
    try {
      const { nomor_sep, coder_nik } = req.body;
      const response = await callInacbgApi({
        metadata: { method: 'claim_final' },
        data: {
          nomor_sep,
          coder_nik
        }
      });
      res.status(response?.metadata?.code || 200).json({ status: response?.metadata?.code || 200, message: response?.metadata?.message || "sukses", data: response?.response?.data === 'EMPTY' ? [] : (response?.response?.data || []), count: response?.response?.count || 0 });
    } catch (error) {
      console.log('===> controller.js:20 ~ error', error);
      res.status(500).json({ status: 500, message: "gagal", data: error.message });
    }
  }

  static async reedit_claim(req, res) {
    try {
      const { nomor_sep } = req.body;
      const response = await callInacbgApi({
        metadata: { method: 'reedit_claim' },
        data: {
          nomor_sep
        }
      });
      res.status(response?.metadata?.code || 200).json({ status: response?.metadata?.code || 200, message: response?.metadata?.message || "sukses", data: response?.response?.data === 'EMPTY' ? [] : (response?.response?.data || []), count: response?.response?.count || 0 });
    } catch (error) {
      console.log('===> controller.js:20 ~ error', error);
      res.status(500).json({ status: 500, message: "gagal", data: error.message });
    }
  }

  static async send_claim(req, res) {
    try {
      const { start_dt, stop_dt, jenis_rawat, date_type } = req.body;
      const response = await callInacbgApi({
        metadata: { method: 'send_claim' },
        data: {
          start_dt,
          stop_dt,
          jenis_rawat,
          date_type
        }
      });
      res.status(response?.metadata?.code || 200).json({ status: response?.metadata?.code || 200, message: response?.metadata?.message || "sukses", data: response?.response?.data === 'EMPTY' ? [] : (response?.response?.data || []), count: response?.response?.count || 0 });
    } catch (error) {
      console.log('===> controller.js:20 ~ error', error);
      res.status(500).json({ status: 500, message: "gagal", data: error.message });
    }
  }

  static async send_claim_individual(req, res) {
    try {
      const { nomor_sep } = req.body;
      const response = await callInacbgApi({
        metadata: { method: 'send_claim_individual' },
        data: {
          nomor_sep
        }
      });
      res.status(response?.metadata?.code || 200).json({ status: response?.metadata?.code || 200, message: response?.metadata?.message || "sukses", data: response?.response?.data === 'EMPTY' ? [] : (response?.response?.data || []), count: response?.response?.count || 0 });
    } catch (error) {
      console.log('===> controller.js:20 ~ error', error);
      res.status(500).json({ status: 500, message: "gagal", data: error.message });
    }
  }

  static async get_claim_data(req, res) {
    try {
      const { nomor_sep } = req.body;
      const response = await callInacbgApi({
        metadata: { method: 'get_claim_data' },
        data: {
          nomor_sep
        }
      });
      res.status(response?.metadata?.code || 200).json({ status: response?.metadata?.code || 200, message: response?.metadata?.message || "sukses", data: response?.response?.data === 'EMPTY' ? [] : (response?.response?.data || []), count: response?.response?.count || 0 });
    } catch (error) {
      console.log('===> controller.js:20 ~ error', error);
      res.status(500).json({ status: 500, message: "gagal", data: error.message });
    }
  }

  static async get_claim_status(req, res) {
    try {
      const { nomor_sep } = req.body;
      const response = await callInacbgApi({
        metadata: { method: 'get_claim_status' },
        data: {
          nomor_sep
        }
      });
      res.status(response?.metadata?.code || 200).json({ status: response?.metadata?.code || 200, message: response?.metadata?.message || "sukses", data: response?.response?.data === 'EMPTY' ? [] : (response?.response?.data || []), count: response?.response?.count || 0 });
    } catch (error) {
      console.log('===> controller.js:20 ~ error', error);
      res.status(500).json({ status: 500, message: "gagal", data: error.message });
    }
  }

  static async delete_claim(req, res) {
    try {
      const { nomor_sep, coder_nik } = req.body;
      const response = await callInacbgApi({
        metadata: { method: 'delete_claim' },
        data: {
          nomor_sep,
          coder_nik
        }
      });
      res.status(response?.metadata?.code || 200).json({ status: response?.metadata?.code || 200, message: response?.metadata?.message || "sukses", data: response?.response?.data === 'EMPTY' ? [] : (response?.response?.data || []), count: response?.response?.count || 0 });
    } catch (error) {
      console.log('===> controller.js:20 ~ error', error);
      res.status(500).json({ status: 500, message: "gagal", data: error.message });
    }
  }

  static async claim_print(req, res) {
    try {
      const { nomor_sep } = req.body;
      const response = await callInacbgApi({
        metadata: { method: 'claim_print' },
        data: {
          nomor_sep
        }
      });
      res.status(response?.metadata?.code || 200).json({ status: response?.metadata?.code || 200, message: response?.metadata?.message || "sukses", data: response?.response?.data === 'EMPTY' ? [] : (response?.response?.data || []), count: response?.response?.count || 0 });
    } catch (error) {
      console.log('===> controller.js:20 ~ error', error);
      res.status(500).json({ status: 500, message: "gagal", data: error.message });
    }
  }

  static async search_diagnosis_inagrouper(req, res) {
    try {
      const { keyword } = req.body;
      const response = await callInacbgApi({
        metadata: { method: 'search_diagnosis_inagrouper' },
        data: {
          keyword
        }
      });
      res.status(response?.metadata?.code || 200).json({ status: response?.metadata?.code || 200, message: response?.metadata?.message || "sukses", data: response?.response?.data === 'EMPTY' ? [] : (response?.response?.data || []), count: response?.response?.count || 0 });
    } catch (error) {
      console.log('===> controller.js:20 ~ error', error);
      res.status(500).json({ status: 500, message: "gagal", data: error.message });
    }
  }

  static async search_procedures_inagrouper(req, res) {
    try {
      const { keyword } = req.body;
      const response = await callInacbgApi({
        metadata: { method: 'search_procedures_inagrouper' },
        data: {
          keyword
        }
      });
      res.status(response?.metadata?.code || 200).json({ status: response?.metadata?.code || 200, message: response?.metadata?.message || "sukses", data: response?.response?.data === 'EMPTY' ? [] : (response?.response?.data || []), count: response?.response?.count || 0 });
    } catch (error) {
      console.log('===> controller.js:20 ~ error', error);
      res.status(500).json({ status: 500, message: "gagal", data: error.message });
    }
  }

  static async search_diagnosis(req, res) {
    try {
      const { keyword } = req.body;
      const response = await callInacbgApi({
        metadata: { method: 'search_diagnosis' },
        data: {
          keyword
        }
      });
      res.status(response?.metadata?.code || 200).json({ status: response?.metadata?.code || 200, message: response?.metadata?.message || "sukses", data: response?.response?.data === 'EMPTY' ? [] : (response?.response?.data || []), count: response?.response?.count || 0 });
    } catch (error) {
      console.log('===> controller.js:20 ~ error', error);
      res.status(500).json({ status: 500, message: "gagal", data: error.message });
    }
  }

  static async search_procedures(req, res) {
    try {
      const { keyword } = req.body;
      const response = await callInacbgApi({
        metadata: { method: 'search_procedures' },
        data: {
          keyword
        }
      });
      res.status(response?.metadata?.code || 200).json({ status: response?.metadata?.code || 200, message: response?.metadata?.message || "sukses", data: response?.response?.data === 'EMPTY' ? [] : (response?.response?.data || []), count: response?.response?.count || 0 });
    } catch (error) {
      console.log('===> controller.js:20 ~ error', error);
      res.status(500).json({ status: 500, message: "gagal", data: error.message });
    }
  }

  static async generate_claim_number(req, res) {
    try {
      const response = await callInacbgApi({
        metadata: { method: 'generate_claim_number' },
        data: {}
      });
      res.status(response?.metadata?.code || 200).json({ status: response?.metadata?.code || 200, message: response?.metadata?.message || "sukses", data: response?.response?.data === 'EMPTY' ? [] : (response?.response?.data || []), count: response?.response?.count || 0 });
    } catch (error) {
      console.log('===> controller.js:20 ~ error', error);
      res.status(500).json({ status: 500, message: "gagal", data: error.message });
    }
  }

  static async sitb_validate(req, res) {
    try {
      const { nomor_sep, nomor_register_sitb } = req.body;
      const response = await callInacbgApi({
        metadata: { method: 'sitb_validate' },
        data: {
          nomor_sep,
          nomor_register_sitb
        }
      });
      res.status(response?.metadata?.code || 200).json({ status: response?.metadata?.code || 200, message: response?.metadata?.message || "sukses", data: response?.response?.data === 'EMPTY' ? [] : (response?.response?.data || []), count: response?.response?.count || 0 });
    } catch (error) {
      console.log('===> controller.js:20 ~ error', error);
      res.status(500).json({ status: 500, message: "gagal", data: error.message });
    }
  }

  static async sitb_invalidate(req, res) {
    try {
      const { nomor_sep } = req.body;
      const response = await callInacbgApi({
        metadata: { method: 'sitb_invalidate' },
        data: {
          nomor_sep
        }
      });
      res.status(response?.metadata?.code || 200).json({ status: response?.metadata?.code || 200, message: response?.metadata?.message || "sukses", data: response?.response?.data === 'EMPTY' ? [] : (response?.response?.data || []), count: response?.response?.count || 0 });
    } catch (error) {
      console.log('===> controller.js:20 ~ error', error);
      res.status(500).json({ status: 500, message: "gagal", data: error.message });
    }
  }

  // Workflow Management Methods
  static async get_workflow_history(req, res) {
    try {
      const { nomor_sep } = req.body;
      const summary = await HistoryEklaimHelper.getWorkflowSummary(nomor_sep);

      if (!summary) {
        return res.status(404).json({
          status: 404,
          message: "History eklaim tidak ditemukan",
          data: null
        });
      }

      res.status(200).json({
        status: 200,
        message: "sukses",
        data: summary
      });
    } catch (error) {
      console.log('===> get_workflow_history ~ error', error);
      res.status(500).json({ status: 500, message: "gagal", data: error.message });
    }
  }

  static async reset_workflow(req, res) {
    try {
      const { nomor_sep, reset_to_stage = 0 } = req.body;

      const history = await HistoryEklaimHelper.getHistoryBySep(nomor_sep);
      if (!history) {
        return res.status(404).json({
          status: 404,
          message: "History eklaim tidak ditemukan"
        });
      }

      const updatedHistory = await HistoryEklaimHelper.resetWorkflow(nomor_sep, reset_to_stage);

      res.status(200).json({
        status: 200,
        message: "Workflow berhasil direset",
        data: updatedHistory
      });
    } catch (error) {
      console.log('===> reset_workflow ~ error', error);
      res.status(500).json({ status: 500, message: "gagal", data: error.message });
    }
  }

  static async get_workflow_status(req, res) {
    try {
      const { nomor_sep } = req.body;
      const history = await HistoryEklaimHelper.getHistoryBySep(nomor_sep);

      if (!history) {
        // return res.status(404).json({
        //   status: 404,
        //   message: "History eklaim tidak ditemukan"
        // });
        return res.status(200).json({
          status: 200,
          message: "sukses",
          data: {
            current_stage: 1,
            overall_status: 1,
            error_message: 1,
            next_available_stages: [
              {
                stage: 1,
                name: 'new_claim',
                description: Controller.getStageDescription(HistoryEklaimHelper.STAGES.NEW_CLAIM)
              },
              {
                stage: 2,
                name: 'update_patient',
                description: Controller.getStageDescription(HistoryEklaimHelper.STAGES.UPDATE_PATIENT)
              }
            ],
            is_completed: false,
            final_tarif: {
              kode_tarif: null,
              tarif_tarif: null,
              cbg_code: null,
              special_cmg: null,
              severity_level: null
            }
          }
        });
      }

      const nextStages = [];
      for (let stage = 1; stage <= HistoryEklaimHelper.STAGES.GET_CLAIM_STATUS; stage++) {
        const canExecute = await HistoryEklaimHelper.canExecuteStage(nomor_sep, stage);
        if (canExecute && history.current_stage < stage) {
          const stageFields = HistoryEklaimHelper.getStageFields(stage);
          nextStages.push({
            stage,
            name: stageFields?.prefix || `stage_${stage}`,
            description: Controller.getStageDescription(stage)
          });
        }
      }

      res.status(200).json({
        status: 200,
        message: "sukses",
        data: {
          current_stage: history.current_stage,
          overall_status: history.overall_status,
          error_message: history.error_message,
          next_available_stages: nextStages,
          is_completed: history.overall_status === HistoryEklaimHelper.STATUS.COMPLETED,
          final_tarif: {
            kode_tarif: history.kode_tarif,
            tarif_tarif: history.tarif_tarif,
            cbg_code: history.cbg_code,
            special_cmg: history.special_cmg,
            severity_level: history.severity_level
          }
        }
      });
    } catch (error) {
      console.log('===> get_workflow_status ~ error', error);
      res.status(500).json({ status: 500, message: "gagal", data: error.message });
    }
  }

  static getStageDescription(stage) {
    const descriptions = {
      [HistoryEklaimHelper.STAGES.NEW_CLAIM]: 'Buat Klaim Baru',
      [HistoryEklaimHelper.STAGES.UPDATE_PATIENT]: 'Update Data Pasien',
      [HistoryEklaimHelper.STAGES.SET_CLAIM_DATA]: 'Set Data Klaim',
      [HistoryEklaimHelper.STAGES.IDRG_DIAGNOSA_SET]: 'Set Diagnosa IDRG',
      [HistoryEklaimHelper.STAGES.IDRG_PROSEDUR_SET]: 'Set Prosedur IDRG',
      [HistoryEklaimHelper.STAGES.GROUPER_IDRG_STAGE1]: 'Grouper IDRG Stage 1',
      [HistoryEklaimHelper.STAGES.IDRG_GROUPER_FINAL]: 'Final Grouper IDRG',
      [HistoryEklaimHelper.STAGES.IDRG_TO_INACBG_IMPORT]: 'Import IDRG ke INACBG',
      [HistoryEklaimHelper.STAGES.INACBG_DIAGNOSA_SET]: 'Set Diagnosa INACBG',
      [HistoryEklaimHelper.STAGES.INACBG_PROSEDUR_SET]: 'Set Prosedur INACBG',
      [HistoryEklaimHelper.STAGES.GROUPER_INACBG_STAGE1]: 'Grouper INACBG Stage 1',
      [HistoryEklaimHelper.STAGES.GROUPER_INACBG_STAGE2]: 'Grouper INACBG Stage 2',
      [HistoryEklaimHelper.STAGES.INACBG_GROUPER_FINAL]: 'Final Grouper INACBG',
      [HistoryEklaimHelper.STAGES.CLAIM_FINAL]: 'Final Klaim',
      [HistoryEklaimHelper.STAGES.SEND_CLAIM_INDIVIDUAL]: 'Kirim Klaim Individual',
      [HistoryEklaimHelper.STAGES.GET_CLAIM_STATUS]: 'Cek Status Klaim'
    };

    return descriptions[stage] || `Stage ${stage}`;
  }
}

module.exports = Controller