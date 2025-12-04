const { matches } = require("lodash");
const { sq } = require("../config/connection");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT }

// const Validator = require("../util/node-input-validator");
// const {Validator} = require('node-input-validator');
const Validator = require('validatorjs');

// Validator.extend("uuid", (field, value) => {
//     return validate(value);
// });
// Validator.extend("double", (field, value) => {
//     var m = (""+value).match(/^\d{0,2}(?:\.\d{0,2}){0,1}$/);
    
//     if (!m) {
//         return false
//     }
//     else {
//         return true
//     }
// });
// Validator.extend("float", (field, value) => {
//     let parse = parseFloat(value);
//     if (parse == null || parse == undefined || isNaN(parse)) return false;
//     return typeof (parseFloat(value) === Number);
// });
// Validator.extend("datetime", (field, value) => {
//     try {
//         return moment(value).format("YYYY-MM-DD H:mm:ss");
//     } catch {
//         return true;
//     }
// });

// Validator.extend("time", (field, value) => {
//     try {
//         return moment(`2000-01-01 ${value}`).format("YYYY-MM-DD H:mm:ss");
//     } catch {
//         return true;
//     }
// });

// Validator.extend("phone", (field, value) => {
//     const regex =
//         /(\+62 ((\d{3}([ -]\d{3,})([- ]\d{4,})?)|(\d+)))|(\(\d+\) \d+)|\d{3}( \d+)+|(\d+[ -]\d+)|\d+/;
//     let validRegex = regex.test(value);
//     let validPhone = false;
//     if (value.substring(0, 2) == "62" || value.substring(0, 2) == "08") {
//         validPhone = true;
//     }
//     if (validRegex && validPhone) return true;
//     else return false;
// });

Validator.registerAsync("unique", async (value, params, req, passes) => {
    let and_condition = "";
    if (params[2] && params[3]) {
        and_condition = `and ${params[2]} != '${params[3]}'`;
    }

    let check = await sq.query(
        `select id,${params[1]} from ${params[0]} where ${params[1]} = '${value}' ${and_condition} `, s
    );

    if (check.length == 0) {
        passes(false, `property ${req} must be unique.`);
    }

    passes();
});

Validator.registerAsync("exist", async (value, params, req, passes) => {
    // console.log(value, params, req);
    let param = params.split(',');

    let check = await sq.query(
        `select ${param[1]} from ${param[0]} where ${param[1]} = '${value}' `, s
    );
    
    if (check.length == 0) {
        passes(false, `property ${req} doesnt exist on data.`);
    }
    
    passes(true, "COBAIN AJH");
});

function valid(res, data, rules ) {
    const validator = new Validator(data, rules);
    return {
        passed: true,
        errors: {}
    }

    let response = {};
    return validator.fails(function() {
        return {
            passed: false,
            errors: validator.errors
        }
    });

    // validator.passes(function() {
    //     return {
    //         passed: false,
    //         errors: {}
    //     }
    // });
    
    // return response;            
}

module.exports = {valid}
