//Requisitos
const express = require('express');
const fs = require('fs');
const { Server: HttpServer } = require('http');
const { Server: IOServer } = require('socket.io');
const ClienteSQL = require('./db/sqlContainer').ClienteSQL;
const optionsMariaDB = require('./options/mysqlconn').options;

//MongoDB
const mongoose = require('mongoose');
const mongoConfig = require('./options/mongodbconn').options;
const modelMensaje = require('./models/mensaje');


//Normalizr
const normalizr = require('normalizr');
const util = require('util');

const normalize = normalizr.normalize;
const schema = normalizr.schema;

//Esquemas normalizacion
const author = new schema.Entity('authors', {}, { idAttribute: 'email' });
const message = new schema.Entity('messages', { author: author }, { idAttribute: 'id' });
const mensajeria = new schema.Entity('mensajeria', { messages: [message] }, { idAttribute: 'id' });


//Cookies
const cookieParser = require('cookie-parser');


//Session
const session = require('express-session');
const MongoStore = require('connect-mongo');
const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true };


//Métodos
function print(objeto) {
    console.log(util.inspect(objeto, false, 12, true));
}

function convertirArray(array) {
    let nuevoArray = [];
    for (mensaje of array) {
        nuevoArray.push({ id: mensaje._id.toString(), author: mensaje.author, text: mensaje.text, date: mensaje.date });
    };
    return nuevoArray;
}

function sessionPersistence(req, res, next) {
    if (req.session.user) {
        req.session.touch();
        next();
    } else {
        res.redirect("/login");
    }
}


//.env
require('dotenv').config();


//Inicio de servidor
const app = express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(session({
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        mongoOptions: advancedOptions
    }),
    secret: 'secreto',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}));


let sqlProductos = new ClienteSQL(optionsMariaDB, "productos");


//Ejs
app.set('view engine', 'ejs');

//Peticiones del servidor
app.get("/login", (req, res) => {
    res.render("pages/login");
});

app.post("/login", (req, res) => {
    const username = req.body.txtUsuario;
    req.session.user = username;
    res.redirect('/');
});

app.get("/logout", (req, res) => {
    res.render("pages/logout", { username: req.session.user });
    req.session.destroy();
});

app.get("/", sessionPersistence, (req, res) => {
    res.render("pages/index", { username: req.session.user });
});

app.get("/api/productos-test", sessionPersistence, (req, res) => {
    res.render("pages/testView");
})

//Websocket
io.on('connection', function (socket) {
    console.log("Cliente conectado");

    sqlProductos = new ClienteSQL(optionsMariaDB, "productos");
    sqlProductos.obtenerProductos()
        .then(productos => socket.emit('productos', productos));

    mongoose.set('strictQuery', true);
    mongoose.connect("mongodb://localhost:27017/mensajeria", mongoConfig)
        .then(() => modelMensaje.find({}))
        .then(data => {
            const chat = {
                id: "mensajes",
                messages: convertirArray(data)
            };
            const mensajesNormalizados = normalize(chat, mensajeria);
            io.sockets.emit('mensajes', mensajesNormalizados);
        })
        .catch((err) => console.log(err));



    socket.on("nuevo-producto", producto => {
        sqlProductos = new ClienteSQL(optionsMariaDB, "productos");
        sqlProductos.insertarElemento(producto)
            .then(() => sqlProductos.obtenerProductos())
            .then(productos => socket.emit('productos', productos));
    });

    socket.on("nuevo-mensaje", message => {
        mongoose.set('strictQuery', true);
        mongoose.connect("mongodb://localhost:27017/mensajeria", mongoConfig)
            .then(() => modelMensaje.create(message))
            .then(() => console.log("Mensaje guardado"))
            .then(() => modelMensaje.find({}))
            .then(data => {
                const chat = {
                    id: "mensajes",
                    messages: convertirArray(data)
                };
                const mensajesNormalizados = normalize(chat, mensajeria);
                io.sockets.emit('mensajes', mensajesNormalizados);
            })
            .catch((err) => console.log(err));
    })
});

//Escucha del servidor
httpServer.listen(8080, () => {
    console.log("Servidor escuchando en puerto 8080");
})
