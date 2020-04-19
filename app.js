//Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// coneccion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', ( err, res )=>{
    if( err ) {
        console.log('qye chucha', err);
        throw err;
    }
    console.log('base de datos:  \x1b[32m%s\x1b[0m', 'CtmOnline');
});

//server index config
// var serveIndex = require('serve-index');

//Inicializar variables
var app = express();

// app.use(express.static(__dirname+'/'));
// app.use('/uploads', serveIndex(__dirname+'/uploads'));
//body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false })) ;
app.use(bodyParser.json());


//Importar ruta
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospital');
var medicosRoutes = require('./routes/medicos');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');

//Rutas
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medicos', medicosRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);
app.use('/', appRoutes);

//Escuchar peticiones
app.listen(3000, () => {
    console.log('expreess server puerto 3000:  \x1b[32m%s\x1b[0m', 'CtmOnline');
});