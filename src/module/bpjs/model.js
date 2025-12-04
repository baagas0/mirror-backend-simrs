const { DataTypes } = require("sequelize");
const { sq } = require("../../config/connection");

const antrianBpjsLog = sq.define(
  "antrian_bpjs_log",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kode_booking: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    waktu: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    task_id: {
      type: DataTypes.STRING,
      // type: DataTypes.ENUM('1', '2', '3', '4', '5', '6', '7', '99'),
      allowNull: true,
      defaultValue: '1',
      // comment: '1=mulai tunggu admisi, 2=akhir tunggu admisi, 3=akhir layan admisi, 4=akhir tunggu poli, 5=akhir layan poli, 6=tunggu farmasi, 7=selesai farmasi, 99=batal'
    },
    payload: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    response: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    timestamps: true, // Akan menambahkan createdAt dan updatedAt
    paranoid: true,   // Soft delete (deletedAt)
    freezeTableName: true,
    indexes: [
      {
        fields: ['kode_booking']
      },
      {
        fields: ['waktu']
      },
      {
        fields: ['kode_booking', 'task_id']
      }
    ]
  }
);

module.exports = antrianBpjsLog;