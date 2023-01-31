const mongoose = require('mongoose');

const mensajeSchema = new mongoose.Schema({
    author: { type: Object, require: true },
    text: { type: String },
    date: { type: String }
})

module.exports = mongoose.model('Mensaje', mensajeSchema);