const express = require('express');
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');
const MongoStore = require('connect-mongo');
const path = require('path'); // Ajoutez cette ligne pour manipuler les chemins de fichier
const cors = require('cors');
const userController = require('./modules/user/user.controller');
const mouvementController = require('./modules/mouvement/mouvement.controller');

console.log('server.js is running...');

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cors());

app.use(express.static(path.join(__dirname, 'scripts')));

// app.use(session({
//     secret: 'your-secret-key',
//     resave: false,
//     saveUninitialized: false
//   })
// );

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ 
        mongoUrl: 'mongodb://localhost:27017/',
        dbName: 'gestion_argent',
        collectionName: 'sessions' // Nom de la collection où stocker les sessions
    }),
    cookie: { secure: true }
}));

app.listen(3000, function () {
    console.log('listening on 3000');
});

app.get('/', function (req,res) {
   res.sendFile(__dirname + "/views/guest/login.html")
});

app.get('/signup', function (req,res) {
    res.sendFile(__dirname + "/views/guest/signup.html")
});

app.post('/signup/user', function (req,res) {
    // console.log(req.body);
    userController.insertUser(req,res);
    res.redirect('/');
});

app.post('/admin/signup/user', async function (req,res) {
    const data = await userController.insertUser(req,res);
    res.render(__dirname + "/views/admin/insert_mouvement.ejs", {user: data});
});

app.get('/admin/home', async function(req,res) {
    const info = req.params;
    // console.log("session ici",req.params,"voilaà");
    var data = await userController.getUserMovementsByYear(req,res);
    // console.log(data);
    var totals = await mouvementController.getTotalInputsAndOutputs(req,res);
    var totalyear = await mouvementController.getTotalInputsOutputsByYear(req,res);
    res.render(__dirname + "/views/admin/index.ejs", {user: info, data: data, situation: totals, totalyear: totalyear});
});

app.post('/admin/home', async function(req,res) {
    const info = req.body;
    var data = await userController.getUserMovementsByYear(req,res);
    // console.log(data);
    res.render(__dirname + "/views/admin/index.ejs", {user: info, data: data});
});

app.get('/admin/table', async function(req,res) {
    const data = await userController.getAllUserCotisation(req,res);
    req.body.year = new Date().getFullYear();
    var totals = await mouvementController.getTotalInputsAndOutputs(req,res);
    res.render(__dirname + "/views/admin/table.ejs", {data: data, situation: totals})
});

app.post('/admin/table', async function(req,res) {
    const data = await userController.getAllUserCotisation(req,res);
    var totals = await mouvementController.getTotalInputsAndOutputs(req,res);
    res.render(__dirname + "/views/admin/table.ejs", {data: data, situation: totals})
});

app.get('/admin/byMonth', async function(req,res) {
    var data = await userController.getUserMovementsByMonthYear(req,res);
    console.log("par mois ", data)
    res.render(__dirname + "/views/admin/par_mois.ejs", {data: data});
});

app.post('/admin/byMonth', async function(req,res) {
    const info = req.body
    var data = await userController.getUserMovementsByMonthYear(req,res);
    console.log("par mois ", data)
    res.render(__dirname + "/views/admin/par_mois.ejs", {data: data});
});

app.get('/admin/singleUser/:user_id', async function(req,res) {
    const data = await mouvementController.getSingleUserMovement(req,res);

    res.render(__dirname + "/views/admin/single_user.ejs", {data: data});
    // console.log("single user par an ", data);
});

app.post('/admin/singleUser', async function(req,res) {
    const data = await mouvementController.getSingleUserMovement(req,res);

    res.render(__dirname + "/views/admin/single_user.ejs", {data: data});
    // console.log("single user par an ", data);
});

app.get('/admin/unpaid', async function (req,res) {
    const data = await userController.getUnpaidUserMovementsByMonthYear(req,res);
    console.log("single user par an ", data);
    res.render(__dirname + "/views/admin/unpaid.ejs", {data: data})
});

app.post('/admin/unpaid', async function (req,res) {
    const data = await userController.getUnpaidUserMovementsByMonthYear(req,res);
    res.render(__dirname + "/views/admin/unpaid.ejs", {data: data})
});

app.get('/admin/view/insert/user', function (req,res) {
    res.render(__dirname + "/views/admin/insert_user.ejs")
});

app.post('/admin/insert/user', async function (req,res) {
    const data = await userController.insertUser(req,res);
    res.redirect('/admin/home/'+data._id+'/'+data.name+'/'+data.prenom);
});

app.get('/guest/home/:user_id', async function(req,res) {
    var data = await mouvementController.getSingleUserMovement(req,res);
    res.render(__dirname + "/views/guest/home.ejs", {data: data});
});

app.post('/guest/home', async function(req,res) {
    var data = await mouvementController.getSingleUserMovement(req,res);
    res.render(__dirname + "/views/guest/home.ejs", {data: data});
});

app.post('/login/user', async function (req,res) {
    // console.log(req.body);
    var state = await userController.loginUser(req,res);
    if (state != "incorrect") {
        console.log("login ok")
        res.status(200).json(state);
        
    }
    else {
        res.redirect('/');
    }
});

app.get('/insert/mouvement/:_id/:name/:prenom', function (req,res) {
    res.render(__dirname + "/views/admin/insert_mouvement.ejs", {user: req.params})
});

app.get('/insert/depense', function (req,res) {
    res.sendFile(__dirname + "/views/admin/insert_depense.html")
});

app.post('/insert/mouvement', function (req,res) {
    console.log(req.body);
    mouvementController.insertMouvement(req,res);
    res.redirect('/admin/home');
});

app.get('/scripts/script.js', (req, res) => {
    // Spécifiez le type MIME approprié pour les fichiers JavaScript
    res.set('Content-Type', 'text/javascript');
    // Envoyez le fichier script.js
    res.sendFile(path.join(__dirname, 'scripts', 'script.js'));
});