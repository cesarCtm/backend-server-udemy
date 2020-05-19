var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

var Usuario = require('../models/usuario');

var CLIENT_ID = require('../config/config').CLIENT_ID;
// google
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
  }

  var mdAutenticacion = require('../middlewares/autenticacion');
// =============================================
// RENOVAR TOKEN
// =============================================
app.get('/renuevatoken', mdAutenticacion.verificaToken, (req,res)=>{
    
    var token = jwt.sign({ usuario: req.usuario }, SEED, { expiresIn: 14400 });//4 horas

    res.status(200).json({
        ok: true,
        token: token
    });

});


// =============================================
// autenticacion cpm google
// =============================================
app.post('/google', async(req, res) =>{
    var token = req.body.token;
    var googleUser = await verify(token)
    .catch(e =>{
        return res.status(403).json({
            ok: false,
            mensaje: 'Token no valido'
        });
    });

    Usuario.findOne( { email: googleUser.email}, (err, usuarioDb)=> {
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'error al buscar usuario',
                errors: err
            });
        }
        if( usuarioDb ){
            if( usuarioDb.google === false ){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'debe de usar su autenticacion normal',
                    errors: err
                });
            }
            else{

                usuarioDb.password = ':)';
                var token = jwt.sign({ usuario: usuarioDb }, SEED, { expiresIn: 14400 });//4 horas
                return res.status(200).json({
                    ok: true,
                    usuario: usuarioDb,
                    token: token,
                    id: usuarioDb._id,
                    menu: obtenerMenu( usuarioDb.role )
                });
            }
        }
        else{
            // el usuasrio no existe hayt que crearlo
            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDbRetorno) =>{
                var token = jwt.sign({ usuario: usuarioDbRetorno }, SEED, { expiresIn: 14400 });//4 horas
                return res.status(200).json({
                    ok: true,
                    usuario: usuarioDbRetorno,
                    token: token,
                    id: usuarioDbRetorno._id,
                    menu: obtenerMenu( usuarioDbRetorno.role )
                });


            });

        }
    });

});

// =============================================
// autenticacion normal
// =============================================

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
            id: ususarioDB._id,
            menu: obtenerMenu( ususarioDB.role )
        });
    })


});

function obtenerMenu( ROLE ){
    
    var menu  = [
        {
          titulo: 'principal',
          icono: 'mdi mdi-gauge',
          submenu: [
            { titulo: 'Dashboard', url: '/dashboard' },
            { titulo: 'ProgressBar', url: '/progress' },
            { titulo: 'Graficas', url: '/graficas1' },
            { titulo: 'Promesas', url: '/promesas' },
            { titulo: 'Rxjs', url: '/rxjs' }
          ]
        },
        {
          titulo: 'Mantenimientos',
          icono: 'mdi mdi-folder-lock-open',
          submenu: [
            // { titulo: 'Usuarios', url: '/usuarios' },
            { titulo: 'Hospitales', url: '/hospitales' },
            { titulo: 'Medicos', url: '/medicos' },
          ]
        }
      ];
      if( ROLE === 'ADMIN_ROLE' ){
          menu[1].submenu.unshift(  { titulo: 'Usuarios', url: '/usuarios' } );
      }
    return menu;
}

module.exports = app;