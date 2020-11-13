
/*

  File name : app.js
  Student name :Vishwa Akhani
  StudentID :300913898
  Date:29 October 2020

*/
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const monsoose = require('mongoose')
const app = express();
const config = require('./config')
// initializing server port 
const PORT = process.env.PORT || 3000;

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
// Import Passport and Warning flash modules 
var passport = require('passport');
var flash = require('connect-flash');
const User = require('./model/User');
const ContactlistModel = require('./model/ContactlistModel');
const e = require('express');

// Connect Mongodb
monsoose.connect(config.url, { useNewUrlParser: true, useUnifiedTopology: true }, (err => {
  if (err) {
    return console.log(err);
  } else {
    return console.log("Database connected !!");
  }
}))

// required for passport 
// secret for session 
app.use(session({
  secret: 'sometextgohere',
  saveUninitialized: true,
  resave: true,
  //store session on MongoDB using express-session +connect mongo 
  store: new MongoStore({
    url: config.url,
    collection: 'sessions'
  })
}));

// Passport configuration 
require('./passport')(passport);
// Init passport authentication 
app.use(passport.initialize());
// persistent login sessions 
app.use(passport.session());
// flash messages 
app.use(flash());


// log  request from browser
app.use(morgan('dev'));
// use body parser for get form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/static', express.static('public'));

app.set('views', './views');

app.set('view engine', 'ejs');

// Rendering all pages from  views 
app.get('/', (req, res) => {
  res.render('index');
});
app.get('/about', (req, res) => {
  res.render('about');
});
app.get('/resume', (req, res) => {
  res.render('resume');
});
app.get('/project', (req, res) => {
  res.render('project');
});
app.get('/services', (req, res) => {
  res.render('services');
});
app.get('/contact', (req, res) => {
  res.render('contact');
});
app.get('/error', (req, res) => {
  res.render('error');
});
/* GET login page. */
app.get('/login', function (req, res, next) {
  res.render('login', {
    title: 'Login Page',
    message: 'loginMessage'
  });
});
/* POST Signup */
app.get('/signup', passport.authenticate('local-signup', {
  //Success go to Profile Page / Fail go to Signup page 
  successRedirect: '/',
  failureRedirect: '/',
  failureFlash: true
}));
app.get('/error', (req, res) => {
  res.render('error');
});
// handle  api call
app.post('/login', passport.authenticate('local-login', {
  //Success go to Profile Page / Fail go to login page 
  successRedirect: '/businessList',
  failureRedirect: '/error'
}));
/* check if user is logged in */
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
}
/* GET Logout Page */
app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});
// businessList 


app.get('/businessList', isLoggedIn, function (req, res, next) {
  res.render('businessList');
})
app.get('/contactlist', isLoggedIn, function (req, res, next) {
  ContactlistModel.find().sort({name:1})
  .then(contacts=>{
    res.render('contactlist',{post:contacts});
  })
  .catch(err=>{
    console.log(err);
  })
})
// Edit get route
app.get('/editcontact/:id', (req, res) => {
  console.log(req.params.id);
  ContactlistModel.findById(req.params.id, (error, contact)=>{
    if(error){
      res.redirect('/error')
    }else {
      res.render('editcontact', {contact:contact})
    }
  })
});
app.post('/editcontact/:id', (req, res) => {
  // return console.log(req.body);
  ContactlistModel.findByIdAndUpdate(req.params.id, req.body.contact, (error, updated)=> {
    if(error) {
      res.redirect('/contactlist')
    }else{
      res.redirect('/contactlist/')
    }
  })
});

// delete route
app.get('/delete/:id', (req, res) =>{
  //DESTROY BLOG
  ContactlistModel.findByIdAndRemove(req.params.id, (error)=> {
    if(error){
      res.redirect('/contactlist')
    }else{
      res.redirect('/contactlist')
    }
  })
});
// delete route
app.post('/delete/:id', (req, res) =>{
  //DESTROY BLOG
  ContactlistModel.findByIdAndRemove(req.params.id, (error)=> {
    if(error){
      res.redirect('/contactlist')
    }else{
      res.redirect('/contactlist')
    }
  })
});
// Add dummy data
app.get('/adddata',(req,res)=>{
  let dummyContactList = [
    {
      "name": "Larson Guerra",
      "email": "larsonguerra@unq.com",
      "phone": "+1 (972) 566-2684"
    },
    {
      "name": "Shelby Ballard",
      "email": "shelbyballard@unq.com",
      "phone": "+1 (824) 467-3579"
    },
    {
      "name": "Lea Faulkner",
      "email": "leafaulkner@unq.com",
      "phone": "+1 (899) 528-3402"
    },
    {
      "name": "Cecelia Wolf",
      "email": "ceceliawolf@unq.com",
      "phone": "+1 (862) 507-3140"
    },
    {
      "name": "Wendi Bender",
      "email": "wendibender@unq.com",
      "phone": "+1 (868) 414-2720"
    }
  ]
  console.log('add');
  dummyContactList.map(el=>{
    new ContactlistModel({
      name:el.name,
      number:el.phone,
      email:el.email
    })
    .save()
    .then(added=>{
      res.redirect('/contactlist')      
      console.log('added');
    })
    .catch(err=>{
      console.log(err);
    })
  })
})
//  listining server 
app.listen(PORT, () => {
  User.find()
    .then(user => {
      if (user.length < 1) {
        new User({
          local: {
            name: "Vishwa Akhani",
            email: 'akhani@gmail.com',
            password: 'akhani',
          }
        })
          .save()
          .then(res => {
            // console.log('user created , ', res);
          })
          .catch(err => {
            console.log(err);
          })
      } else {
        console.log('user exist');
      }
    })
  console.log(`The server listening at http://localhost:${PORT}`);
})

module.exports = app;
