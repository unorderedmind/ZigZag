const express = require('express');
const app = express();
const path = require('path');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const messages = require('express-messages');
const session = require('express-session');
const passport = require('passport');

//********* Mongoose Connection *********
const config = require('./config/database');
mongoose.connect(config.database, { useMongoClient: true });
const db = mongoose.connection;
mongoose.Promise = global.Promise;

//********* Check Connection *********
db.openUri('mongodb://localhost/node-mongo', ()=> console.log('Connected to MongoDB.'));

//********* Check for DB errors *********
db.on('error', (err) => console.log('DataBase connection failed.'));


// *********** Body Parser *********** 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// *********** view engine ***********
app.set('views', path.join(__dirname, 'views'));
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');


// *********** static files ***********
app.use(express.static(path.join(__dirname, 'public')));


//************************************************

// *********** express session middleware ***********
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
}));


// *********** express messages middleware ***********
app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = messages(req, res);
  next();
});

/* add to the template: <%- messages() %> */

// *********** Express Validator middleware ***********
app.use(expressValidator({
 errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// *********** Passport config ***********
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

app.get('*', (req, res, next)=>{
  res.locals.user = req.user || null;
  next();
});


//************************************************
// Route Files

app.use('/', require('./routes/articles'));
app.use('/users', require('./routes/users'));

//************************************************



// *********** start server ***********
const port = 3000;
app.listen(port, ()=>{
    console.log(`Running on port ${port}`);
});


