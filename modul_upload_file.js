var MongoClient = require('mongodb').MongoClient;
var Q = require('q');
var mongoose = require('mongoose');
var gridfsstream = require('gridfs-stream');
var fs = require('fs');

var url = 'mongodb://localhost:27017/db';
var database = 'mydb';
var connect = mongoose.connection;
mongoose.connect(url);

const dir_name = `public/images/uploads/`;

module.exports = {
    connectToMongodb: () => {
        return Q.Promise((resolve, reject) => {
            MongoClient.connect(url, (err, db) => {
                if (err) reject(err);
                resolve(db);
            });
        });
    },

    uploadFile: (file) => {

        return Q.Promise((resolve, reject) => {

            // gridfsstream.mongo = mongoose.mongo;

            connect.once('open', () => {
                //var gfs = gridfsstream(connect.db);

                var gfs = gridfsstream(mongoose.connection.db, mongoose.mongo);
                var readstream = fs.createReadStream(dir_name + file.filename);

                var writestream = gfs.createWriteStream({
                    filename: file.filename
                });

                readstream.pipe(writestream);

                writestream.on("close", function(file) {
                    //mongoose.connection.close()
                    resolve({ fileId: file._id });
                });

                writestream.on("error", function() {
                    //mongoose.connection.close()
                    reject({ error: 'error' });
                });
            });
        });
    },

    getFile: (req, res, id) => {
        return Q.Promise((resolve, reject) => {
            var gfs = gridfsstream(mongoose.connection.db, mongoose.mongo);
            gfs.findOne({ _id: req.params.id }, (err, file) => {
                if (err) return res.status(404).send(err);
                return res.send(file);
                // res.set('Content-Type', file.contentType);

                // var readStream = gfs.createReadStream({
                //     _id: file._id
                // });

                // readStream.on('error', (err) => {
                //     return res.status(500).send(err);
                // });

                // readStream.on('open', () => {
                //     readStream.pipe(res);
                // })
            });
            res.send(req.params.id);
        });
    }
}