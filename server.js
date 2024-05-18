const express = require('express');
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const userController = require('./modules/user/user.controller');
const mouvementController = require('./modules/mouvement/mouvement.controller');

console.log('server.js is running...');

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
  })
);

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

app.get('/admin/home', async function(req,res) {
    const info = req.session.user_info;
    var data = "data";
    res.render(__dirname + "/views/admin/home.ejs", {user: info, data: data});
});

app.get('/guest/home', async function(req,res) {
    const info = req.session.user_info;
    var data = "data";
    res.render(__dirname + "/views/user/home.ejs", {user: info, data: data});
});


app.post('/login/user', async function (req,res) {
    console.log(req.body);
    var state = await userController.loginUser(req,res);
    if (state != "incorrect") {
        req.session.user_info = state;
        if (state.role == "admin") {
            res.redirect('/admin/home');
        }
        else {
            res.redirect('/guest/home');
        }
    }
    else {
        res.redirect('/');
    }
});

app.get('/logout', function (req,res) {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.send('Error destroying session');
        } else {
            res.redirect('/');
            // res.send('Session destroyed');
        }
    });
});

app.get('/insert/mouvement', function (req,res) {
    res.render(__dirname + "/views/admin/insert_mouvement.ejs", {user: req.query})
});


app.post('/insert/mouvement', function (req,res) {
    console.log(req.body);
    mouvementController.insertMouvement(req,res);
    res.redirect('/');
});