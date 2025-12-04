const { sq } = require("../config/connection");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT }

const Validator = require('validatorjs');

Validator.registerAsync("nullable", async (value, params, req, passes) => {
    passes(true);
});

Validator.registerAsync("uniq", async (value, params, req, passes) => {
    console.log(value, params, req);
    let param = params.split(',');
    console.log(param)
    let and_condition = "";
    if (param[2] && param[3]) {
        and_condition = `and ${param[2]} != '${param[3]}'`;
    }

    let check = await sq.query(
        `select id,${param[1]} from ${param[0]} where ${param[1]} = '${value}' ${and_condition} `, s
    );

    console.log(check);

    if (check.length == 0) {
        passes(true);
    }

    passes(false, `property ${req} must be unique.`);
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

class DataValidation{

    static Check(sourceRules){
        return async (req, res, next) => {
            let rules = {};
            if(typeof sourceRules == 'function') {
                rules = sourceRules(req, res);
            } else {
                rules = sourceRules;
            }
            
            const validator = new Validator(req.body, rules);

            validator.checkAsync(() => {
                console.log('valid');
                next();
            }, () => {
                res.status(422).json({status:422, message: "Data tidak valid", data:validator.errors});
            });
        }
    }

}

module.exports = DataValidation;
