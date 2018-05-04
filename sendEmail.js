var express = require('express');
var app = express();
var nodemailer = require('nodemailer');
var multer = require('multer');
var bodyparser = require("body-parser");
var modulUploadFile = require('./modul_upload_file.js');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
var upload = multer({ storage: storage });

app.use(bodyparser.urlencoded({ extended: false }));
app.get('/sendMail', (req, res) => {
    var to = req.param('to');
    var link = req.param('link');
    var from = req.param('from');
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'email_cua_ban',
            pass: 'mat_khau_cua_ban'
        }
    });

    var mailOptions = {
        from: 'email_cua_ban',
        to: to,
        subject: 'Mời tham gia',
        html: '<div>Xin chào bạn</div><div>Bạn nhận được lời mời tham gia từ </div><div><a href="' + link + '">' + link + '</a></div>'
    };
    console.log(mailOptions);

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            res.send(error);
        } else {
            res.send(info);
        }
    });
});

app.get('/testConnect', (req, res) => {
    modulUploadFile.connectToMongodb()
        .then((data) => {
            console.log(data);
            res.send(data);
        }).catch((err) => {
            console.log(err);
            res.send(err);
        });
});
app.post('/upload', upload.single('file'), (req, res, next) => {
    console.log(req.file);
    modulUploadFile.uploadFile(req.file)
        .then((data) => {
            console.log('success');
            res.send(data);
        }).catch((err) => {
            console.log(err);

            throw err;
        });
});

app.get('/file/:id', (req, res) => {
    modulUploadFile.getFile(req, res, req.params.id);
});

app.listen(3000);