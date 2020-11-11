const express = require('express');
const session = require('express-session');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require("passport");
const app = express();
const port = 8080;

// view engine setup
app.set('views', path.join(__dirname, 'view')); //Fetch views under /view
app.set('view engine', 'ejs'); // Initiate view engine
app.use(bodyParser.urlencoded({ extended: false, limit: '25mb' })); // Max upload size
app.use(bodyParser.json()); // Enable upload of a request with body data
app.use(cookieParser()); //Enable cookie storage
app.use(express.static(path.join(__dirname, 'public'))); // Fetch static content in public folder eg css js images etc
//Activate session cookies
app.use(session({
  secret: 'wMnGuvBetLR27y48Y5y36fN8NM49Vp',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Use routers
app.use(require("./router/Index"));

//App should listen to request on port ${port}
app.listen(port, () => {
    console.log(`Go to http://localhost:${port} on your browser`)
});
