require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');

const articuloRoutes = require('./rutas/articulo');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas de la API
app.use('/api', articuloRoutes);

// Ruta raíz
app.get('/', (req, res) => {
    res.json({ mensaje: 'API Blog funcionando 🚀' });
});

// Conexión BD
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/blog2')
    .then(() => console.log('✅ MongoDB conectado'))
    .catch(err => console.error('❌ Error Mongo:', err.message));

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(` Servidor en http://localhost:${PORT}`));