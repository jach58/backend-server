var express = require('express')
var fileUpload = require('express-fileupload')
var fs = require('fs')
var app = express()

var Usuario = require('../models/usuario')
var Medico = require('../models/medico')
var Hospital = require('../models/hospital')

app.use(fileUpload())


//subir archivo
app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo
    var id = req.params.id

    //tipos de coleccion
    var tiposValidos = ['hospitales', 'medicos', 'usuarios']
    if(tiposValidos.indexOf(tipo) <0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es válida!',
            errors: {message: 'Tipo de colección no es válida'}
        })
    }

    if(!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No seleccionó nada!',
            errors: {message: 'Debe seleccionar una imagen'}
        })
    }

    //Obtener el nombre del archivo
    var archivo = req.files.imagen
    var nombreCortado = archivo.name.split('.')
    var extensionArchivo = nombreCortado[nombreCortado.length-1]

    //Solo estas extensiones  aceptamos

    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg']

    if(extensionesValidas.indexOf(extensionArchivo)< 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no valida!',
            errors: {message: 'Las extensiones validas son' + extensionesValidas.join(', ')}
        })
    }

    //Nombre de archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`

    //Mover el archivo del temporal a un path 
    var path = `./uploads/${tipo}/${nombreArchivo}`

    archivo.mv(path, err=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo!',
                errors: err
            })
        }

        subirPorTipo(tipo, id, nombreArchivo, res)

        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo movido',
        // })
    })

})

function subirPorTipo( tipo, id, nombreArchivo, res) {
    
    if(tipo === 'usuarios'){
        Usuario.findById(id, (err, usuario) => {

            if(!usuario) {
                res.status(400).json({
                    ok: true,
                    mensaje: 'Usuario no existe',
                    errors: {message: 'Usuario no existe'}
                })
            }

            var pathViejo = './uploads/usuarios/' + usuario.img

            //Si existe, elimina la imagen anterior
            if(fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo)
            }

            
            usuario.img = nombreArchivo
            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ':)'
                res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuarioActualizado: usuarioActualizado
                })
            })

        })
    }

    if(tipo === 'medicos'){
        Medico.findById(id, (err, medico) => {

            if(!medico) {
                res.status(400).json({
                    ok: true,
                    mensaje: 'Medico no existe',
                    errors: {message: 'Medico no existe'}
                })
            }

            var pathViejo = './uploads/medicos/' + medico.img

            //Si existe, elimina la imagen anterior
            if(fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo)
            }

            medico.img = nombreArchivo
            medico.save((err, medicoActualizado) => {
                res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medicoActualizado: medicoActualizado
                })
            })

        })
    }

    if(tipo === 'hospitales'){
        Hospital.findById(id, (err, hospital) => {

            if(!hospital) {
                res.status(400).json({
                    ok: true,
                    mensaje: 'Hospital no existe',
                    errors: {message: 'Hospital no existe'}
                })
            }

            var pathViejo = './uploads/hospitales/' + hospital.img
            console.log(pathViejo)

            //Si existe, elimina la imagen anterior
            if(fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo)
            }

            hospital.img = nombreArchivo
            hospital.save((err, hospitalActualizado) => {
                res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospitalActualizado: hospitalActualizado
                })
            })

        })
    }
}

module.exports = app