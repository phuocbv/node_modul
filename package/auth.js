var MongoClient = require('mongodb').MongoClient;
var Q = require('q');
var url = 'mongodb://localhost:27017/';
var database = 'mydb';
exports.fun = (param) => {

} 

module.exports = {
    signup: (username, email, password) => {
        return Q.promise((resolve, reject,) => {
            MongoClient.connect(url, (err, db) => {
                var dbo = db.db(database);
                dbo.collection('mydb').insertOne({
                    'username': username,
                    'email': email,
                    'password': password
                }, (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                });
            });
        });
    }
}
