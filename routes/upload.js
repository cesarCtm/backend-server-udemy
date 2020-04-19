var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');


var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) =>{      

    var tipo = req.params.tipo;
    var id = req.params.id;

    //tipos de coleccion
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if( tiposValidos.indexOf(tipo) < 0){
        return res.status(400).json({
            ok: false,
            mensaje: 'tipo de coleccion no es valida',
            errors: { message: 'tipo de coleccion no valida' } 
        });
    } 

    if( !req.files ){
        res.status(400).json({
            ok: false,
            mensaje: 'no selecciono nada',
            errors: { message: 'Debe de seleccionar una imagen' } 
        });    
    }    
    // obtener nombre del arcvhivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[ nombreCortado.length -1 ];

    //solo estas extensiones aceptamos
    var extensionesValidas = ['png','jpg','gif','jpeg'];
    if( extensionesValidas.indexOf( extensionArchivo ) < 0 ){
        res.status(400).json({
            ok: false,
            mensaje: 'extension no valida',
            errors: { message: 'las extensiones validas son' + extensionesValidas.join(', ') } 
        });    
    }

    // nombre de archivo personalizado
    var nombreArchivo = `${id}-${ new Date().getMilliseconds() }.${extensionArchivo}`;

    //mover el archivo del temporal a un path
    var path = `./uploads/${tipo}/${nombreArchivo}`;
    archivo.mv(path, err =>{
        if(err){
            res.status(500).json({
                ok: false,
                mensaje: 'erro al mover archivo 1',
                errors: err
            });    
        }
        /* res.status(200).json({
            ok: true,
            mensaje: 'archivo movido'
        }); */
        subirPorTipo( tipo, id, nombreArchivo, res);
    });



    // res.status(200).json({
    //     ok: true,
    //     mensaje: 'Peticion realizada correctamente',
    //     exntesionArchivo : extensionArchivo
    // });
});

function subirPorTipo( tipo, id, nombreArchivo, res){
    
    if( tipo === 'usuarios'){
        Usuario.findById( id, (err, usuario) =>{
            if(!usuario){
                return res.status(500).json({
                    ok: false,
                    mensaje: 'usuario no existe',
                    errors: err
                });    
            }
            var pathViejo = './uploads/usuarios/' + usuario.img;
            // si existe elimina la foto anterior
            if( fs.existsSync(pathViejo) ){
                fs.unlinkSync( pathViejo );
            }
            usuario.img = nombreArchivo;
            usuario.save( (err, usuarioActualizado) => {   
                if(err){
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'erro al mover archivo 2',
                        errors: err
                    });    
                }
                usuarioActualizado.password = '=)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'imagen de usuario actualizada',
                    usuario : usuarioActualizado
                });
            });

        });
    }
    if( tipo === 'medicos'){
        Medico.findById( id, (err, medico) =>{
            if(!medico){
                return res.status(500).json({
                    ok: false,
                    mensaje: 'medico no existe',
                    errors: err
                });    
            }
            var pathViejo = './uploads/medicos/' + medico.img;
            // si existe elimina la foto anterior
            if( fs.existsSync(pathViejo) ){
                fs.unlinkSync( pathViejo );
            }
            medico.img = nombreArchivo;
            medico.save( (err, medicoActualizado) => {   
                if(err){
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'erro al mover archivo 2',
                        errors: err
                    });    
                }
                return res.status(200).json({
                    ok: true,
                    medico : medicoActualizado,
                    mensaje: 'imagen de medivco actualizada'
                });
            }); 

        });
    }
    if( tipo === 'hospitales'){
        Hospital.findById( id, (err, hospital) =>{
            if(!hospital){
                return res.status(500).json({
                    ok: false,
                    mensaje: 'hospital no existe',
                    errors: err
                });    
            }
            var pathViejo = './uploads/hospitales/' + hospital.img;
            // si existe elimina la foto anterior
            if( fs.existsSync(pathViejo) ){
                fs.unlinkSync( pathViejo );
            }
            hospital.img = nombreArchivo;
            hospital.save( (err, hospitalActualizado) => {   
                if(err){
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'erro al mover archivo 4',
                        errors: err
                    });    
                }
                
                return res.status(200).json({
                    ok: true,
                    mensaje: 'imagen de hospital actualizada',
                    hospital : hospitalActualizado
                });
            });

        });
    }
}

module.exports = app;