const express = require('express');
const app = express();
// const session = require('express-session');
const bodyParser = require('body-parser');
// const MongoStore = require('connect-mongo');
const path = require('path'); // Ajoutez cette ligne pour manipuler les chemins de fichier
const cors = require('cors');
const userController = require('./modules/user/user.controller');
const mouvementController = require('./modules/mouvement/mouvement.controller');

console.log('server.js is running...');

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cors());

app.use(express.static(path.join(__dirname, 'scripts')));
app.use(express.static(path.join(__dirname, 'style')));

// app.use(session({
//     secret: 'your-secret-key',
//     resave: false,
//     saveUninitialized: false
//   })
// );

// app.use(session({
//     secret: 'your-secret-key',
//     resave: false,
//     saveUninitialized: true,
//     store: MongoStore.create({ 
//         mongoUrl: 'mongodb://localhost:27017/',
//         dbName: 'gestion_argent',
//         collectionName: 'sessions' // Nom de la collection où stocker les sessions
//     }),
//     cookie: { secure: true }
// }));

app.listen(3000, function () {
    console.log('listening on 3000');
});

app.get('/', function (req,res) {
   res.sendFile(__dirname + "/views/guest/login.html")
});

app.get('/signup', function (req,res) {
    res.sendFile(__dirname + "/views/guest/signup.html")
});

app.post('/signup/user', async function (req,res) {
    // console.log(req.body);
    var user = await userController.signup(req,res);
    res.status(200).json(user);
});

app.post('/admin/signup/user', async function (req,res) {
    const data = await userController.insertUser(req,res);
    res.render(__dirname + "/views/admin/insert_mouvement.ejs", {user: data});
});

app.get('/admin/home', async function(req,res) {
    const info = req.params;
    // console.log("session ici",req.params,"voilaà");
    // var data = await userController.getUserMovementsByYear(req,res);//fonction pour avoir total mais pour un mois
    // console.log(data);
    var totals = await mouvementController.getTotalInputsAndOutputs(req,res);
    var totalyear = await mouvementController.getTotalInputsOutputsByYear(req,res);
    res.render(__dirname + "/views/admin/index.ejs", {user: info, situation: totals, totalyear: totalyear});
});

// app.post('/admin/home', async function(req,res) {
//     const info = req.body;
//     var data = await userController.getUserMovementsByYear(req,res);
//     // console.log(data);
//     res.render(__dirname + "/views/admin/index.ejs", {user: info, data: data});
// });

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

app.get('/admin/depenses', async function(req,res) {
    const data = await mouvementController.getDepensesByYear(req,res);
    res.render(__dirname + "/views/admin/depenses.ejs", {data: data});
});

app.post('/admin/depenses', async function(req,res) {
    const data = await mouvementController.getDepensesByYear(req,res);
    res.render(__dirname + "/views/admin/depenses.ejs", {data: data});
});

app.get('/admin/annexes', async function(req,res) {
    const data = await mouvementController.getAnnexesByYear(req,res);
    res.render(__dirname + "/views/admin/annexes.ejs", {data: data});
});

app.get('/admin/allcotisation', async function(req,res) {
    const data = await mouvementController.getAllCotisationsByYear(req,res);
    res.render(__dirname + "/views/admin/cotisation.ejs", {data: data});
});

app.post('/admin/allcotisation', async function(req,res) {
    const data = await mouvementController.getAllCotisationsByYear(req,res);
    res.render(__dirname + "/views/admin/cotisation.ejs", {data: data});
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

app.get('/admin/listUser', async function (req,res) {
    var data = await userController.listUser(req,res);
    res.render(__dirname + "/views/admin/list_user.ejs" , {data: data});
});

app.get('/admin/view/update/user/:user_id', async function (req,res) {
    var user = await userController.getByid(req,res);
    res.render(__dirname + "/views/admin/update_user.ejs", {data: user});
});

app.post('/admin/update/user', async function (req,res) {
    const data = await userController.updateUser(req,res);
    res.redirect('/admin/listUser');
});

//fonction changement de couleur dynamique des cotisations dans guest 

function getColor(liste, index, last_month, last_year, year) {
    // console.log("last_month", last_month, "last_year", last_year, "year", year);
    var color = false;
    var current_year = new Date().getFullYear();

    if (current_year == year) {
        console.log("nous somme l'année courante", current_year);
        console.log(liste)
        if (liste[index].total == 0 && index == 0 )  {
            color = true;
            return color
        }
        else{
            console.log("premier mois payé, suivant")
            if (index > 0) {
                if(liste[index-1].total > 0 && liste[index].total == 0){
                    color = true;
                    return color;
                }
            } 
        }
    }
    if(current_year > year){
        if(year == last_year){
            console.log("nous somme l'année du dernier paiement", last_year);
            if(liste[index].month == last_month + 1 && liste[index].total == 0){
                console.log("nous somme le mois suivant le dernier paiement", last_month + 1);
                color = true;
                return color;
            }
            else if( (liste[index].month > last_month + 1 && liste[index-1].total > 0) && liste[index].total == 0){
                console.log("le mois après le dernier paiement est réglé, mois suivant", liste[index].month);
                color = true;
                return color;
            }
            
        }
        else{
            if (liste[index].total == 0 && index == 0 )  {
                console.log("Nous sommme en Janvier d' une année entre courante et dernier paiement");
                color = true;
                return color
            }
            else{
                if ( index > 0) {
                    if(liste[index-1].total > 0 && liste[index].total == 0){
                    console.log("Nous sommme dans un autre mois d' une année entre courante et dernier paiement");
                        color = true;
                        return color;
                    }
                } 
            }
        }
    }
return color;
};

app.get('/guest/home/:user_id', async function(req,res) {
    var data = await userController.getUserCotisation(req,res);
    var totals = await mouvementController.getTotalInputsAndOutputs(req,res);
    var totalyear = await mouvementController.getTotalInputsOutputsByYear(req,res);
    console.log("data", data);
    res.render(__dirname + "/views/guest/home.ejs", {data: data, situation: totals, totalyear: totalyear, getColor: getColor});
});

app.post('/guest/home', async function(req,res) {
    console.log('request',req.body);
    var data = await userController.getUserCotisation(req,res);
    var totals = await mouvementController.getTotalInputsAndOutputs(req,res);
    var totalyear = await mouvementController.getTotalInputsOutputsByYear(req,res);
    res.render(__dirname + "/views/guest/home.ejs", {data: data, situation: totals, totalyear: totalyear, getColor});
});

app.get('/guest/view/update/:user_id', async function (req,res) {
    var user = await userController.getByid(req,res);
    res.sendFile(__dirname + "/views/guest/update_user.html", {data: user});
});

app.post('/guest/update/user', async function (req,res) {
    
    const data = await userController.updateUserGuest(req,res);
    // res.set('Content-Type', "text/javascript");
    console.log("passage server .js",data);
    res.status(200).json(data);
    // res.redirect('/guest/home/'+data._id);
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

app.get('/insert/mouvement/:_id/:matricule', function (req,res) {
    res.render(__dirname + "/views/admin/insert_mouvement.ejs", {user: req.params})
});

app.get('/insert/depense', function (req,res) {
    res.sendFile(__dirname + "/views/admin/insert_depense.html")
});

app.get('/insert/annexe', function (req,res) {
    res.sendFile(__dirname + "/views/admin/insert_annexe.html")
});

app.post('/insert/mouvement', function (req,res) {
    console.log(req.body);
    mouvementController.insertMouvement(req,res);
    res.redirect('/admin/table');
});

app.get('/admin/update/mouvement/:id', async function (req,res) {
    const data = await mouvementController.getById(req,res);
    console.log('data',data );
    res.render(__dirname + "/views/admin/update_movement.ejs", {data: data});
});

app.get('/admin/update/depense/:id', async function (req,res) {
    const data = await mouvementController.getById(req,res);
    console.log('data',data );
    res.render(__dirname + "/views/admin/update_depense.ejs", {data: data});
});

app.get('/admin/update/annexe/:id', async function (req,res) {
    const data = await mouvementController.getById(req,res);
    console.log('data',data );
    res.render(__dirname + "/views/admin/update_annexe.ejs", {data: data});
});

app.post('/admin/update/mouvement', async function (req,res) {
    const data = await mouvementController.updateMouvement(req,res);
    res.redirect('/admin/singleUser/'+data.user_id);
});

app.post('/admin/update/depense', async function (req,res) {
    const data = await mouvementController.updateMouvement(req,res);
    res.redirect('/admin/depenses/');
});

app.post('/admin/update/annexe', async function (req,res) {
    const data = await mouvementController.updateMouvement(req,res);
    res.redirect('/admin/annexes/');
});
 
app.get('/scripts/script.js', (req, res) => {
    // Spécifiez le type MIME approprié pour les fichiers JavaScript
    res.set('Content-Type', 'text/javascript');
    // Envoyez le fichier script.js
    res.sendFile(path.join(__dirname, 'scripts', 'script.js'));
});

app.get('/guest/scripts/script.js', (req, res) => {
    // Spécifiez le type MIME approprié pour les fichiers JavaScript
    res.set('Content-Type', 'text/javascript');
    // Envoyez le fichier script.js
    res.sendFile(path.join(__dirname, 'scripts', 'script.js'));
});

app.get('/style/style.js', (req, res) => {
    // Spécifiez le type MIME approprié pour les fichiers JavaScript
    res.set('Content-Type', 'text/html');
    // Envoyez le fichier script.js
    res.sendFile(path.join(__dirname, 'style', 'style.js'));
});