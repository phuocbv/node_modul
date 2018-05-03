var Busboy = require('busboy'); // 0.2.9
var express = require('express'); // 4.12.3
var mongo = require('mongodb'); // 2.0.31
var Grid = require('gridfs-stream'); // 1.1.1"
var app = express();
var server = app.listen(9002);

var db = new mongo.Db('mydb', new mongo.Server('localhost', 27017));
var gfs;
db.open(function(err, db) {
    if (err) throw err;
    gfs = Grid(db, mongo);
});

app.post('/file', function(req, res) {
    var busboy = new Busboy({ headers: req.headers });
    var fileId = new mongo.ObjectId();

    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        console.log('got file', filename, mimetype, encoding);
        var writeStream = gfs.createWriteStream({
            _id: fileId,
            filename: filename,
            mode: 'w',
            content_type: mimetype,
        });
        file.pipe(writeStream);
    }).on('finish', function() {
        // show a link to the uploaded file
        res.writeHead(200, { 'content-type': 'text/html' });
        res.end('<a href="/file/' + fileId.toString() + '">download file</a>');
    });

    req.pipe(busboy);
});

app.get('/', function(req, res) {
    // show a file upload form
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end(
        '<form action="/file" enctype="multipart/form-data" method="post">' +
        '<input type="file" name="file"><br>' +
        '<input type="submit" value="Upload">' +
        '</form>'
    );
});

app.get('/file/:id', function(req, res) {
    gfs.findOne({ _id: req.params.id }, function(err, file) {
        if (err) return res.status(400).send(err);
        if (!file) return res.status(404).send('');

        res.set('Content-Type', file.contentType);
        res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"');

        var readstream = gfs.createReadStream({
            _id: file._id
        });

        readstream.on("error", function(err) {
            console.log("Got error while processing stream " + err.message);
            res.end();
        });

        readstream.pipe(res);
    });
});

getFile = function(req, res) {

    var gfs = Grid(mongoose.connection.db, mongoose.mongo);

    // Check if the file exist
    gfs.findOne({ _id: req.params.id }, function(err, file) {
        if (err) {
            res.status(404).end();
        } else if (!file) {
            res.status(404).end();
        } else {
            var readstream = gfs.createReadStream({
                _id: file._id
            });

            res.set('Content-Type', file.contentType);

            readstream.on('error', function(err) {
                res.send(500, err);
            });
            readstream.on('open', function() {
                readstream.pipe(res);
            });
        }
    });
}