var express = require('express');
var app = express();
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var url = 'mongodb://localhost:27017/mydb';
var multer = require('multer');
var fs = require('fs');
var bodyparser = require("body-parser");
var mongoose = require('mongoose');
var gridfsstream = require('gridfs-stream');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});

var upload = multer({ storage: storage });
var url = "mongodb://localhost:27017/mydb";

const dirname = `public/images/uploads/`;
//mongoose.connect(url);
// var connect = mongoose.connection;

// gridfsstream.mongo = mongoose.mongo;
// var gfs = gridfsstream(connect.db);

app.use(bodyparser.urlencoded({ extended: false }));
app.post('/upload', upload.single('file'), (req, res, next) => {
    var connect = mongoose.connection;
    mongoose.connect(url);
    // gridfsstream.mongo = mongoose.mongo;

    connect.once('open', () => {
        //var gfs = gridfsstream(connect.db);

        var gfs = gridfsstream(mongoose.connection.db, mongoose.mongo);
        var readstream = fs.createReadStream('public/images/uploads/' + req.file.filename);

        var writestream = gfs.createWriteStream({
            filename: req.file.filename
        });

        readstream.pipe(writestream);

        writestream.on("close", function(file) {
            res.status(200).send({ fileId: file._id });
        });

        writestream.on("error", function() {
            res.status(500).send({ error: 'error' });
        });
    });
});

app.get('/file/:id', (req, res) => {
    var connect = mongoose.connection;
    mongoose.connect(url);
    var gfs = gridfsstream('mydb', mongoose.mongo);

    gfs.collection('fs.files').findOne({ _id: req.params.id }, (err, file) => {
        if (err) return res.status(404).send(err);

        res.set('Content-Type', file.contentType);

        var readStream = gfs.createReadStream({
            _id: file._id
        });

        readStream.on('error', (err) => {
            return res.status(500).send(err);
        });

        readStream.on('open', () => {
            readStream.pipe(res);
        })
    });
    res.send('ok');
});

app.get('/getImage/:id', function(req, res) {
    var id = req.params.id;
    var filePath = dirname + id;
    try {
        fs.statSync(filePath);
    } catch (err) {
        return res.send(err);
    }
    res.download(filePath);
});

app.listen(3000);