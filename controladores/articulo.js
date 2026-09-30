const Articulo = require('../modelos/articulo');
const { validarArticulo } = require('../helpers/validar');
const fs   = require('fs');
const path = require('path');

// CREAR
const crear = async (req, res) => {
    const parametros = req.body;

    try {
        validarArticulo(parametros);
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({
            status: "error",
            mensaje: "Faltan datos por enviar o son incorrectos",
            detalle: error.message
        });
    }

    try {
        const nuevoArticulo = new Articulo({
            titulo:    parametros.titulo,
            contenido: parametros.contenido,
            fecha:     new Date(),
            imgUrl:    req.file ? req.file.filename : "default.png"
        });

        const articuloGuardado = await nuevoArticulo.save();
        return res.status(201).json({
            status: "success",
            mensaje: "Artículo creado con éxito",
            articulo: articuloGuardado
        });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(500).json({
            status: "error",
            mensaje: "Error al guardar",
            error: error.message
        });
    }
};

// LISTAR
const listar = async (req, res) => {
    try {
        const ultimos = req.query.ultimos ? parseInt(req.query.ultimos) : null;
        let consulta = Articulo.find({}).sort({ fecha: -1 });
        if (ultimos) consulta = consulta.limit(ultimos);

        const articulos = await consulta;
        if (!articulos || articulos.length === 0) {
            return res.status(404).json({ status: "error", mensaje: "No hay artículos" });
        }
        return res.status(200).json({
            status: "success",
            contador: articulos.length,
            articulos
        });
    } catch (error) {
        return res.status(500).json({ status: "error", error: error.message });
    }
};

// BUSCAR UNO
const uno = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || id.length !== 24) {
            return res.status(400).json({ status: "error", mensaje: "ID inválido" });
        }
        const articulo = await Articulo.findById(id);
        if (!articulo) {
            return res.status(404).json({ status: "error", mensaje: "No encontrado" });
        }
        return res.status(200).json({ status: "success", articulo });
    } catch (error) {
        return res.status(500).json({ status: "error", error: error.message });
    }
};

// EDITAR
const editar = async (req, res) => {
    try {
        const { id } = req.params;
        const parametros = req.body;

        if (!id || id.length !== 24) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ status: "error", mensaje: "ID inválido" });
        }

        try {
            validarArticulo(parametros);
        } catch (error) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ status: "error", detalle: error.message });
        }

        const articuloActual = await Articulo.findById(id);
        if (!articuloActual) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ status: "error", mensaje: "No encontrado" });
        }

        if (req.file && articuloActual.imgUrl !== "default.png") {
            const rutaVieja = path.join(__dirname, '..', 'uploads', articuloActual.imgUrl);
            if (fs.existsSync(rutaVieja)) fs.unlinkSync(rutaVieja);
        }

        const datos = {
            titulo: parametros.titulo,
            contenido: parametros.contenido,
            fechaActualizacion: new Date()
        };
        if (req.file) datos.imgUrl = req.file.filename;

        const actualizado = await Articulo.findByIdAndUpdate(id, datos, { new: true });

        return res.status(200).json({
            status: "success",
            mensaje: "Artículo actualizado",
            articulo: actualizado
        });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(500).json({ status: "error", error: error.message });
    }
};

// BORRAR
const borrar = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || id.length !== 24) {
            return res.status(400).json({ status: "error", mensaje: "ID inválido" });
        }

        const borrado = await Articulo.findByIdAndDelete(id);
        if (!borrado) {
            return res.status(404).json({ status: "error", mensaje: "No encontrado" });
        }

        if (borrado.imgUrl && borrado.imgUrl !== "default.png") {
            const ruta = path.join(__dirname, '..', 'uploads', borrado.imgUrl);
            if (fs.existsSync(ruta)) fs.unlinkSync(ruta);
        }

        return res.status(200).json({
            status: "success",
            mensaje: "Artículo borrado",
            articulo: borrado
        });
    } catch (error) {
        return res.status(500).json({ status: "error", error: error.message });
    }
};

module.exports = { crear, listar, uno, editar, borrar };