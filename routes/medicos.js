var express = require('express');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');
/* // 
// trae todos los medicos
//  */
app.get('/', (req, res, next) =>{
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Medico.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre email')
    .populate('hospital')
    .exec(
        (err, medicos)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'error cargando medicos de base de datos',
                errors: err
            });
        }
        Medico.count({}, (err, conteo) =>{
            res.status(200).json({
                ok: true,
                medicos: medicos,
                total : conteo
            });
        });
     });
});

/* // 
// Obtener medico
//  */
app.get('/:id', (req, res) =>{

    var id = req.params.id;

    Medico.findById( id )
    .populate('usuario', 'nombre email img')
    .populate('hospital')
    .exec( (err, medico) => {
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'al buscar medico',
                errors: err
            });
        }
        if( !medico ){
            return res.status(400).json({
                ok: false,
                mensaje: 'el medico con el id '+id+' no existe',
                errors: { message : 'No existe el id de ese usuario'}
            });
        }
        res.status(200).json({
            ok: true,
            medico: medico
        });
    })
});


/* // 
// Actualizar un medico
//  */
app.put('/:id', mdAutenticacion.verificaToken,(req, res) => {

    var id = req.params.id;    
    var body = req.body;

    Medico.findById( id, (err, medico) => {
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'al buscar medico',
                errors: err
            });
        }
        if( !medico ){
            return res.status(400).json({
                ok: false,
                mensaje: 'el medico con el id '+id+' no existe',
                errors: { message : 'No existe elid de e ese usuario'}
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save( (err, medicoGuardado) => {
            if(err){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'error al actualizar el medico',
                    errors: err
                });
            }

            
            res.status(200).json({
                ok: true,
                medico : medicoGuardado
            });
        });

    });
});


/* // 
// Crear un nuevo medico
//  */
app.post('/', mdAutenticacion.verificaToken, (req, res)=>{
    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save( (err, medicoGuardado ) => {
        if(err){
            return res.status(400).json({
                ok: false,
                mensaje: 'error al crear medico en base de datos',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    });
});

/* // 
// borrar un medico por el id
//  */

app.delete('/:id', mdAutenticacion.verificaToken,(req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado)=>{

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'error al borrar medico',
                errors: err
            });
        }
        if(!medicoBorrado){
            return res.status(400).json({
                ok: false,
                mensaje: 'no existe un medico con ese id',
                errors: {message: 'no existe un medico con ese id'}
            });
        }
        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });

    });

});
module.exports = app;