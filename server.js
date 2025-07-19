var express = require('express')
var bodyParser = require('body-parser')
var passport = require('passport')
var session = require('express-session')
var ejs = require('ejs')
var morgan = require('morgan')
const fileUpload = require('express-fileupload');
var config = require('./config/server')

//Initialize Express
var app = express()
require('./core/passport')(passport)
app.use(express.static('public'))
app.set('view engine','ejs')
app.use(morgan('tiny'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(fileUpload());

// Enable for Reverse proxy support
// app.set('trust proxy', 1) 

// Intialize Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret', // Use environment variable for secret
  resave: true,
  saveUninitialized: true,
  name: 'sessionId', // Custom session cookie name
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Ensure cookies are sent over HTTPS in production
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
    domain: 'yourdomain.com', // Set domain for the cookie
    path: '/', // Set path for the cookie
    expires: new Date(Date.now() + 60 * 60 * 1000) // Set expiration for the cookie
  }
}))

// Initialize Passport
app.use(passport.initialize())
app.use(passport.session())

// Initialize express-flash
app.use(require('express-flash')());

// Routing
app.use('/app',require('./routes/app')())
app.use('/',require('./routes/main')(passport))

// Start Server
app.listen(config.port, config.listen)