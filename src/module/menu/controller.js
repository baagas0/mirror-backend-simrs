const menu = require('./model')
const { sq } = require("../../config/connection");
const bcrypt = require("../../helper/bcrypt.js");
const jwt = require("../../helper/jwt");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');

const {treeMenu} = require("../../helper/general");

class Controller {

    static async listBuild(req, res) {
        try {
            // console.log(req.dataUsers);
            // console.log("Role ID: "+req.dataUsers.role_id);
            if(!req.dataUsers?.role_id) {
                res.status(500).json({ status: 500, message: "Role tidak terdefinisi.", data: [] });
                return;
            }
            
            let data = await sq.query(`
                select
                    case when a.parent_code is null then '' else a.parent_code end as parent_code,
                    a.code,
                    a.icon,
                    a.route,
                    a.route as to,
                    a.name,
                    a.level,
                    a.seq,
                    a.type
                from menu a
                join role_access b on b.menu_id = a.id and b.role_id = '${req.dataUsers?.role_id}'
                where a.type in ('1', 2)
                    and (
                        a.type = 1 
                        or (
                            -- Jika tipe nya 2 dan level 1 maka true
                            -- kalau tidak cek type 2 dan punya parent yang aktif, ngecek parent nya ada tidak
                            a.type = 2
                            and a.level = 1
                            
                            or (
                                a.type = 2 
                                and exists (
                                    select 1 
                                    from menu c 
                                    join role_access d on d.menu_id = c.id and d.role_id = '${req.dataUsers?.role_id}'
                                    where c.code = a.parent_code 
                                    and c.type = 1
                                )
                            )
                        )
                    )
                order by a.seq asc
            `);

            const sidebar = [
                {
                  _name: "CSidebarNav",
                  _children: treeMenu(data[0])
                }
            ];
            
            // res.status(200).json({ status: 200, message: "sukses", data: data[0] });
            res.status(200).json({ status: 200, message: "sukses", data: sidebar });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
 
    static register(req, res) {
        const { 
            code, parent_code, icon, name, route, seq, type
         } = req.body;
        
        menu.findAll({ where: { name: { [Op.iLike]: name } }}).then(async data => {
            if (data.length) {
                res.status(201).json({ status: 204, message: "Nama menu sudah terdaftar" });
            } else {
                const is_root = parent_code != '' ? "false" : "true";
                const level = code.split('_').length;
                
                await sq.query(`
                    update menu set seq = menu.seq+1 where menu.parent_code = '${parent_code}' and menu.seq > ${seq}
                `);

                let data_create = { id: uuid_v4(), code, parent_code, icon, name, route, seq, is_root, level, type };
                console.log(data_create);
                await menu.create(data_create, { returning: true })
                    .then((respon) => {
                        res.status(200).json({ status: 200, message: "sukses", data: respon });
                    }).catch((err) => {
                        console.log(err)
                        console.log({code, parent_code, icon, name, route, seq, is_root, level, type:parseInt(type) })
                    })
            }
        })
    }

    static update(req, res) {
        const { id, code, parent_code, icon, name, route, seq, is_root, type } = req.body;

        menu.update({ code, parent_code, icon, name, route, seq, is_root, type }, { where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(err)
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static delete(req, res) {
        const { id } = req.body;

        menu.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static list(req, res) {
        let search = {}
        if(req.body.search) {
            search = {
                name: {
                    [Op.iLike]: `%${req.body.search.toLowerCase()}%`
                }
            }
        }
        
        let offset = req.body.halaman ? ((req.body.halaman-1)*req.body.limit) : 0
        let limit = req.body.limit ? req.body.limit : 99999999

        menu.findAll({ offset:offset , limit : limit, order: [['seq', 'ASC'], ['code', 'ASC']], where: search }).then(data => {
            menu.count({where: search}).then(count => {
                res.status(200).json({ status: 200, message: "sukses", data, count: count });
            })
        }).catch(err => {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static detailsById(req, res) {
        const { id } = req.body;

        menu.findAll({ where: { [Op.or]: [{id: id}, {code: id}] } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses", data });
        }).catch(err => {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

}



module.exports = Controller