const { sq } = require("../../config/connection");
const { QueryTypes } = require("sequelize");
const registrasi = require("../registrasi/model");
const { axios_satu_sehat } = require("../../helper/axios_satu_sehat");
const moment = require("moment");
const assesmentMedisRjalan = require("../assesment_medis_rjalan/model");
const assesmentKeperawatanRjalan = require("../assesment_keperawatan_rjalan/model");

const s = { type: QueryTypes.SELECT };

class Service {
  static async syncEncounter(data, registrasi_id) {
    const organization = process.env.SATU_SEHAT_ORGANIZATION_ID;
    if (!organization) {
      throw {
        status: 500,
        message: "Organization ID tidak ditemukan",
        data: null,
      };
    }

    const actCode = {
      RINAP: {
        code: "IMP",
        display: "inpatient encounter",
      },
      IGD: {
        code: "EMER",
        display: "emergency",
      },
      RAJAL: {
        code: "AMB",
        display: "ambulatory",
      },
    };

    const actCodeData = actCode[data.kode_jenis_layanan];
    if (!actCodeData) {
      throw {
        status: 400,
        message: "Jenis layanan tidak valid",
        data: null,
      };
    }

    const status = "arrived";
    let payload = {
      uri: "Encounter",
      method: "post",
      data: {
        resourceType: "Encounter",
        status: status,
        class: {
          system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
          code: actCodeData.code,
          display: actCodeData.display,
        },
        subject: {
          reference: `Patient/${data.satu_sehat_id_pasien}`,
          display: data.nama_lengkap,
        },
        participant: [
          {
            type: [
              {
                coding: [
                  {
                    system:
                      "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
                    code: "ATND",
                    display: "attender",
                  },
                ],
              },
            ],
            individual: {
              reference: `Practitioner/${data.satu_sehat_id_dokter}`,
              display: data.nama_dokter,
            },
          },
        ],
        period: {
          start: moment(data.tgl_registrasi).toISOString(),
        },
        statusHistory: [
          {
            status: "arrived",
            period: {
              start: moment(data.tgl_registrasi).toISOString(),
            },
          },
        ],
        serviceProvider: {
          reference: `Organization/${organization}`,
        },
        identifier: [
          {
            system: `http://sys-ids.kemkes.go.id/encounter/${organization}`,
            value: "" + data.no_kunjungan,
          },
        ],
      },
    };

    if (data.kode_jenis_layanan === "RAJAL") {
      if (!data.satu_sehat_id_poliklinik) {
        throw {
          status: 400,
          message: "Poliklinik belum sync dengan satu sehat",
          data: null,
        };
      }
      payload.data.location = [
        {
          location: {
            reference: `Location/${data.satu_sehat_id_poliklinik}`,
            display: data.nama_poliklinik,
          },
        },
      ];
    } else {
      const poliUGD = await sq.query(
        `
                SELECT id, nama_poliklinik, satu_sehat_id
                FROM ms_poliklinik
                WHERE "deletedAt" IS NULL
                AND LOWER(nama_poliklinik) = 'ugd'
                LIMIT 1
            `,
        s,
      );

      if (!poliUGD || poliUGD.length === 0 || !poliUGD[0].satu_sehat_id) {
        throw {
          status: 400,
          message: "Poli UGD tidak ditemukan atau belum sync dengan satu sehat",
          data: null,
        };
      }

      payload.data.location = [
        {
          location: {
            reference: `Location/${poliUGD[0].satu_sehat_id}`,
            display: poliUGD[0].nama_poliklinik,
          },
        },
      ];
    }

    const encounterResponse = await axios_satu_sehat(
      payload.method,
      payload.uri,
      payload.data,
    );

    if (
      encounterResponse.data.issue &&
      encounterResponse.data.issue.length > 0
    ) {
      throw {
        status: encounterResponse.status || 400,
        message:
          encounterResponse.data.issue[0].details?.text ||
          "Gagal sync encounter",
        data: encounterResponse.data,
      };
    }

    if (!encounterResponse.data.id) {
      throw {
        status: 500,
        message: "Gagal mendapatkan ID encounter dari Satu Sehat",
        data: encounterResponse.data,
      };
    }

    await registrasi.update(
      {
        satu_sehat_id: encounterResponse.data.id,
        satu_sehat_status: status,
        satu_sehat_last_payload: payload.data,
      },
      {
        where: { id: registrasi_id },
      },
    );

    return {
      id: encounterResponse.data.id,
      encounter: encounterResponse.data,
    };
  }

  static async syncCondition(data, registrasi_id, encounter_id) {
    // GET DIAGNOSA
    const diagnosa = await sq.query(
      `SELECT * FROM data_diagnosa dd WHERE dd.registrasi_id = '${registrasi_id}'`,
      s,
    );

    const diagnosa_data = diagnosa.map((x) => {
      return {
        system: "http://hl7.org/fhir/sid/icd-10",
        code: x.kode_diagnosa,
        display: x.nama_diagnosa,
      };
    });

    if (diagnosa_data.length === 0) {
      return { id: null };
    }

    let payload = {
      uri: "Condition",
      method: "post",
      data: {
        resourceType: "Condition",
        clinicalStatus: {
          coding: [
            {
              system:
                "http://terminology.hl7.org/CodeSystem/condition-clinical",
              code: "active",
              display: "Active",
            },
          ],
        },
        category: [
          {
            coding: [
              {
                system:
                  "http://terminology.hl7.org/CodeSystem/condition-category",
                code: "encounter-diagnosis",
                display: "Encounter Diagnosis",
              },
            ],
          },
        ],
        code: {
          coding: diagnosa_data,
        },
        subject: {
          reference: `Patient/${data.satu_sehat_id_pasien}`,
          display: data.nama_lengkap,
        },
        encounter: {
          reference: `Encounter/${encounter_id}`,
          display: `Kunjungan ${data.nama_lengkap}`,
        },
      },
    };

    const conditionResponse = await axios_satu_sehat(
      payload.method,
      payload.uri,
      payload.data,
    );

    if (
      conditionResponse.data.issue &&
      conditionResponse.data.issue.length > 0
    ) {
      throw {
        status: conditionResponse.status || 400,
        message:
          conditionResponse.data.issue[0].details?.text ||
          "Gagal sync condition",
        data: conditionResponse.data,
      };
    }

    if (!conditionResponse.data.id) {
      throw {
        status: 500,
        message: "Gagal mendapatkan ID condition dari Satu Sehat",
        data: conditionResponse.data,
      };
    }

    await registrasi.update(
      {
        satu_sehat_condition_id: conditionResponse.data.id,
      },
      {
        where: { id: registrasi_id },
      },
    );

    return {
      id: conditionResponse.data.id,
      condition: conditionResponse.data,
    };
  }

  static async syncObservation(data, registrasi_id, encounter_id, heart_rate) {
    let payload = {
      uri: "Observation",
      method: "post",
      data: {
        resourceType: "Observation",
        status: "final",
        category: [
          {
            coding: [
              {
                system:
                  "http://terminology.hl7.org/CodeSystem/observation-category",
                code: "vital-signs",
                display: "Vital Signs",
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              system: "http://loinc.org",
              code: "8867-4",
              display: "Heart rate",
            },
          ],
        },
        subject: {
          reference: `Patient/${data.satu_sehat_id_pasien}`,
        },
        performer: [
          {
            reference: `Practitioner/${data.satu_sehat_id_dokter}`,
          },
        ],
        encounter: {
          reference: `Encounter/${encounter_id}`,
          display: `Pemeriksaan Heart rate ${data.nama_lengkap}`,
        },
        effectiveDateTime: heart_rate.date,
        issued: heart_rate.date,
        valueQuantity: {
          value: parseInt(heart_rate.value),
          unit: "beats/minute",
          system: "http://unitsofmeasure.org",
          code: "/min",
        },
      },
    };

    const observationResponse = await axios_satu_sehat(
      payload.method,
      payload.uri,
      payload.data,
    );

    if (
      observationResponse.data.issue &&
      observationResponse.data.issue.length > 0
    ) {
      throw {
        status: observationResponse.status || 400,
        message:
          observationResponse.data.issue[0].details?.text ||
          "Gagal sync observation",
        data: observationResponse.data,
      };
    }

    if (!observationResponse.data.id) {
      throw {
        status: 500,
        message: "Gagal mendapatkan ID observation dari Satu Sehat",
        data: observationResponse.data,
      };
    }

    await registrasi.update(
      {
        satu_sehat_observation_id: observationResponse.data.id,
      },
      {
        where: { id: registrasi_id },
      },
    );

    return {
      id: observationResponse.data.id,
      observation: observationResponse.data,
    };
  }

  static async syncProcedureRajal(data, registrasi_id, encounter_id) {
    const organization = process.env.SATU_SEHAT_ORGANIZATION_ID;
    const startDate = moment(data.tgl_registrasi).toISOString();

    let dataMedis = await assesmentMedisRjalan.findAll({
      where: {
        registrasi_id: registrasi_id,
      },
      limit: 1,
    });

    if (dataMedis.length === 0) {
      return { id: null };
    }

    const medis = dataMedis[0].json_assesment_medis_rjalan;

    let payloadServiceRequest = {
      uri: "ServiceRequest",
      method: "post",
      data: {
        resourceType: "ServiceRequest",
        identifier: [
          {
            system: `http://sys-ids.kemkes.go.id/servicerequest/${organization}`,
            value: "101010",
          },
        ],
        status: "active",
        intent: "original-order",
        priority: "routine",
        category: [
          {
            coding: [
              {
                system: "http://snomed.info/sct",
                code: "409063005",
                display: "Counseling",
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              system: "http://hl7.org/fhir/sid/icd-9-cm",
              code: "88.78",
              display: "Diagnostic ultrasound of gravid uterus",
            },
          ],
        },
        subject: {
          reference: `Patient/${data.satu_sehat_id_pasien}`,
        },
        encounter: {
          reference: `Encounter/${encounter_id}`,
        },
        occurrenceDateTime: startDate,
        authoredOn: startDate,
        requester: {
          reference: `Practitioner/${data.satu_sehat_id_dokter}`,
          display: `${data.nama_dokter}`,
        },
        performer: [
          {
            reference: `Practitioner/${data.satu_sehat_id_dokter}`,
            display: `${data.nama_dokter}`,
          },
        ],
        reasonCode: [
          {
            coding:
              medis.assesment?.diagnosa
                ?.filter((x) => x.tipe_diagnosa !== "Non ICD")
                .map((x) => ({
                  system: "http://hl7.org/fhir/sid/icd-10",
                  code: x.diagnosa.kode_diagnosa,
                  display: x.diagnosa.nama_diagnosa,
                })) || [],
          },
        ],
        note: [
          {
            text: "Pasien melakukan konseling terkait masalah penyakitnya",
          },
        ],
      },
    };

    const serviceRequestResponse = await axios_satu_sehat(
      payloadServiceRequest.method,
      payloadServiceRequest.uri,
      payloadServiceRequest.data,
    );

    if (
      serviceRequestResponse.data.issue &&
      serviceRequestResponse.data.issue.length > 0
    ) {
      throw {
        status: serviceRequestResponse.status || 400,
        message:
          serviceRequestResponse.data.issue[0].details?.text ||
          "Gagal sync service request",
        data: serviceRequestResponse.data,
      };
    }

    if (!serviceRequestResponse.data.id) {
      throw {
        status: 500,
        message: "Gagal mendapatkan ID service request dari Satu Sehat",
        data: serviceRequestResponse.data,
      };
    }

    let payloadProcedure = {
      uri: "Procedure",
      method: "post",
      data: {
        resourceType: "Procedure",
        basedOn: [
          {
            reference: `ServiceRequest/${serviceRequestResponse.data.id}`,
          },
        ],
        status: "completed",
        category: {
          coding: [
            {
              system: "http://snomed.info/sct",
              code: "409063005",
              display: "Counseling",
            },
          ],
        },
        code: {
          coding: [
            {
              system: "http://hl7.org/fhir/sid/icd-9-cm",
              code: "88.78",
              display: "Diagnostic ultrasound of gravid uterus",
            },
            {
              system: "http://snomed.info/sct",
              code: "445142003",
              display: "Counseling about disease",
            },
          ],
        },
        subject: {
          reference: `Patient/${data.satu_sehat_id_pasien}`,
          display: data.nama_lengkap,
        },
        encounter: {
          reference: `Encounter/${encounter_id}`,
        },
        performedPeriod: {
          start: startDate,
          end: startDate,
        },
        performer: [
          {
            actor: {
              reference: `Practitioner/${data.satu_sehat_id_dokter}`,
              display: `${data.nama_dokter}`,
            },
          },
        ],
        reasonCode: [
          {
            coding:
              medis.assesment?.diagnosa?.map((x) => ({
                system: "http://hl7.org/fhir/sid/icd-10",
                code: x.diagnosa.kode_diagnosa,
                display: x.diagnosa.nama_diagnosa,
              })) || [],
          },
        ],
        note: [
          {
            text: "Konseling keresahan pasien karena diagnosis",
          },
        ],
      },
    };

    const procedureResponse = await axios_satu_sehat(
      payloadProcedure.method,
      payloadProcedure.uri,
      payloadProcedure.data,
    );

    if (
      procedureResponse.data.issue &&
      procedureResponse.data.issue.length > 0
    ) {
      throw {
        status: procedureResponse.status || 400,
        message:
          procedureResponse.data.issue[0].details?.text ||
          "Gagal sync procedure",
        data: procedureResponse.data,
      };
    }

    if (!procedureResponse.data.id) {
      throw {
        status: 500,
        message: "Gagal mendapatkan ID procedure dari Satu Sehat",
        data: procedureResponse.data,
      };
    }

    await registrasi.update(
      {
        satu_sehat_request_service_id: serviceRequestResponse.data.id,
        satu_sehat_procedure_id: procedureResponse.data.id,
      },
      {
        where: { id: registrasi_id },
      },
    );

    return {
      serviceRequestId: serviceRequestResponse.data.id,
      procedureId: procedureResponse.data.id,
      serviceRequest: serviceRequestResponse.data,
      procedure: procedureResponse.data,
    };
  }

  static async syncPlanningRajal(data, registrasi_id, encounter_id) {
    const organization = process.env.SATU_SEHAT_ORGANIZATION_ID;
    const startDate = moment(data.tgl_registrasi).toISOString();

    let dataMedis = await assesmentMedisRjalan.findAll({
      where: {
        registrasi_id: registrasi_id,
      },
      limit: 1,
    });

    if (dataMedis.length === 0) {
      return { id: null };
    }

    const medis = dataMedis[0].json_assesment_medis_rjalan;

    let dataKep = await assesmentKeperawatanRjalan.findAll({
      where: {
        registrasi_id: registrasi_id,
      },
      limit: 1,
    });

    if (dataKep.length === 0) {
      return { id: null };
    }

    const kep = dataKep[0].json_assesment_keperawatan_rjalan;

    const note =
      kep && kep.planning && kep.planning.rencana
        ? kep.planning.rencana
        : undefined;
    if (!note) {
      return { id: null };
    }

    let payloadServiceRequest = {
      uri: "ServiceRequest",
      method: "post",
      data: {
        resourceType: "ServiceRequest",
        identifier: [
          {
            system: `http://sys-ids.kemkes.go.id/servicerequest/${organization}`,
            value: "00001",
          },
        ],
        status: "active",
        intent: "original-order",
        priority: "routine",
        category: [
          {
            coding: [
              {
                system: "http://snomed.info/sct",
                code: "3457005",
                display: "Patient referral",
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              system: "http://snomed.info/sct",
              code: "185389009",
              display: "Follow-up visit",
            },
          ],
          text: note,
        },
        subject: {
          reference: `Patient/${data.satu_sehat_id_pasien}`,
        },
        encounter: {
          reference: `Encounter/${encounter_id}`,
        },
        occurrenceDateTime: startDate,
        authoredOn: startDate,
        requester: {
          reference: `Practitioner/${data.satu_sehat_id_dokter}`,
          display: `${data.nama_dokter}`,
        },
        performer: [
          {
            reference: `Practitioner/${data.satu_sehat_id_dokter}`,
            display: `${data.nama_dokter}`,
          },
        ],
        reasonCode: [
          {
            coding:
              medis.assesment?.diagnosa
                ?.filter((x) => x.tipe_diagnosa !== "Non ICD")
                .map((x) => ({
                  system: "http://hl7.org/fhir/sid/icd-10",
                  code: x.diagnosa.kode_diagnosa,
                  display: x.diagnosa.nama_diagnosa,
                })) || [],
          },
        ],
        locationReference: [
          {
            reference: `Location/${data.satu_sehat_id_poliklinik}`,
            display: data.nama_poliklinik,
          },
        ],
        patientInstruction: note,
      },
    };

    const serviceRequestResponse = await axios_satu_sehat(
      payloadServiceRequest.method,
      payloadServiceRequest.uri,
      payloadServiceRequest.data,
    );

    if (
      serviceRequestResponse.data.issue &&
      serviceRequestResponse.data.issue.length > 0
    ) {
      throw {
        status: serviceRequestResponse.status || 400,
        message:
          serviceRequestResponse.data.issue[0].details?.text ||
          "Gagal sync planning",
        data: serviceRequestResponse.data,
      };
    }

    if (!serviceRequestResponse.data.id) {
      throw {
        status: 500,
        message: "Gagal mendapatkan ID planning dari Satu Sehat",
        data: serviceRequestResponse.data,
      };
    }

    await registrasi.update(
      {
        satu_sehat_tindak_lanjut_id: serviceRequestResponse.data.id,
      },
      {
        where: { id: registrasi_id },
      },
    );

    return {
      id: serviceRequestResponse.data.id,
      serviceRequest: serviceRequestResponse.data,
    };
  }

  static async syncClinicalImpressionRajal(
    data,
    registrasi_id,
    encounter_id,
  ) {
    let dataMedis = await assesmentMedisRjalan.findAll({
      where: {
        registrasi_id: registrasi_id,
      },
      limit: 1,
    });

    if (dataMedis.length === 0) {
      return { id: null };
    }

    const medis = dataMedis[0].json_assesment_medis_rjalan;

    // Ambil data subjective
    const keluhanUtama =
      medis.subjective?.keluhan_utama || "-";
    const riwayat =
      medis.subjective?.riwayat_kesehatan_saat_ini || "-";

    // Ambil data objective
    const pemeriksaanFisik =
      medis.objective?.pemeriksaan_fisik || "-";
    const nadi = medis.objective?.nadi
      ? `${medis.objective.nadi} x/menit`
      : "-";
    const suhu = medis.objective?.suhu
      ? `${medis.objective.suhu} °C`
      : "-";
    const sistolik = medis.objective?.sistolik || "-";
    const diastolik = medis.objective?.diastolik || "-";
    const bb = medis.objective?.berat_badan || "-";
    const tb = medis.objective?.tinggi_badan || "-";
    const imt = medis.objective?.index_masa_tubuh || "-";
    const gizi = medis.objective?.status_gizi || "-";

    // Ambil diagnosis (kalau ada)
    let diagnosisText = "";
    if (
      medis.assesment?.keperawatan &&
      medis.assesment.keperawatan.length > 0
    ) {
      const diag = medis.assesment.keperawatan[0];
      diagnosisText = `Diagnosis keperawatan: ${diag.diagnosa_keperawatan.nama_diagnosa} (${diag.diagnosa_keperawatan.kode_diagnosa}), status: ${diag.evaluasi_diagnosa}.`;
    }

    // Buat summary narasi
    const summary = `Pasien datang dengan keluhan utama: ${keluhanUtama}. 
          Riwayat kesehatan saat ini: ${riwayat}. 
          Pemeriksaan fisik: ${pemeriksaanFisik}, nadi ${nadi}, suhu ${suhu}, tekanan darah ${sistolik}/${diastolik} mmHg, BB ${bb} kg, TB ${tb} cm, IMT ${imt} (${gizi}). 
          ${diagnosisText}`
      .replace(/\s+/g, " ")
      .trim();

    let payload = {
      uri: "ClinicalImpression",
      method: "post",
      data: {
        resourceType: "ClinicalImpression",
        status: "completed",
        code: {
          coding: [
            {
              system: "http://snomed.info/sct",
              code: "44808001",
              display: "Clinical assessment",
            },
          ],
        },
        subject: {
          reference: `Patient/${data.satu_sehat_id_pasien}`,
          display: data.nama_lengkap,
        },
        encounter: {
          reference: `Encounter/${encounter_id}`,
        },
        effectiveDateTime: moment().toISOString(),
        date: moment().toISOString(),
        assessor: {
          reference: `Practitioner/${data.satu_sehat_id_dokter}`,
          display: data.nama_dokter,
        },
        summary: summary,
        prognosisCodeableConcept: [
          {
            coding: [
              {
                system: "http://snomed.info/sct",
                code: "170968001",
                display: "Prognosis good",
              },
            ],
          },
        ],
      },
    };

    const clinicalImpressionResponse = await axios_satu_sehat(
      payload.method,
      payload.uri,
      payload.data,
    );

    if (
      clinicalImpressionResponse.data.issue &&
      clinicalImpressionResponse.data.issue.length > 0
    ) {
      throw {
        status: clinicalImpressionResponse.status || 400,
        message:
          clinicalImpressionResponse.data.issue[0].details?.text ||
          "Gagal sync clinical impression",
        data: clinicalImpressionResponse.data,
      };
    }

    if (!clinicalImpressionResponse.data.id) {
      throw {
        status: 500,
        message: "Gagal mendapatkan ID clinical impression dari Satu Sehat",
        data: clinicalImpressionResponse.data,
      };
    }

    await registrasi.update(
      {
        satu_sehat_clinical_impression_id: clinicalImpressionResponse.data.id,
      },
      {
        where: { id: registrasi_id },
      },
    );

    return {
      id: clinicalImpressionResponse.data.id,
      clinicalImpression: clinicalImpressionResponse.data,
    };
  }

  static async syncDietRajal(data, registrasi_id, encounter_id) {
    const startDate = moment(data.tgl_registrasi).toISOString();

    let dataMedis = await assesmentMedisRjalan.findAll({
      where: {
        registrasi_id: registrasi_id,
      },
      limit: 1,
    });

    if (dataMedis.length === 0) {
      return { id: null };
    }

    const medis = dataMedis[0].json_assesment_medis_rjalan;

    if (!medis.planning) {
      return { id: null };
    }

    let diet_exclude_food_nutrient = medis.planning.diet_exclude_food_nutrient
      ? medis.planning.diet_exclude_food_nutrient.split("|")
      : ["", ""];
    let diet_nutrient = medis.planning.diet_nutrient
      ? medis.planning.diet_nutrient.split("|")
      : ["", ""];
    let diet_type = medis.planning.diet_type
      ? medis.planning.diet_type.split("|")
      : ["", ""];

    let payloadDiet = {
      uri: "NutritionOrder",
      method: "post",
      data: {
        resourceType: "NutritionOrder",
        status: "active",
        intent: "proposal",
        patient: {
          reference: `Patient/${data.satu_sehat_id_pasien}`,
        },
        encounter: {
          reference: `Encounter/${encounter_id}`,
        },
        dateTime: startDate,
        orderer: {
          reference: `Practitioner/${data.satu_sehat_id_dokter}`,
        },
        excludeFoodModifier: [
          {
            coding: [
              {
                system: "http://snomed.info/sct",
                code: diet_exclude_food_nutrient[0],
                display: diet_exclude_food_nutrient[1],
              },
            ],
          },
        ],
        oralDiet: {
          type: [
            {
              coding: [
                {
                  system: "http://snomed.info/sct",
                  code: diet_type[0],
                  display: diet_type[1],
                },
              ],
            },
          ],
          nutrient: [
            {
              modifier: {
                coding: [
                  {
                    system: "http://snomed.info/sct",
                    code: diet_nutrient[0],
                    display: diet_nutrient[1],
                  },
                ],
              },
              amount: {
                value: 2,
                unit: "L",
                system: "http://unitsofmeasure.org",
                code: "L",
              },
            },
          ],
        },
      },
    };

    const dietResponse = await axios_satu_sehat(
      payloadDiet.method,
      payloadDiet.uri,
      payloadDiet.data,
    );

    if (dietResponse.data.issue && dietResponse.data.issue.length > 0) {
      throw {
        status: dietResponse.status || 400,
        message:
          dietResponse.data.issue[0].details?.text || "Gagal sync diet",
        data: dietResponse.data,
      };
    }

    if (!dietResponse.data.id) {
      throw {
        status: 500,
        message: "Gagal mendapatkan ID diet dari Satu Sehat",
        data: dietResponse.data,
      };
    }

    await registrasi.update(
      {
        satu_sehat_diet_id: dietResponse.data.id,
      },
      {
        where: { id: registrasi_id },
      },
    );

    return {
      id: dietResponse.data.id,
      diet: dietResponse.data,
    };
  }

  static async syncKontrolRajal(data, registrasi_id, encounter_id) {
    const organization_id = process.env.SATU_SEHAT_ORGANIZATION_ID;
    const startDate = moment(data.tgl_registrasi).toISOString();

    let dataMedis = await assesmentMedisRjalan.findAll({
      where: {
        registrasi_id: registrasi_id,
      },
      limit: 1,
    });

    if (dataMedis.length === 0) {
      return { id: null };
    }

    const medis = dataMedis[0].json_assesment_medis_rjalan;

    if (!medis.planning) {
      return { id: null };
    }
    if (!medis.planning.tindak_lanjut_kontrol) {
      return { id: null };
    }

    let payloadServiceRequest = {
      uri: "ServiceRequest",
      method: "post",
      data: {
        resourceType: "ServiceRequest",
        identifier: [
          {
            system: `http://sys-ids.kemkes.go.id/servicerequest/${organization_id}`,
            value: "00001",
          },
        ],
        status: "active",
        intent: "original-order",
        priority: "routine",
        category: [
          {
            coding: [
              {
                system: "http://snomed.info/sct",
                code: "3457005",
                display: "Patient referral",
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              system: "http://snomed.info/sct",
              code: "185389009",
              display: "Follow-up visit",
            },
          ],
          text: `Kontrol ${medis.planning.tindak_lanjut_kontrol}`,
        },
        subject: {
          reference: `Patient/${data.satu_sehat_id_pasien}`,
        },
        encounter: {
          reference: `Encounter/${encounter_id}`,
        },
        occurrenceDateTime: startDate,
        authoredOn: startDate,
        requester: {
          reference: `Practitioner/${data.satu_sehat_id_dokter}`,
          display: `${data.nama_dokter}`,
        },
        performer: [
          {
            reference: `Practitioner/${data.satu_sehat_id_dokter}`,
            display: `${data.nama_dokter}`,
          },
        ],
        reasonCode: [
          {
            coding:
              medis.assesment?.diagnosa
                ?.filter((x) => x.tipe_diagnosa !== "Non ICD")
                .map((x) => ({
                  system: "http://hl7.org/fhir/sid/icd-10",
                  code: x.diagnosa.kode_diagnosa,
                  display: x.diagnosa.nama_diagnosa,
                })) || [],
          },
        ],
        locationReference: [
          {
            reference: `Location/${data.satu_sehat_id_poliklinik}`,
            display: data.nama_poliklinik,
          },
        ],
        patientInstruction: `Kontrol setelah ${medis.planning.tindak_lanjut_kontrol} istirahat di rumah. Dalam keadaan darurat dapat menghubungi hotline Fasyankes`,
      },
    };

    const kontrolResponse = await axios_satu_sehat(
      payloadServiceRequest.method,
      payloadServiceRequest.uri,
      payloadServiceRequest.data,
    );

    if (kontrolResponse.data.issue && kontrolResponse.data.issue.length > 0) {
      throw {
        status: kontrolResponse.status || 400,
        message:
          kontrolResponse.data.issue[0].details?.text ||
          "Gagal sync kontrol",
        data: kontrolResponse.data,
      };
    }

    if (!kontrolResponse.data.id) {
      throw {
        status: 500,
        message: "Gagal mendapatkan ID kontrol dari Satu Sehat",
        data: kontrolResponse.data,
      };
    }

    await registrasi.update(
      {
        satu_sehat_kontrol_kembali_id: kontrolResponse.data.id,
      },
      {
        where: { id: registrasi_id },
      },
    );

    return {
      id: kontrolResponse.data.id,
      serviceRequest: kontrolResponse.data,
    };
  }

  static async syncAlergiIntoleranRajal(
    data,
    registrasi_id,
    encounter_id,
  ) {
    const organization_id = process.env.SATU_SEHAT_ORGANIZATION_ID;
    const startDate = moment(data.tgl_registrasi).toISOString();

    let dataMedis = await assesmentMedisRjalan.findAll({
      where: {
        registrasi_id: registrasi_id,
      },
      limit: 1,
    });

    if (dataMedis.length === 0) {
      return { id: null };
    }

    const medis = dataMedis[0].json_assesment_medis_rjalan;

    if (!medis.subjective) {
      return { id: null };
    }
    if (!medis.subjective.riwayat_alergi_kfa_id) {
      return { id: null };
    }

    const coding = medis.subjective.riwayat_alergi_kfa_id.split("|");
    if (coding.length < 2) {
      return { id: null };
    }

    let payloadAllergy = {
      uri: "AllergyIntolerance",
      method: "post",
      data: {
        resourceType: "AllergyIntolerance",
        identifier: [
          {
            system: `http://sys-ids.kemkes.go.id/allergy/${organization_id}`,
            use: "official",
            value: "2024011234888",
          },
        ],
        clinicalStatus: {
          coding: [
            {
              system:
                "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
              code: "active",
              display: "Active",
            },
          ],
        },
        verificationStatus: {
          coding: [
            {
              system:
                "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification",
              code: "confirmed",
              display: "Confirmed",
            },
          ],
        },
        category: ["medication"],
        code: {
          coding: [
            {
              system: "http://sys-ids.kemkes.go.id/kfa",
              code: coding[0],
              display: coding[1],
            },
          ],
          text: medis.subjective.riwayat_alergi_text,
        },
        patient: {
          reference: `Patient/${data.satu_sehat_id_pasien}`,
          display: data.nama_lengkap,
        },
        encounter: {
          reference: `Encounter/${encounter_id}`,
          display: `Kunjungan ${data.nama_lengkap} di hari ${moment(
            data.tgl_registrasi,
          ).format("dddd, DD MMMM YYYY")}`,
        },
        recordedDate: startDate,
        recorder: {
          reference: `Practitioner/${data.satu_sehat_id_dokter}`,
        },
      },
    };

    const allergyResponse = await axios_satu_sehat(
      payloadAllergy.method,
      payloadAllergy.uri,
      payloadAllergy.data,
    );

    if (allergyResponse.data.issue && allergyResponse.data.issue.length > 0) {
      throw {
        status: allergyResponse.status || 400,
        message:
          allergyResponse.data.issue[0].details?.text ||
          "Gagal sync alergi intoleran",
        data: allergyResponse.data,
      };
    }

    if (!allergyResponse.data.id) {
      throw {
        status: 500,
        message: "Gagal mendapatkan ID alergi intoleran dari Satu Sehat",
        data: allergyResponse.data,
      };
    }

    await registrasi.update(
      {
        satu_sehat_alleri_intoleran_id: allergyResponse.data.id,
      },
      {
        where: { id: registrasi_id },
      },
    );

    return {
      id: allergyResponse.data.id,
      allergyIntolerance: allergyResponse.data,
    };
  }
}

module.exports = Service;
