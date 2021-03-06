const express = require('express');
const hbs = require('express-handlebars');
require('dotenv').config();
const path = require('path')
const session = require('express-session')
require('./lib/database');
const methodOverride = require('method-override')

const app = express();

app.use('*', (req, res, next)=>{
    res.locals.absoluteUrl = process.env.URLROOT
    next(); 
})

//override html methods
app.use(methodOverride('_method'))

//set handlebars as the main view engine
app.engine('handlebars', hbs({
    helpers:{
        rootpath:process.env.ROOTPATH,
        escape: variable => variable.replace(/(['"])/g, '\\$1')
    }
}));
app.set('view engine', 'handlebars');

//parsing data
//parse body
app.use(express.json()) // for parsing application /json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded


// console.log(path.join(__dirname, "assets"));

//set the path to the assets directory
app.use(express.static(path.join(__dirname, "assets")));

//set up passport authentication and enable use of sessions 
app.use(session({secret: process.env.SECRET, resave:false, saveUninitialized:true}))

app.use('/', require('./lib/routes/routes'));
app.use('/auth', require('./lib/routes/auth'));
app.use('/admin', require('./lib/routes/admin'))
// console.log(app);

app.listen(process.env.SERVER_PORT, () => console.log(`Express app listening on port ${process.env.SERVER_PORT}!`))