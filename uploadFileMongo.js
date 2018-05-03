var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var bodyparser = require("body-parser");
var app = express();
var mongoose = require('mongoose');
var gridfsstream = require('gridfs-stream');
var fs = require('fs');
var fileUpload = require('express-fileupload');
var multer = require("multer");
var formidable = require('formidable');

var url = "mongodb://localhost:27017/mydb";
var database = 'mydb';
var upload = multer({ dest: '/tmp/' });

//app.use(fileUpload());
app.use(bodyparser.urlencoded({ extended: false }));
app.get('/', (req, res) => {
    res.send('ok');
});

app.get('/testConnectMongoDB', (req, res) => {
    MongoClient.connect(url, (err, db) => {
        if (err) throw err;
        var dbo = db.db("mydb");
        var myobj = { name: "Company Inc", address: "Highway 37" };
        dbo.collection("mycollection").insertOne(myobj, function(err, res) {
            if (err) throw err;
            console.log("1 document inserted");
            db.close();
        });
        res.send('ok');
    });
});

app.post('/upload', upload.single("file"), (req, res) => {
    console.log(req.file);
    //return res.send((req.files.file.path));

    // if (!req.files) {
    //     return res.status(400).send('No files were uploaded.');
    // }
    // res.send('ss');
    mongoose.connect(url);
    gridfsstream.mongo = mongoose.mongo;
    var connect = mongoose.connection;
    connect.on('error', console.error.bind(console, 'connection error:'));

    connect.once('open', () => {
        var gfs = gridfsstream(connect.db);
        var readstream = fs.createReadStream(req.file.filename);

        var writestream = gfs.createWriteStream({
            filename: "file_upload.jpg"
        });
        readstream.pipe(writestream);
        writestream.on("close", function(file) {
            res.send('File Created : ' + file.filename);
        });
        writestream.on("error", function() {
            res.send('error');
        });
    });
});

app.listen(3000);