'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var mongoose = require('mongoose');
let dns = require('dns');


mongoose.connect(process.env.MONGO_URI,{ useNewUrlParser: true }).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

let Schema = mongoose.Schema;
//website url schema
let urlSchema = new Schema({
                      original_url: String,
                      short_url:  Number
                    });
let urlShortner  = mongoose.model('urlShortner',urlSchema);

//counter schema
let counterSchema = new Schema({
                      counter:Number
                    });
let uniqueCounter = mongoose.model('uniqueCounter',counterSchema);

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

//POST url to make it short
  app.post('/api/shorturl/new', (req,res,next)=>{//POST START
    
    let reg= /^(?:http(s)?:\/\/)/gi;
    
    if(!reg.test(req.body.url)){
      res.json({"error":"invalid URL"})
    }else{
      let withoutHTTP = req.body.url;
      withoutHTTP =withoutHTTP.replace(reg, "");
      dns.lookup(withoutHTTP, function (err, addresses, family){
        if(addresses!==undefined){
          urlShortner.find({original_url:req.body.url},(err,data)=>{
          if(err){
                throw (err);
          }else if(data.length!==0){
              res.json({"original_url":data[0].original_url,"short_url":data[0].short_url});
          }else{
   
          uniqueCounter.findOneAndUpdate({},{$inc:{'counter': 1}},(err,data)=>{
                                   if(err){
                                     throw (err);
                                   }else{
                                     let webUrl = new urlShortner({"original_url":req.body.url,"short_url":data.counter})
                                     webUrl.save((err,data)=>{
                                        if(err) throw (err);
                                        return res.json({"original_url":data.original_url,"short_url":data.short_url})
                                      });                                  
                                   }
                                   });
            
          }
          });
          }else{res.json({"error":"Invalid url"})}
         });
    
    }
    
});//POST END

app.get('/api/shorturl/:surl', (req,res,next)=>{
  urlShortner.findOne({ "short_url": req.params.surl },function(err,data){
       if(data){
      if (err) throw(err);
      console.log("GET "+data)
      return res.redirect(data.original_url);
      }else{
        res.status(404);
        res.type('txt').send(` https://west-epoch.glitch.me/api/shorturl/${req.params.surl} does not have corresponding original url in database`);
      }
  })
});

// not found
app.use(function(req, res, next){
  res.status(404);
  res.type('txt').send('Not found');
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});