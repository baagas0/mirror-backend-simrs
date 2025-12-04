const moment = require('moment');
const axios = require('axios')
const { QueryTypes } = require('sequelize');
const { sq } = require("../../config/connection");
const s = { type: QueryTypes.SELECT }
moment().locale('id')
class Controller {

    static async printAntrian(req, res) {
        const {no_antrian,tempat,sisa_antrian} = req.query
        try {
            let tgl = `${moment().format('dddd, LL')}`
            let jam = `${moment().format('hh:mm:ss')}`
            let html = `
            <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Document</title>
                <style>
                    .container {
                        /* background-color: 25%; */
                        /* border:2px solid red; */
                        max-width:100%;
                        box-sizing:border-box;
                    }
                    header{
                        border-top:2px solid black;
                        border-bottom: 2px dashed black;
                        text-align: center;
                    }
                    .tanggal{
                        margin-top:10px;
                    }
                    .contain_nomor{
                        text-align: center;
                        border-bottom: 2px solid black;
                    }
                    .contain_nomor .nomor{
                        font-size: 70px;
                        font-weight: bold;
                    }
                    
                    .contain_nomor .loket{
                        font-size: 20px;
                        /* font-weight: bold; */
                    }
                </style>
                </head>
                <body>
                    <div class="container">
                        <header>
                            <p>RSUD <br>
                            R.A.A Tjokronegoro</p>
                        </header>
                        <section class="tanggal">
                            <small >${tgl}</small>
                            <small style="float: right; "> ${jam} </small>
                        </section>
                        <section class="contain_nomor">
                        <span class="nomor"> ${no_antrian} </span><br>
                        <span class="loket">ANTREAN ${tempat}</span><br><br>
                        <small>
                            Jumlah Antrian Yang belum Dipanggil: ${sisa_antrian} <br>
                            <br>
                            <br>
                            <br>
                        </small>
                        </section>
                    </div>
                </body>
            </html>` 
            res.send(html)
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static async printSEP(req, res) {
        const {no_sep} = req.query
        try {
            let data = []
            let noTelp = ""

            let html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
                <style>
            
                    @page { size: 58mm 150mm; margin:0; height: 100mm;} /* output size */
                    /*
                    body.receipt .sheet { width: 58mm; height: 100mm; margin:0; }  sheet size 
                    */
                    /*
                    @media print { body.receipt { width: 58mm; margin:0; } } fix for Chrome 
                    */
                    table{
                         border-collapse: collapse;
                    }
                    body{
                        font-size: 4mm;
                    }
            
                    .kiri-font{
                        font-size: 3mm;
                   
                    }
                    table{
                        width: 100%;
                    }
                </style>
            </head>
            <body>
                <div class="contain">
                    <header>
                        <center>
                            BUKTI REGISTRASI <br>
                            RSUD R.A.A Tjokronegoro
                        </center>
                    </header><br>
                    <table>
                    <tr>
                        <td class="kiri-font" style="width:60%;">
                            No. SEP
                        </td>
                        <td>
                            :
                        </td>
                        <td>
                        ${data.length==0?"":data[0].no_sep}
                        </td>
                    </tr>
                    <tr>
                        <td  class="kiri-font">
                            Tgl. SEP
                        </td>
                        <td>
                            :
                        </td>
                        <td>
                        ${data.length==0?"":data[0].data_sep.tglSep}
                        </td>
                    </tr>
                    <tr>
                        <td  class="kiri-font">
                           No. Kartu
                        </td>
                        <td>
                            :
                        </td>
                        <td>
                        ${data.length==0?"":data[0].data_sep.peserta.noKartu}
                        </td>
                    </tr>
                    <tr>
                        <td  class="kiri-font">
                            No. RM
                        </td>
                        <td>
                            :
                        </td>
                        <td>
                        ${data.length==0?"":data[0].no_rm}
                        </td>
                    </tr>
                    <tr>
                        <td  class="kiri-font">
                            Nama Peserta
                        </td>
                        <td>
                            :
                        </td>
                        <td>
                        ${data.length==0?"":data[0].data_sep.peserta.nama}
                        </td>
                    </tr>
                    <tr>
                        <td class="kiri-font">
                          No. Telp
                        </td>
                        <td>
                            :
                        </td>
                        <td>
                        ${noTelp}
                        </td>
                    </tr>
                    <tr>
                        <td class="kiri-font">
                            Tgl. Lahir
                        </td>
                        <td>
                            :
                        </td>
                        <td>
                        ${data.length==0?"":data[0].data_sep.peserta.tglLahir}
                        </td>
                    </tr>
                    <tr>
                        <td class="kiri-font">
                            Jenis Kelamin
                        </td>
                        <td>
                            :
                        </td>
                        <td>
                        ${data.length==0?"":data[0].data_sep.peserta.kelamin}
                        </td>
                    </tr>
                    <tr>
                        <td class="kiri-font">
                          Poli Tujuan
                        </td>
                        <td>
                            :
                        </td>
                        <td>
                        ${data.length==0?"":data[0].poli_tujuan}
                        </td>
                    </tr>
                    <tr>
                        <td style="vertical-align: top;" class="kiri-font">
                            Nama Dokter
                        </td>
                        <td style="vertical-align: top;">
                            :
                        </td>
                        <td style="vertical-align: top;">
                        ${data.length==0?"":data[0].nama_dokter}
                        </td>
                    </tr>
                    <tr>
                        <td class="kiri-font">
                            No Urut
                        </td>
                        <td>
                            :
                        </td>
                        <td>
                        ${data.length==0?"":data[0].antrian_no}
                        </td>
                    </tr>
                    </table><br>
                    <footer>
                        <center>
                            Whatsapp Pengaduan : <br>
                            085329378495
                        </center>
                    </footer>
                </div>
            </body>
            </html>
            `
            res.send(html);
        } catch (error) {
            console.log(error);
        }
    }
}


module.exports = Controller