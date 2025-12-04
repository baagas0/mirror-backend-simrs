const roles = require('./model')
const { sq } = require("../../config/connection");
const bcrypt = require("../../helper/bcrypt.js");
const jwt = require("../../helper/jwt");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const {treeMenu} = require("../../helper/general");

class Controller {

    static async getMenuAccess(req, res) {
        const { role_id } = req.params;
        const id = req.params.role_id;
        
        try {
            let data = await sq.query(`
                select
                    case when a.type = 1 then 'CSidebarNavDropdown' else 'CSidebarNavItem' end as "_name",
                        a.id,
                        case when a.parent_code is null then '' else a.parent_code end as parent_code,
                        a.code,
                        a.icon,
                        a.route,
                        a.name,
                        a.level,
                        a.type,
                        case when b.menu_id is not null then true else false end as status,
                        (
                            select jsonb_agg(jsonb_build_object(
                                'id', c.id,
                                'code', c.code,
                                'parent_code', case when c.parent_code is null then '' else c.parent_code end,
                                'name', c.name,
                                'route', c.route,
                                'status', case when d.menu_id is not null then true else false end
                            ))
                            from menu c
                                left join role_access d on d.menu_id = c.id and d.role_id = '${role_id}'
                            where true 
                                and c.parent_code = a.code
                                and c.type = 3
                        ) as function_lists
                    from menu a
                        left join role_access b on b.menu_id = a.id and b.role_id = '${role_id}'
                    where a.type in (1,2)
                    order by a.seq
            `);

            res.status(200).json({ status: 200, data: treeMenu(data[0]) })
        } catch (error) {
            console.log(error)
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }        
    }

    static async registerMenuAccess(req, res) {
        const { menu_ids } = req.body;
        const { role_id } = req.params;
        // const date = new Date().getDate();
        const date = '2023-03-21 00:00:00.000 +0700';
        console.log(date);
        console.log(menu_ids)


        try {
            /** Delete role_access */
            await sq.query(`
                delete from role_access where role_id = '${role_id}'
            `);

            if(menu_ids.length) {
                let insertValue = [];
                console.log('insertValue', insertValue);
                for (const menu_id of menu_ids) {
                    insertValue.push(`('${date}', '${date}', '${role_id}', '${menu_id}')`);
                }
                console.log(insertValue);
    
                /** Insert user role */
                const sql = `
                    insert into role_access ("createdAt", "updatedAt", "role_id", "menu_id")
                    values ${insertValue.join(',')}
                `;
                console.log(sql);
                let data = await sq.query(sql);
            }

            res.status(200).json({ status: 200, message: "sukses" })
        } catch (error) {
            console.log(error)
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async getUserAccess(req, res) {
        const { role_id } = req.params;
        const id = req.params.role_id;
        
        try {
            const data = await sq.query(`
                select
                    data_table.status,
                    case when data_table.status = 1 then 'selected' else 'unselected' end as position,
                    jsonb_agg(
                        json_build_object(
                            'id', data_table.id,
                            'label', data_table.username,
                            'username', data_table.username
                        )  
                    ) as list
                from (
                    select
                        a.id,
                        a.username,
                        case when b."createdAt" is not null then 1 else 0 end as status
                    from users a
                    left join user_roles b on b.user_id = a.id and b.role_id = '${role_id}'
                ) as data_table

                group by data_table.status
            `);

            let response = {};
            for (const item of data[0]) {
                response[item.position] = item;
            }
            if(!response.selected) {
                response.selected = [];
            } else if(!response.unselected) {
                response.unselected = [];
            }

            res.status(200).json({ status: 200, data: response })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
        
    }

    static async registerUserAccess(req, res) {
        const { user_ids } = req.body;
        const { role_id } = req.params;
        // const date = new Date().getDate();
        const date = '2023-03-21 00:00:00.000 +0700';
        console.log(date);


        try {
            /** Delete user_roles */
            await sq.query(`
                delete from user_roles where role_id = '${role_id}'
            `);

            if(user_ids.length) {
                let insertValue = [];
                console.log('insertValue', insertValue);
                for (const user_id of user_ids) {
                    insertValue.push(`('${date}', '${date}', '${role_id}', '${user_id}')`);
                }
                console.log(insertValue);
    
                /** Insert user role */
                const sql = `
                    insert into user_roles ("createdAt", "updatedAt", "role_id", "user_id")
                    values ${insertValue.join(',')}
                `;
                console.log(sql);
                let data = await sq.query(sql);
            }

            res.status(200).json({ status: 200, message: "sukses" })
        } catch (error) {
            console.log(error)
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static register(req, res) {
        const { name } = req.body;
        
        roles.findAll({ where: { name: { [Op.iLike]: name } }}).then(async data => {
            if (data.length) {
                res.status(201).json({ status: 204, message: "Nama role sudah terdaftar" });
            } else {
                await roles.create({ id: uuid_v4(), name }, { returning: true })
                    .then((respon) => {
                        res.status(200).json({ status: 200, message: "sukses", data: respon });
                    })
            }
        })
    }

    static update(req, res) {
        const { id, name } = req.body;

        roles.update({ name }, { where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(err)
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static delete(req, res) {
        const { id } = req.body;

        roles.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static login(req, res) {
        const { username, password } = req.body;

        roles.findAll({ where: { username } }).then(async data => {
            if (data.length > 0) {
                let dataToken = {
                    id: data[0].id,
                    username: data[0].username,
                    password: data[0].password,
                    role: data[0].role
                };
                let hasil = bcrypt.compare(password, data[0].dataValues.password);
                if (hasil) {
                    res.status(200).json({ status: 200, message: "sukses", token: jwt.generateToken(dataToken), id: data[0].id });
                } else {
                    res.status(200).json({ status: 200, message: "Password Salah" });
                }
            } else {
                res.status(200).json({ status: 200, message: "username Tidak Terdaftar" });
            }
        }).catch((err) => {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static list(req, res) {

        roles.findAll({ order: [['createdAt', 'DESC']] }).then(data => {
            return res.status(200).json({ status: 200, message: "sukses", data });
        }).catch(err => {
            console.log(err);
            return res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static detailsById(req, res) {
        const { id } = req.body

        roles.findAll({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses", data });
        }).catch(err => {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static managementAccess(req, res) {
        const { role_id, user_ids } = req.body;
    }

    static async mappingRoleMenu(req, res) {
        let { role_id, search }  = req.body

        try {
            let role = await roles.findAll({ where: { id: role_id } });
            role = role[0]

            let offset = req.body.halaman ? ((req.body.halaman-1)*req.body.limit) : 0
            let limit = req.body.limit ? req.body.limit : 99999999
            let searchQ = ''
            if(search) searchQ = `and A.name ilike '%${search}%'`
            let data = await sq.query(`
                select
                    A.*,
                    case when B.menu_id is null then 0 else 1 end as active
                from menu A
                left join role_access B on B.menu_id = A.id and B.role_id = '${role_id}'
                where true
                    and A.type in (1,2)
                    ${searchQ}
                    
                offset ${offset} limit ${limit}`
            )
            let dataTotal = await sq.query(`select count(A.id) from menu A where true and A.type in (1,2) ${searchQ}`)
            role.dataValues.data = data[0]
            role.dataValues.count = parseInt(dataTotal[0][0].count)

            res.status(200).json([role])
        } catch (error) {
            res.status(200).json({ status: 203, message: "gagal", error })
        }
    }

    static async mappingRoleMenuRegister(req, res) {
        try {
            let { active, menu_id, role_id } = req.body

            if(active) {
                let access = await sq.query(`select A.* from role_access A where A.menu_id = '${menu_id}' and A.role_id = '${role_id}'`)
                if (access[0].length === 0) {
                    await sq.query(`
                        INSERT INTO role_access
                        ("createdAt", "updatedAt", menu_id, role_id)
                        VALUES('2023-03-27 15:31:39.067', '2023-03-27 15:31:39.067', '${menu_id}', '${role_id}');
                    `)
                }
            } else {
                await sq.query(`
                    DELETE FROM role_access
                    WHERE menu_id='${menu_id}' AND role_id='${role_id}';
                `)
            }

            res.status(200).json({ status: 200, message: "Berhasil" }); 
        } catch (error) {
            res.status(200).json({ status: 203, message: "gagal", error })
        }
    }
}



module.exports = Controller