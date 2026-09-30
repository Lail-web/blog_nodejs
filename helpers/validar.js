const validator = require('validator');

const validarArticulo = (parametros) => {
    const validarTitulo =
        parametros.titulo &&
        !validator.isEmpty(parametros.titulo) &&
        validator.isLength(parametros.titulo, { min: 3, max: 200 });

    const validarContenido =
        parametros.contenido && !validator.isEmpty(parametros.contenido);

    if (!validarTitulo || !validarContenido) {
        throw new Error('Faltan datos por enviar o son incorrectos');
    }
};

module.exports = { validarArticulo };