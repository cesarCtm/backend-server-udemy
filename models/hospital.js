var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var hospitalSchema = new Schema({

    nombre: { type: String, required: [true, 'el nombre es necesario'] },
    img: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, required: [true, 'el id del usuario es necesario'], ref:'Usuario' }

}, { collection: 'hospitales' });

module.exports = mongoose.model('Hospital', hospitalSchema);