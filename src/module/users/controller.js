const user = require('./model')
const roles = require('../roles/model')

const { sq } = require("../../config/connection");
const bcrypt = require("../../helper/bcrypt.js");
const jwt = require("../../helper/jwt");
const pre_jwt = require("../../helper/pre_jwt");
const { v4: uuid_v4 } = require("uuid");

const { createClient } = require("redis");
const users = require('./model');
const client = createClient({ url: `redis://${process.env.HOST_REDIS}:${process.env.PORT_REDIS}`, legacyMode: true });
client.connect().catch(console.error)

function createSuperUser() {
    let encryptedPassword = bcrypt.hashPassword(process.env.ADMINPASS);
    user.findOrCreate({ where: { id: 'admin' }, defaults: { id: 'admin', username: "RS_admin", password: encryptedPassword, role: "admin" } }).then(async (dataUser) => {
        // if(data[0]._options.isNewRecord) {
            roles.findOrCreate({ where: { name: 'Super Admin' }, defaults: { id: uuid_v4(), name: "Super Admin" } }).then(async (dataRole) => {
                let check = await sq.query(`select user_id, role_id from user_roles where role_id = '${dataRole[0].dataValues.id}' and user_id = '${dataUser[0].dataValues.id}'`);
                // console.log('asd1')
                // console.log(check[0]);
                if(check[0].length == 0) {
                    console.log('asd')
                    try {
                        await sq.query(`insert into user_roles ("createdAt", "updatedAt", "role_id", "user_id") values ('2023-03-21 00:00:00.000 +0700', '2023-03-21 00:00:00.000 +0700', '${dataRole[0].dataValues.id}', '${dataUser[0].dataValues.id}')`)
                    } catch (error) {
                        console.log(error)
                    }
                }
            })
        // }
    }).catch(err => {
        console.log(err);   
    })
}
createSuperUser()
class Controller {

    static register(req, res) {
        const { username, password, role } = req.body;
        let encryptedPassword = bcrypt.hashPassword(password);
        user.findAll({ where: { username } }).then(async data => {
            if (data.length) {
                res.status(201).json({ status: 204, message: "username sudah terdaftar" });
            } else {
                await user.create({ id: uuid_v4(), username, password: encryptedPassword, role }, { returning: true })
                    .then((respon) => {
                        res.status(200).json({ status: 200, message: "sukses", data: respon });
                    })
            }
        })
    }

    static update(req, res) {
        const { id, username, role, password } = req.body;
        let encryptedPassword = bcrypt.hashPassword(password);
        user.update({ username, role, password: encryptedPassword }, { where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses", data: data });
        }).catch(err => {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static delete(req, res) {
        const { id } = req.body;

        user.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static pre_login(req, res) {
        const { username, password } = req.body;

        user.findAll({ include: ["UserRole"], where: { username } }).then(async data => {
            if (data.length > 0) {
                let dataToken = {
                    id: data[0].id,
                    username: data[0].username,
                    password: data[0].password,
                    role: data[0].role
                };
                let hasil = bcrypt.compare(password, data[0].dataValues.password);
                if (hasil) {
                    res.status(200).json({ 
                        status: 200, 
                        message: "sukses", 
                        token: pre_jwt.generateToken(dataToken), 
                        id: data[0].id,
                        roles: data[0].UserRole, 
                    });
                } else {
                    res.status(422).json({ status: 422, message: "Password Salah" });
                }
            } else {
                res.status(422).json({ status: 422, message: "username Tidak Terdaftar" });
            }
        }).catch((err) => {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }
    
    static login(req, res) {
        const { role_id } = req.body;
        
        roles.findOne({ where: { id: ""+role_id } }).then(role => {
            let dataUsers = req.dataUsers;
            dataUsers.role_id = role.dataValues.id;
            dataUsers.role = role.dataValues.name;

            delete dataUsers.iat;
            delete dataUsers.exp;

            console.log(dataUsers);
            
            const token = jwt.generateToken(dataUsers);

            /**
             * 180 = 3 menit
             */
            client.setEx(`tkn_${dataUsers.username}_${dataUsers.id}`, 18000, token);

            res.status(200).json({ 
                status: 200, 
                message: "sukses",
                token: token,
                id: dataUsers.id,
                user: dataUsers
            });
        }).catch(err => {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        });

    }

    static list(req, res) {

        user.findAll({ order: [['createdAt', 'DESC']] }).then(data => {
            res.status(200).json({ status: 200, message: "sukses", data });
        }).catch(err => {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static detailsById(req, res) {
        const { id } = req.body

        user.findAll({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses", data });
        }).catch(err => {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async mappingRoleUser(req, res) {
        let { user_id, search }  = req.body

        try {
            let role = await users.findAll({ where: { id: user_id } });
            role = role[0]

            let offset = req.body.halaman ? ((req.body.halaman-1)*req.body.limit) : 0
            let limit = req.body.limit ? req.body.limit : 99999999
            let searchQ = ''
            if(search) searchQ = `and A.name ilike '%${search}%'`

            const sql = `
                select
                    A.* ,
                    case
                        when B.user_id is null then 0
                        else 1
                    end as active
                from
                    roles A
                left join user_roles B on
                    B.role_id = A.id
                    and B.user_id = '${user_id}'
                where true
                    ${searchQ}
                    
                offset ${offset} limit ${limit}`;
            console.log(sql)
            let data = await sq.query(sql)
            console.log(data)
            let dataTotal = await sq.query(`select count(A.id) from roles A where true ${searchQ}`)
            role.dataValues.data = data[0]
            role.dataValues.count = parseInt(dataTotal[0][0].count)

            res.status(200).json([role])
        } catch (error) {
            console.log(error)
            res.status(200).json({ status: 203, message: "gagal", error })
        }
    }

    static async mappingRoleUserRegister(req, res) {
        try {
            let { active, user_id, role_id } = req.body

            if(active) {
                let access = await sq.query(`select A.* from user_roles A where A.user_id = '${user_id}' and A.role_id = '${role_id}'`)
                if (access[0].length === 0) {
                    await sq.query(`
                        INSERT INTO user_roles
                        ("createdAt", "updatedAt", user_id, role_id)
                        VALUES('2023-03-27 15:31:39.067', '2023-03-27 15:31:39.067', '${user_id}', '${role_id}');
                    `)
                }
            } else {
                await sq.query(`
                    DELETE FROM user_roles
                    WHERE user_id='${user_id}' AND role_id='${role_id}';
                `)
            }

            res.status(200).json({ status: 200, message: "Berhasil" }); 
        } catch (error) {
            res.status(200).json({ status: 203, message: "gagal", error })
        }
    }
}



module.exports = Controller
