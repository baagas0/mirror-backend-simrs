require('dotenv').config({})
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const routing = require('./index')
const server = require('http').createServer(app);
const moment = require('moment');

const { koneksi_socket } = require('./helper/socket')
koneksi_socket(server)

const { runCronJob } = require('./cronJob/main');



app.use(morgan('dev'))
app.use(cors())
app.use(express.urlencoded({ limit: "10mb", extended: true, parameterLimit: 50000 }))
app.use(express.json({ limit: "10mb" }))

app.use(express.static('asset/file/'));

app.use('/', routing);
const Transaksi = require('./module/transaksi/controller')
var Emitter = require('./helper/event_emitter')

const myEmitter = Emitter.myEmitter;
myEmitter.on('createJurnal', function (text) {
  Transaksi.register(text)
})
app.use((req, res, next) => {
	res.status(205).json({ status: '404', message: "gagal,tidak ada endpoint" });
})

const port = process.env.PORT_EXPRESS
server.listen(port, () => {
	console.log(` telah tersambung pada port : ${port}`)
});
