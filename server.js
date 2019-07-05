'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI,{ useNewUrlParser: true });
let Schema = mongoose.Schema;
let urlSchema = new Schema({
      original_url: String,
      short_url:  Number
    });
let short_url=0;

var urlShortner  = mongoose.model('urlShortner',urlSchema);


var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use(bodyParser.urlencoded({ extended: false }));//temp

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.post('/api/shorturl/new', function (req, res) {
    let newLink = new urlShortner({original_url: req.body.url,
                                   short_url:  short_url++});
  var promise = newLink .save();
 
  promise.then((err,data)=>{
             if(err) return(err);
             return res.send(data);
             });
 
});

// not found
app.use(function(req, res, next){
  res.status(404);
  res.type('txt').send('Not found');
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});