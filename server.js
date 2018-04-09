const express = require('express');
//const bodyParser = require('body-parser');
const app = express();

var port = process.env.PORT || 8000;

//app.use(bodyParser.urlencoded({extended: true}));
//app.use(bodyParser.json());
app.use(express.static(__dirname + '/'));

//Enabling CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


const indexController = require('./index.js');

app.get('/', function(req, res){
  res.send("Okay");
})

app.get('/helloGET', indexController.helloGET);


app.listen(port);
console.log("Started listening on : " + port);
