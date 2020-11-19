const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const passport = require("passport");
const morgan = require("morgan");
const chalk = require("chalk");
const mongoose = require("mongoose");
const keys = require("./config/keys");
const authRouter = require("./router/authRouter");
const userRouter = require("./router/userRouter");
const searchRouter = require("./router/searchRouter");
const playlistRouter = require("./router/playlistRouter");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const Playlist = require("./model/PlaylistModel");
const axios = require("axios");

const port = 5000;

const swaggerUI = require("swagger-ui-express");
const swaggerJsDocs = require("swagger-jsdoc");
const User = require("./model/UserModel");
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
app.set("views", path.join(__dirname, "view")); //Fetch views under /view
app.set("view engine", "ejs"); // Initiate view engine
app.use(morgan("dev")); // Enable terminal logging
app.use(bodyParser.urlencoded({ extended: false, limit: "25mb" })); // Max upload size
app.use(bodyParser.json()); // Enable upload of a request with body data
app.use(cookieParser()); //Enable cookie storage
app.use(express.static(path.join(__dirname, "public"))); // Fetch static content in public folder eg css js images etc

//passport
require("./services/passport-service")(passport); //pass same instance of passport to be used in config.
app.use(passport.initialize());

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "Music Room",
      description: "Music Room API Documentation",
      servers: ["http://localhost:5000"],
      version: "2.0",
    },
  },
  apis: [
    "./router/playlistRouter.js",
    "./router/searchRouter.js",
    "./router/userRouter.js",
  ],
};

const swaggerDocs = swaggerJsDocs(swaggerOptions);
// Use routers
app.use(require("./router/Index"));
app.use("/api/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));
app.use("/api/auth", authRouter.router);
app.use("/api/user", userRouter.router);
app.use("/api/search", searchRouter.router);
app.use("/api/explore", playlistRouter.router);

// End Use routers

io.of("/api/playlist").on("connection", (socket) => {
  socket.emit("welcome", "Welcome to Music Room");

  socket.on("remove user", (data) => {
    const parameters = {
      PId: data.PId,
      user: data.userId,
      creatorId: data.creatorId,
    };

    Playlist.findOne({
      _deezerPId: parameters["PId"],
    }).then((response) => {
      if (!response) {
        return socket.emit("remove user error", {
          success: false,
          message: "An error occured getting Private playlist from db",
        });
      }

      let test = false;
      /* check if creator */
      response.users.forEach((currentUser, key) => {
        //check if creator
        if (
          currentUser.id == parameters["creatorId"] &&
          currentUser.role == "RW"
        ) {
          test = true;
        }
      });
      if (!test) {
        return socket.emit("remove user error", {
          success: false,
          message: "User not permitted to perform action",
        });
      }

      let index = -1;

      /* find the index of user to be deleted in users array */
      response.users.forEach((user, key) => {
        if (parameters["user"] == user.id) {
          index = key;
        }
      });

      const deletedUser = response.users.splice(index, 1);

      Playlist.findOneAndUpdate(
        {
          _deezerPId: parameters["PId"],
        },
        {
          $set: {
            users: response.users,
          },
        },
        {
          new: true,
        }
      )
        .then((list) => {

          if (list) {

            return socket.emit("remove user success", {
                success: true,
                message: `User was removed from the room`,
                deletedUserId: deletedUser.id,
              });
          }

        })
        .catch((error) => {
          if (error) {
            return socket.emit("remove user error", {
              success: false,
              message: "Server related error",
            });
          }
        });
    });
  });

  socket.on("join room", (data) => {
    /* check playlist in db */

    const parameters = {
      PId: data.PId,
      newUserId: data.newUserId,
      creatorId: data.creatorId,
      role: data.role,
    };

    Playlist.findOne({
      _deezerPId: parameters["PId"],
    })
      .then((playlist) => {
        if (!playlist) {
          return socket.emit("add user error", {
            success: false,
            message: "An error occured getting Private playlist from db",
          });
        }

        //is the playlist public?
        if (playlist.type == "public") {
          User.findOne({ _id: parameters["newUserId"] })
            .then((user) => {
              socket.join(parameters["PId"]);
              return io
                .of("/api/playlist")
                .in(parameters["PId"])
                .emit("add user success", {
                  success: true,
                  message: `${user.username} has joined the room`,
                  newUserId: parameters.newUserId,
                });
            })
            .catch((err) => {
              if (err) {
                return socket.emit("add user error", {
                  success: false,
                  message:
                    "An error occured getting Public and Private playlist from db",
                });
              }
            });
        } else {
          //the playlist is private

          //check if newUser exist
          User.findOne({
            _id: parameters["newUserId"],
          }).then((newUser) => {
            if (!newUser) {
              socket.emit("add user error", {
                success: false,
                message: "User you are trying to add does not exist",
              });
            }
            if (newUser._id.toString() == parameters["creatorId"]) {
              socket.emit("add user error", {
                success: false,
                message: "Cannot add playlist creator to their own playlist",
              });
            }

            let test = false;
            let doubleUser = false;
            let index = -1;

            playlist.users.forEach((currentUser, key) => {
              //check if creator
              if (
                currentUser.id == parameters["creatorId"] &&
                currentUser.role == "RW"
              ) {
                test = true;
              }
              //check if new user is already in the playlist
              if (newUser._id.toString() == currentUser.id) {
                doubleUser = true;
                index = key;
              }
            });
            if (!test) {
              return socket.emit("add user error", {
                success: false,
                message: "User not permitted to access playlist",
              });
            }

            //get all users from playlist
            let users = playlist.users;

            if (!doubleUser) {
              users.push({
                id: newUser._id,
                firstname: newUser.firstname,
                lastname: newUser.lastname,
                role: parameters["role"],
                creator: false,
              });
            } else {
              //if user already in room, update his info
              users[index] = {
                id: newUser._id,
                firstname: newUser.firstname,
                lastname: newUser.lastname,
                role: parameters["role"],
                creator: false,
              };
            }
            //update user array
            Playlist.findOneAndUpdate(
              {
                _deezerPId: parameters["PId"],
              },
              {
                $set: {
                  users,
                },
              },
              {
                new: true,
              }
            )
              .then((list) => {
                if (list) {
                  socket.join(parameters["PId"]);
                  return io
                    .of("/api/playlist")
                    .in(parameters["PId"])
                    .emit("add user success", {
                      success: true,
                      message: `A new user has joined the room`,
                      newUserId: parameters.newUserId,
                    });
                }
              })
              .catch((error) => {
                console.log(error);

                if (error) {
                  return socket.emit("add user error", {
                    success: false,
                    message: "Server related error",
                  });
                }
              });
          });
        }
      })
      .catch((error) => {
        if (error) {
          return socket.emit("add user error", {
            success: false,
            message: "Server related error",
          });
        }
      });
  });

  //get local + deezer playlist info
  socket.on("get playlist", (userInfo) => {
    const parameters = {
      userid: userInfo.userId,
    };

    Playlist.find().then((lists) => {
      if (lists.length > 0) {
        const PlaylistArray = [];

        lists.forEach((list) => {
          list.users.forEach((newUser) => {
            if (newUser.id == parameters.userid && list.type == "private") {
              PlaylistArray.push(list);
            }
          });
        });

        lists.forEach((list) => {
          if (list.type == "public") {
            PlaylistArray.push(list);
          }
        });

        socket.emit("get all playlist", {
          success: true,
          message: "Public and Private playlist from db",
          playLists: PlaylistArray,
        });
      } else {
        socket.emit("get all playlist error", {
          success: false,
          message:
            "An error occured getting Public and Private playlist from db",
        });
      }
    });
  });

  socket.on("playlist data", ({ _deezerPId }) => {
    /* is it in db */

    Playlist.findOne({ _deezerPId: _deezerPId }).then((playlistInfo) => {
      const url = `https://api.deezer.com/playlist/${playlistInfo._deezerPId}`;

      axios
        .get(url)
        .then((deezerPlaylist) => {
          socket.emit("playlist data success", {
            success: true,
            message: "Playlist info",
            playlistDetails: [playlistInfo, deezerPlaylist.data],
          });
        })
        .catch((err) => {
          console.log("there was an err", err);
        });
    });
  });

  //add track
  socket.on("add track", (data) => {
    const parameters = {
      PId: data.PId,
      trackId: data.trackId,
      userId: data.userId,
      creatorId: data.creatorId,
    };

    Playlist.findOne({
      _deezerPId: parameters["PId"],
    }).then((playlist) => {
      if (!playlist) {
        return socket.emit("add track error", {
          message: "No playlist with that id found",
        });
      }

      //is the playlist public?
      if (playlist.type == "public") {
        //get creator token
        User.findOne({ _id: parameters.creatorId }).then((playlistCreator) => {
          const creatorToken = playlistCreator.deezerToken;

          //add track to dezeer playlist
          const url = `https://api.deezer.com/playlist/${parameters.PId}/tracks?request_method=post&songs=${parameters.trackId}&access_token=${creatorToken}`;

          axios
            .get(url)
            .then((result) => {
              if (result) {
                socket.emit("add track success", {
                  message: "track successfully added",
                  trackId: parameters.trackId,
                });
              } else {
                console.log("could not add track bozza!!!");
                socket.emit("add track error", {
                  message: "could not add track",
                });
              }
            })
            .catch((err) => {
              if (err) {
                socket.emit("add track error", {
                  message: "Track already added",
                });
              }
            });
        });
      } else {
        let test = false;

        playlist.users.forEach((user) => {
          if (user.id == parameters["userId"] && user.role == "RW") {
            test = true;
          }
        });

        if (!test) {
          return socket.emit("add track error", {
            message: "You are not allowed to add track to this playlist",
          });
        }

        User.findOne({ _id: parameters.creatorId }).then((playlistCreator) => {
          const creatorToken = playlistCreator.deezerToken;

          //add track to dezeer playlist
          const url = `https://api.deezer.com/playlist/${parameters.PId}/tracks?request_method=post&songs=${parameters.trackId}&access_token=${creatorToken}`;

          axios
            .get(url)
            .then((result) => {
              if (result) {
                socket.emit("add track success", {
                  message: "track successfully added",
                  trackId: parameters.trackId,
                });
              } else {
                console.log("could not add track bozza!!!");
                socket.emit("add track error", {
                  message: "could not add track",
                });
              }
            })
            .catch((err) => {
              if (err) {
                socket.emit("add track error", {
                  message: "Track already added",
                });
              }
            });
        });
      }
    });
  });

  socket.on("create playlist", (playlistInfo) => {
    Playlist.findOne({ name: playlistInfo.title })
      .then((ExistingPlaylist) => {
        if (ExistingPlaylist) {
          socket.emit(
            "create playlist error",
            "Playlist with a name already exist!"
          );
        } else {
          const url = `https://api.deezer.com/user/${playlistInfo._deezerId}/playlists?title=${playlistInfo.title}&access_token=${playlistInfo.deezerToken}`;

          axios
            .post(url)
            .then((result) => {
              const parameters = {
                _deezerPId: result.data.id,
                name: playlistInfo.title,
                type: playlistInfo.type,
              };

              const Newplaylist = new Playlist(parameters);

              Newplaylist.save((error, playlist) => {
                if (error) {
                  socket.emit(
                    "server error",
                    "there was a problem saving the playlist in the db"
                  );
                }

                User.findOne({ _id: playlistInfo.userId })
                  .then((user) => {
                    Playlist.findByIdAndUpdate(
                      { _id: playlist._id },
                      {
                        $push: {
                          users: {
                            id: user._id,
                            firstname: user.firstname,
                            lastname: user.lastname,
                            role: "RW",
                            creator: true,
                          },
                        },
                      },
                      { new: true },
                      (err, newPlaylist) => {
                        if (err) {
                          socket.emit(
                            "server error",
                            "there was a problem saving the playlist in the db"
                          );
                        }

                        socket.emit("create playlist success", {
                          message: "playlist successfully created",
                          playlist: newPlaylist,
                        });
                      }
                    );
                  })
                  .catch((err) => {});
              });
            })
            .catch((err) => {
              socket.emit(
                "server error",
                "there was a problem saving the playlist in the db"
              );
            });
        }
      })
      .catch((err) => {
        socket.emit(
          "server error",
          "there was a problem saving the playlist in the db"
        );
      });
  });
});

//App should listen to request on port ${port}
http.listen(port, () => {
  console.log(`Go to http://localhost:${port} on your browser`);
});
