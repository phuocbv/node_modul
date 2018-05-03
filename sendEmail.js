var express = require('express');
var app = express();
var nodemailer = require('nodemailer');

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

app.listen(3000);