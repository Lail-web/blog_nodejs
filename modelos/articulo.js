// modelos/articulo.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ArticuloSchema = new Schema({
    titulo:    { type: String, required: true, trim: true },
    contenido: { type: String, required: true },
    fecha:     { type: Date,   default: Date.now },
    imgUrl:    { type: String, default: "default.png" }
});

module.exports = mongoose.models.Articulo
    || mongoose.model('Articulo', ArticuloSchema, 'articulos');