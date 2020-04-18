var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

var Usuario = require('../models/usuario');

app.post('/', (req, res)=>{

    var body = req.body;

    Usuario.findOne( { email: body.email}, (err, ususarioDB) =>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'error al buscar usuario',
                errors: err
            });
        }
        if(!ususarioDB){
            return res.status(400).json({
                ok: false,
                mensaje: 'credenciales inorreectas - email',
                errors: err
            });
        }

        if( !bcrypt.compareSync( body.password, ususarioDB.password )){
            return res.status(400).json({
                ok: false,
                mensaje: 'credenciales inorreectas - password',
                errors: err
            });
        }


        //crear token
        ususarioDB.password = ':)';
        var token = jwt.sign({ usuario: ususarioDB }, SEED, { expiresIn: 14400 });//4 horas



        res.status(200).json({
            ok: true,
            usuario: ususarioDB,
            token: token,
            id: ususarioDB._id
        });
    })


});


module.exports = app;