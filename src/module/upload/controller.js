const msBank = require('./model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT }


class Controller {

    static index(req, res) {
        let filename = ""
        let path = ""
        let ext = ""
        if (req.files) {
            if (req.files.file) {
                filename = req.files.file[0].filename;
                path = req.files.file[0].path;
                ext = req.files.file[0].mimetype;
            }
        }

        let url = req.protocol + '://' + req.get('host');

        res.status(200).json({ 
            "url": `${url}/${filename}`,
            "tumbnail_url": `${url}/${filename}`,
            "filename": filename,
            "path": path,
            "ext": ext
        })
    }

}

module.exports = Controller