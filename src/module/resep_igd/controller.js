const resepIgd = require('./model');
const registrasi = require('../registrasi/model');
const {
  sq
} = require("../../config/connection");
const {
  v4: uuid_v4
} = require("uuid");
const {
  QueryTypes,
  Op
} = require('sequelize');
const s = {
  type: QueryTypes.SELECT
}

// const resepIgd = require("../resep_igd/model");
const resepDetailIgd = require("../resep_detail_igd/model");
const resepRacikIgd = require("../resep_racik_igd/model");
const assesment_medis_igd = require('../assesment_medis_igd/model');

class Controller {

  static async syncWithAssesmenIgd(req, res) {
    const t = await sq.transaction()
    const { registrasi_id } = req.body;

    try {
      const retrieveResep = await resepIgd.findOne({where:{registrasi_id}})
      const assesmen = await assesment_medis_igd.findOne({where:{registrasi_id}})
      console.log(assesmen)
      let json_assesment_medis_igd = {};

      // CEK DATA ASSESMEN
      if (assesmen && assesmen.dataValues && assesmen.dataValues.json_assesment_medis_igd && assesmen.dataValues.json_assesment_medis_igd.planning && assesmen.dataValues.json_assesment_medis_igd.planning.obat_jadi && assesmen.dataValues.json_assesment_medis_igd.planning.obat_racikan) {
        json_assesment_medis_igd = assesmen.dataValues.json_assesment_medis_igd
      } else {
        res.status(500).json({ status: 500, message: "Data obat tidak ditemukan pada assesmen ini.", data: [] })
        return "Data obat tidak ditemukan pada assesmen ini."
      }

      if(!retrieveResep){
        const id=uuid_v4();
        const createResep = await resepIgd.create({id,registrasi_id,createdBy:req.dataUsers.id},{transaction:t})
        let dataBulkRacik = [];
        let dataBulkDetail = [];
        for(let item of json_assesment_medis_igd.planning.obat_racikan){
          let idResepRacik = uuid_v4();
          dataBulkRacik.push({
            id:idResepRacik,
            resep_igd_id:id,
            nama_racik:item.nama_obat,
            qty:item.jumlah,
            signa:item.signa,
            satuan:item.nama_satuan,
            kronis:item.kronis,
            aturan_pakai:item.aturan_pakai
          })
          for(let itemm of item.obat_jadi){
            dataBulkDetail.push({
              id:uuid_v4(),
              resep_id:id,
              resep_racik_igd_id:idResepRacik,
              awal_id_obat:itemm.nama_obat.id,
              awal_nama_obat:itemm.nama_obat.nama_barang,
              awal_signa:itemm.signa,
              awal_harga:itemm.nama_obat.harga_pokok,
              awal_qty:itemm.jumlah,
              awal_satuan:itemm.nama_obat.nama_satuan,
              awal_aturan_pakai:itemm.aturan_pakai,
              final_id_obat:itemm.nama_obat.id,
              final_nama_obat:itemm.nama_obat.nama_barang,
              final_signa:itemm.signa,
              final_harga:itemm.nama_obat.harga_pokok,
              final_qty:itemm.jumlah,
              final_satuan:itemm.nama_obat.nama_satuan,
              final_aturan_pakai:itemm.aturan_pakai
            })
          }
        }
        for(let item of json_assesment_medis_igd.planning.obat_jadi){
          dataBulkDetail.push({
            id:uuid_v4(),
            resep_id:id,
            awal_id_obat:item.nama_obat.id,
            awal_nama_obat:item.nama_obat.nama_barang,
            awal_signa:item.signa,
            awal_harga:item.nama_obat.harga_pokok,
            awal_qty:item.jumlah,
            awal_satuan:item.nama_obat.nama_satuan,
            awal_aturan_pakai:item.aturan_pakai,
            final_id_obat:item.nama_obat.id,
            final_nama_obat:item.nama_obat.nama_barang,
            final_signa:item.signa,
            final_harga:item.nama_obat.harga_pokok,
            final_qty:item.jumlah,
            final_satuan:item.nama_obat.nama_satuan,
            final_aturan_pakai:item.aturan_pakai
          })
        }
        await resepRacikIgd.bulkCreate(dataBulkRacik,{transaction:t})
        await resepDetailIgd.bulkCreate(dataBulkDetail,{transaction:t})
      } else {
        res.status(500).json({ status: 500, message: "Kunjungan ini sudah memiliki resep", data: [] })
      }

      await t.commit()
      res.status(200).json({ status: 200, message: "sukses", data: [] })

    } catch (err) {
      console.error('Error syncWithAssesmenIgd')
      console.log(req.body);
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err });
    }
  }

  static register(req, res) {
    resepIgd.create({
      id: uuid_v4(),
      createdBy: req.dataUsers.id,
      ...req.body
    }).then(hasil => {
      res.status(200).json({
        status: 200,
        message: "sukses",
        data: hasil
      })
    }).catch(error => {
      console.log(error);
      res.status(500).json({
        status: 500,
        message: "gagal",
        data: error
      })
    })
  }

  static update(req, res) {
    resepIgd.update({
      ...req.body,
      updatedBy: req.dataUsers.id
    }, {
      where: {
        id: req.body.id
      }
    }).then(hasil => {
      res.status(200).json({
        status: 200,
        message: "sukses"
      })
    }).catch(error => {
      console.log(error);
      res.status(500).json({
        status: 500,
        message: "gagal",
        data: error
      })
    })
  }

  static async list(req, res) {

    try {
      let data = await sq.query(`select rr.id as id_resep_igd, * from resep_igd rr
                left join registrasi r on rr.registrasi_id=r.id
                where rr."deletedAt" isnull and r."deletedAt" isnull`, s)
      // console.log(data);
      res.status(200).json({
        status: 200,
        message: "sukses",
        data
      })
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: 500,
        message: "gagal",
        data: error
      })
    }

  }

  static async detailsById(req, res) {
    const {
      id
    } = req.body
    try {
      let data = await sq.query(`select rr.id as id_resep_igd, * from resep_igd rr
                left join registrasi r on rr.registrasi_id=r.id
                where rr."deletedAt" isnull and r."deletedAt" isnull and rr.id = '${id}'`, s)
      res.status(200).json({
        status: 200,
        message: "sukses",
        data
      })
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "gagal",
        data: error
      })
    }
  }
  static async delete(req, res) {
    const {
      id
    } = req.body;
    try {
      await resepIgd.update({
        deletedBy: req.dataUsers.id
      }, {
        where: {
          id
        }
      });
      await resepIgd.destroy({
        where: {
          id
        }
      });
      return res.status(200).json({
        status: 200,
        message: "sukses"
      })
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "gagal",
        data: error
      })
    }
  }
  static async listWithParam(req, res) {
    const {
      registrasi_id,
      tahap_resep
    } = req.body;
    let params = {};
    if (registrasi_id) params.registrasi_id = registrasi_id;
    if (tahap_resep) params.tahap_resep = tahap_resep;
    resepIgd.findAll({
      where: params
    }).then(hasil => {
      res.status(200).json({
        status: 200,
        message: "sukses",
        data: hasil
      })
    }).catch(error => {
      console.log(error);
      res.status(500).json({
        status: 500,
        message: "gagal",
        data: error
      })
    })
  }
  static async getWithDetailResep(req, res) {
    const {
      id
    } = req.body;
    let params = {};
    if (id) params.id = id;
    try {
      const data = await resepIgd.findAll({
        where: params,
        include: [{
          model: registrasi,
          as: 'registrasi'
        }]
      });
      for (let i = 0; i < data.length; i++) {
        const element = data[i];
        const detail = await sq.query(`select * from resep_detail_igd where resep_id='${element.id}'`, s);
        element.dataValues.detail = detail;
      }
      res.status(200).json({
        status: 200,
        message: "sukses",
        data
      })
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: 500,
        message: "gagal",
        data: error
      })
    }

  }
}

module.exports = Controller