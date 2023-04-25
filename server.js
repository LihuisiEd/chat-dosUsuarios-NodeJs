// Importar las dependencias
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const multer = require('multer');
const path = require('path');

// Configuramos multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
  });
const upload = multer({ storage: storage });

// Ruta para manejar la carga del archivo
app.post('/upload', upload.single('image'), function (req, res, next) {
    const file = req.file;
    if (!file) {
      const error = new Error('No se ha seleccionado ningún archivo.');
      error.httpStatusCode = 400;
      return next(error);
    }
    res.send(file);
  });

app.use('/', express.static(__dirname + "/public"));
// Ruta para el archivo HTML
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

// Escuchar la conexión de Socket.IO
io.on('connection', function(socket){
    console.log('Usuario conectado');

    // Escuchar el evento 'chat message 1' para el chat 1
    socket.on('chat message 1', function(msg){
        console.log('Mensaje del chat 1: ' + msg);
        io.emit('chat message 1', msg);
    });

    // Escuchar el evento 'chat message 2' para el chat 2
    socket.on('chat message 2', function(msg){
        console.log('Mensaje del chat 2: ' + msg);
        io.emit('chat message 2', msg);
    });

    // Escuchar la desconexión del usuario
    socket.on('disconnect', function(){
        console.log('Usuario desconectado');
    });
});

// Iniciar el servidor HTTP en el puerto 3000
http.listen(3000, function(){
    console.log('Servidor escuchando en http://localhost:3000');
});