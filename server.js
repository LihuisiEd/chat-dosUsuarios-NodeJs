// Importar las dependencias
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const mongoUrl = 'mongodb://localhost:27017/lab05';



app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Conecta a la base de datos
mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexión:'));
db.once('open', function() {
  console.log('Conexión exitosa a la base de datos');
});


// Definición del modelo
const mensajeSchema = new mongoose.Schema({
  contenido: String
});

const Mensaje = mongoose.model('Mensaje', mensajeSchema);

app.post('/', function(req, res) {
  const nuevoMensaje = new Mensaje({
    contenido: req.body.mensaje1
  });

  nuevoMensaje.save(function (err, mensaje1) {
    if (err) {
      console.error(err);
      res.status(500).send('Error al guardar el mensaje');
    } else {
      console.log('Mensaje guardado en la base de datos:', mensaje1);
      res.status(200).send('Mensaje guardado correctamente');
    }
  });
});

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
http.listen(5000, function(){
    console.log('Servidor escuchando en http://localhost:5000');
});