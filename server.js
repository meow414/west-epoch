'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var mongoose = require('mongoose');


const MongoClient = require('mongodb').MongoClient;
const uri = process.env.MONGO_URI;
//const client = new MongoClient(uri, { useNewUrlParser: true });
  
/*client.connect(err => {
  const collection = client.db("test").collection("devices");
  perform actions on the collection object
  client.close();
});*/


mongoose.connect(uri,{ useNewUrlParser: true }).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

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

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});


  app.post('/api/shorturl/new', (req,res,next)=>{
  let webUrl = new urlShortner({original_url:req.body.url,short_url:short_url++});
  webUrl.save().then((err,newurl)=>{
                      if (err) throw(err);
                     return  res.json(newurl)
                             });
  next();
});

app.get('/api/shorturl/:surl', (req,res,next)=>{
  let Model = mongoose.model('urlShortner',urlSchema);
  Model.find({ short_url: req.params.surl },function(err,data){
    if (err) throw(err);
    res.json(data);
  })
  next();
});

// not found
app.use(function(req, res, next){
  res.status(404);
  res.type('txt').send('Not found');
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});