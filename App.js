const express = require("express");
const cors = require("cors");
const MongoConnect = require('./util/database');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
require('./passport-config');
require('dotenv').config();
const path = require('path');
const cookieParser = require('cookie-parser');

const authRoutes = require('./Routes/authRoutes');
const blogRoutes = require('./Routes/blogRoutes');
const sellRoutes = require('./Routes/sellRoutes');
const queryRoutes = require('./Routes/queryRoutes');
const subsRoutes = require('./Routes/subsRoutes');
const visitorRoutes = require('./Routes/visitorRoutes');
const visitorController = require('./Controllers/visitorController');


const app = express();
app.use(cookieParser());

app.use(cors());



// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '10mb' }));  // for JSON payloads
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));



app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 } // Cookie valid for 1 hour
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static('public'));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.get('/', (req, res, next) => {
    res.sendFile(__dirname + '/public/index.html');
});
app.get('/search', (req,res,next)=>{
    res.sendFile(__dirname + '/public/search.html');
});
app.get('/sell', (req, res, next)=>{
    res.sendFile(__dirname + '/public/sell.html');
});
app.get('/blogs',(req,res,next)=>{
    res.sendFile(__dirname + '/public/blogs.html');
});
app.get('/blogs/:id',(req,res,next)=>{
    res.sendFile(__dirname + '/public/blogDetails.html');
});
app.get('/usedcars',(req,res,next)=>{
    res.sendFile(__dirname + '/public/usedcars.html');
});

app.get('/visitor', (req, res) => {
    res.sendFile(__dirname + '/public/visitor.html');
});
app.get('/news', (req, res) => {
    res.sendFile(__dirname + '/public/news.html');
});
app.use((req, res, next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

MongoConnect(client =>{
    app.locals.db = client.db('myzameen');
    app.use(visitorController.logVisitor);
    app.use('/api', authRoutes);
    app.use('/api', blogRoutes);
    app.use('/api', sellRoutes);
    app.use('/api', queryRoutes);
    app.use('/api', subsRoutes);
    app.use('/api', visitorRoutes);

    app.listen(process.env.PORT);
    // console.log(client);
});