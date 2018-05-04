var express = require('express');
var app = express();
var auth = require('./package/auth.js');

app.get('/', (req, res) => {
    var signup = auth.signup('aaa', 'bbb', 'ccc');
    signup.then((data) => {
        res.send(data);
    });
});

app.listen(3000);