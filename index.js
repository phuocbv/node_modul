var express = require('express');
var app = express();
var dateTime = require('./time');
var gmailSender = require('gmail-sender-oauth');
var nodemailer = require('nodemailer');
var alphamail = require('alphamail');
var request = require('request');
var bodyParser = require("body-parser");


const { google } = require('googleapis');
const oauth2Client = new google.auth.OAuth2(
    '875025034656-skakt7l1aknfu3qp792f15ufsnrik2pc.apps.googleusercontent.com',
    'PDxQexXOPgllb4tNCJQCHolE',
    'http://localhost:3000/oauthcallback'
);
// generate a url that asks permissions for Google+ and Google Calendar scopes
const scopes = [
    'https://www.googleapis.com/auth/plus.me',
    'https://www.googleapis.com/auth/calendar'
];

app.get('/demo', (req, res) => {
    res.send('hello world');
});

app.get('/dateTime', (req, res) => {
    res.send(dateTime.myDateTime());
})

app.get('/sendMail', (req, res) => {
    var url = oauth2Client.generateAuthUrl({
        // 'online' (default) or 'offline' (gets refresh_token)
        access_type: 'offline',
        // If you only need one scope you can pass it as a string
        scope: scopes
    });
    res.redirect(url);
})

app.get('/oauthcallback', (req, res) => {
    var code = req.param('code');
    var access_token = '';
    oauth2Client.getToken(code, (err, tokens) => {
        if (!err) {
            oauth2Client.setCredentials(tokens);
        }
        console.log(tokens.access_token);

        // var transporter = nodemailer.createTransport({
        //     service: 'gmail',
        //     auth: {
        //         type: 'OAuth2',
        //         user: 'buivanphuuocforyou@gmail.com',
        //         accessToken: tokens.access_token
        //     }
        // });
        var transportOptions = {
            service: "Gmail",
            auth: {
                XOAuthToken: nodemailer.createXOAuthGenerator({
                    user: "buivanphuocforyou@gmail.com",
                    token: tokens.access_token,
                    tokenSecret: tokens.id_token
                })
            }
        }

        var mailOptions = {
            from: 'buivanphuuocforyou@gmail.com',
            to: 'buivanphuuoc1802@gmail.com',
            subject: 'Sending Email using Node.js',
            text: 'That was easy!'
        };

        transportOptions.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        //     var encodedMail = new Buffer(
        //         "Content-Type: text/plain; charset=\"UTF-8\"\n" +
        //         "MIME-Version: 1.0\n" +
        //         "Content-Transfer-Encoding: 7bit\n" +
        //         "to: buivanphuoc1802@gmail.com\n" +
        //         "from: buivanphuocforyou@gmail.com\n" +
        //         "subject: Subject Text\n\n" +
        //         "The actual message text goes here"
        //     ).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');

        //     request({
        //             method: "POST",
        //             uri: "https://www.googleapis.com/gmail/v1/users/me/messages/send",
        //             headers: {
        //                 "Authorization": "Bearer '" + tokens.access_token + "'",
        //                 "Content-Type": "application/json"
        //             },
        //             body: JSON.stringify({
        //                 "raw": encodedMail
        //             })
        //         },
        //         function(err, response, body) {
        //             if (err) {
        //                 res.send(err); // Failure
        //             } else {
        //                 res.send(body); // Success!
        //             }
        //         });
    });
});

app.get('/sendMail', (req, res) => {
    var to = req.param('to');
    var link = req.param('link');
    var from = req.param('from');
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'buivanphuocforyou@gmail.com',
            pass: 'Foryou18021994@'
        }
    });

    var mailOptions = {
        from: 'buivanphuocforyou@gmail.com',
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