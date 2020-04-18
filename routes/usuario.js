var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

// var SEED = require('../config/config').SEED;

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');
/* // 
// trae todos los usuario
//  */
app.get('/', (req, res, next) =>{

    Usuario.find({}, 'nombre email img role').exec(
        (err, usuarios)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'error cargando usuario de base de datos',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            usuarios: usuarios
        });
     });
});




/* // 
// Actualizar un nuevo usuario
//  */
app.put('/:id', (req, res) => {

    var id = req.params.id;
    
    var body = req.body;

    Usuario.findById( id, (err, usuario) => {
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'al buscar usuario',
                errors: err
            });
        }
        if( !usuario ){
            return res.status(400).json({
                ok: false,
                mensaje: 'el susario con el id '+id+' no existe',
                errors: { message : 'No existe elid de e ese usuario'}
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save( (err, usuarioGuardado) => {
            if(err){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'error al actualizar el usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';
            res.status(200).json({
                ok: true,
                usuario : usuarioGuardado
            });
        });

    });
});
    /* 
    res.status(200).json({
        ok: true,
        id: id
    }); */


/* // 
// Crear un nuevo usuario
//  */
app.post('/', mdAutenticacion.verificaToken, (req, res)=>{
    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password),
        img: body.img,
        role: body.role
    });

    usuario.save( (err, usuarioGuardado ) => {
        if(err){
            return res.status(400).json({
                ok: false,
                mensaje: 'error al crear usuario en base de datos',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioGuardado: req.usuario
        });
    });
});

/* // 
// borrar un usuario
//  */

app.delete('/:id', (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado)=>{

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'error al borrar usuario',
                errors: err
            });
        }
        if(!usuarioBorrado){
            return res.status(400).json({
                ok: false,
                mensaje: 'no existe un susario con ese id',
                errors: {message: 'no existe un usuario con ese id'}
            });
        }
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });

});
module.exports = app;