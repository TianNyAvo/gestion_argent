const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const userController = require('./modules/user/user.controller');

console.log('server.js is running...');

app.use(bodyParser.urlencoded({ extended: true }));

app.listen(3000, function () {
    console.log('listening on 3000');
});

app.get('/', function (req,res) {
   res.sendFile(__dirname + "/views/guest/index.html")
});

app.get('/signup', function (req,res) {
    res.sendFile(__dirname + "/views/guest/signup.html")
});

app.post('/signup/user', function (req,res) {
    console.log(req.body);
    userController.insertUser(req,res);
    res.redirect('/');
});

app.post('/login/user', async function (req,res) {
    console.log(req.body);
    var state = await userController.loginUser(req,res);
    if (state != "incorrect") {
        res.send('correct');
    }
    else {
        res.send('incorrect');
    }
});