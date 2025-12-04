require('dotenv').config({})

const { Sequelize } = require('sequelize');


const sq = new Sequelize(process.env.DB_NAME,process.env.DB_USER,process.env.DB_PASS, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIAL,
    logging:false,
    dialectOptions:{
      dateStrings: true,
      typeCast: true,
    },
    pool: {
      max: 1000,
      min: 0,
      idle: 200000,
      acquire: 1000000,
    },
    timezone: '+07:00',
    define: {
      comment: false,
    },
    // logging: (query) => console.log(query),
  });

  // console.log(sq);

  if(process.env.DB_NAME == 'BUSEL') console.log(`===== WARNING ! DB-PRODUCTION (${process.env.DB_NAME}) =====`);
  else console.log(`++++++ DB-DEVELOPMENT (${process.env.DB_NAME}) ++++++`);

  module.exports = {sq}