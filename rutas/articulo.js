const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const ctrl    = require('../controladores/articulo');

const router = express.Router();

// Carpeta uploads
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Config Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `articulo_${Date.now()}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Solo se permiten imágenes'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// 👇 LAS RUTAS — fíjate en upload.single('img')
router.post('/crear',          upload.single('img'), ctrl.crear);
router.get('/listar',          ctrl.listar);
router.get('/articulo/:id',    ctrl.uno);
router.put('/actualizar/:id',  upload.single('img'), ctrl.editar);
router.delete('/borrar/:id',   ctrl.borrar);

module.exports = router;