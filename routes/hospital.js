var express = require('express');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');
/* // 
// trae todos los hospitales
//  */
app.get('/', (req, res, next) =>{


    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .populate('usuario','nombre email') 
        .skip(desde)
        .limit(5)
        .exec(
        (err, hospitales)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'error cargando hospitales de base de datos',
                errors: err
            });
        }
        Hospital.count({}, (err, conteo) =>{
            res.status(200).json({
                ok: true,
                hospitales: hospitales,
                total : conteo
            });
        });
     });
});




/* // 
// Actualizar un hospital
//  */
app.put('/:id', mdAutenticacion.verificaToken,(req, res) => {

    var id = req.params.id;    
    var body = req.body;

    Hospital.findById( id, (err, hospital) => {
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'al buscar hospital',
                errors: err
            });
        }
        if( !hospital ){
            return res.status(400).json({
                ok: false,
                mensaje: 'el hospital con el id '+id+' no existe',
                errors: { message : 'No existe elid de e ese usuario'}
            });
        }

        hospital.nombre = body.nombre;
        hospital.hospital = req.usuario._id;
        hospital.usuario = body.usuario;
 
        hospital.save( (err, hospitalGuardado) => {
            if(err){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'error al actualizar el hospital',
                    errors: err
                });
            }

            
            res.status(200).json({
                ok: true,
                hospital : hospitalGuardado
            });
        });

    });
});


/* // 
// Crear un nuevo hospital
//  */
app.post('/', mdAutenticacion.verificaToken, (req, res)=>{
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario_id,
    });

    hospital.save( (err, hospitalGuardado ) => {
        if(err){
            return res.status(400).json({
                ok: false,
                mensaje: 'error al crear hospital en base de datos',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });
});

/* // 
// borrar un hospital por el id
//  */

app.delete('/:id', mdAutenticacion.verificaToken,(req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado)=>{

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'error al borrar hospital',
                errors: err
            });
        }
        if(!hospitalBorrado){
            return res.status(400).json({
                ok: false,
                mensaje: 'no existe un hospital con ese id',
                errors: {message: 'no existe un hospital con ese id'}
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });

    });

});
module.exports = app;