const express = require('express');
const session = require('express-session');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require("passport");
const morgan = require("morgan");
const chalk = require("chalk");
const mongoose = require("mongoose");
const keys = require("./config/keys");
const authRouter = require("./router/authRouter");
const userRouter = require("./router/userRouter");
const playlistRouter = require("./router/playlistRouter")
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const port = 5000;

// MongoDB Connection

//DB Connection
mongoose.connect(keys.MONGODB.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

var cl = console.log; //short hand for cleaner code

mongoose.connection.on("connected", () => {
  cl(chalk.bold.greenBright("The db has connected successfully!"));
});
mongoose.connection.on("error", (err) => {
  cl(
    chalk.bold.yellowBright(
      `An error: ${err} occured when trying to connect to db`
    )
  );
});
mongoose.connection.on("disconnected", () => {
  cl(chalk.bold.redBright("The db has disconnected!"));
});

// End MongoBD Connection 

// view engine setup
app.set('views', path.join(__dirname, 'view')); //Fetch views under /view
app.set('view engine', 'ejs'); // Initiate view engine
app.use(morgan("dev")); // Enable terminal logging
app.use(bodyParser.urlencoded({ extended: false, limit: '25mb' })); // Max upload size
app.use(bodyParser.json()); // Enable upload of a request with body data
app.use(cookieParser()); //Enable cookie storage
app.use(express.static(path.join(__dirname, 'public'))); // Fetch static content in public folder eg css js images etc

//passport
require("./services/passport-service")(passport); //pass same instance of passport to be used in config.
app.use(passport.initialize());

// Use routers
app.use(require("./router/Index"));

app.use("/api/auth", authRouter.router);
app.use("/api/user", userRouter.router);
app.use("/api/playlist", playlistRouter.router);
// End Use routers


io.of("/api/playlist").on("connection", (socket) => {
	socket.emit("welcome", "this was just a test")
})



//App should listen to request on port ${port}
http.listen(port, () => {
    console.log(`Go to http://localhost:${port} on your browser`)
});
