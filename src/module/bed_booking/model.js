const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');
const registrasi=require('../registrasi/model')
const msBed=require('../ms_bed/model')

const bedBooking = sq.define('bed_booking',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    keterangan_bed_booking:{
        type:DataTypes.STRING
    },
    // status_bed_booking:{
    //     type:DataTypes.SMALLINT             //0:kosong, 1:booked
    // }
},
{
paranoid:true,
freezeTableName:true
});

bedBooking.belongsTo(registrasi,{foreignKey:"registrasi_id"})
registrasi.hasMany(bedBooking,{foreignKey:"registrasi_id"})

bedBooking.belongsTo(msBed,{foreignKey:"ms_bed_id"})
msBed.hasMany(bedBooking,{foreignKey:"ms_bed_id"})


module.exports = bedBooking