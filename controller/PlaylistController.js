const Playlist = require("../model/PlaylistModel");
const axios = require("axios");

module.exports = {
  getPlaylists: (req, res) => {
    const parameters = {
      userid: req.user._id,
    };
    Playlist.find().then((lists) => {
      if (lists.length > 0) {
        const PlaylistArray = [];

        lists.forEach((list) => {
          list.users.forEach((userResponse) => {
            if (
              userResponse.id == parameters.userid &&
              list.type == "private"
            ) {
              PlaylistArray.push(list);
            }
          });
        });

        lists.forEach((list) => {
          if (list.type == "public") {
            PlaylistArray.push(list);
          }
        });

        return res.json({
          success: true,
          message: "Public and Private playlist from db",
          playLists: PlaylistArray,
        });
      } else {
        return res.json({
          success: false,
          message: "Playlist db empty",
        });
      }
    });
  },

  addTrack: (req, res) => {
    const parameters = {
      PId: req.body.PId,
      trackId: req.body.trackId,
      userId: req.body.userId,
      creatorId: req.body.creatorId,
    };

    Playlist.findOne({
      _deezerPId: parameters["PId"],
    }).then((playlist) => {
      if (!playlist) {
        return res.status(400).send({
          sucess: false,
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
                res.status(200).send({
                  message: "track successfully added",
                  trackId: parameters.trackId,
                });
              }
            })
            .catch((err) => {
              if (err) {
                return res.status(500).send({
                  sucess: false,
				  message: "track already in playlist",
				  error: err
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
          return res.status(403).send({
            success: false,
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
                res.status(200).send({
                  message: "track successfully added",
                  trackId: parameters.trackId,
                });
              }
            })
            .catch((err) => {
              if (err) {
                return res.status(500).send({
                  sucess: false,
				  message: "track already in playlist",
				  error: err
                });
              }
            });
        });
      }
    });
  },

  delUsers: (req, res) => {
	  const parameters = {
      PId: req.body.PId,
      user: req.body.userId,
      creatorId: req.body.creatorId,
    };

    Playlist.findOne({
      _deezerPId: parameters["PId"],
    }).then((response) => {
      if (!response) {
        return res.status(400).send({
          sucess: false,
          message: "No playlist with that id found",
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
        return res.status(403).send( {
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
            return res.status(200).send({
              success: true,
              message: `User was removed from the room`,
              deletedUserId: deletedUser.id,
            });
          }
        })
        .catch((error) => {
          if (error) {
            return res.status(500).send({
              success: false,
			  message: "Server related error",
			  error
            });
          }
        });
    });
  },

  addUser: (req, res) => {
    const parameters = {
      PId: req.body.PId,
      newUserId: req.body.newUserId,
      creatorId: req.body.creatorId,
      role: req.body.role,
    };

    Playlist.findOne({
      _deezerPId: parameters["PId"],
    })
      .then((playlist) => {
        if (!playlist) {
          return res.status(500).send({
            sucess: false,
            message: "Could not find playlist with that id",
          });
        }

        //is the playlist public?
        if (playlist.type == "public") {
          return res.status().send({
            success: false,
            message: `Cannot add users to public playlist`,
          });
        } else {
          //the playlist is private

          //check if newUser exist
          User.findOne({
            _id: parameters["newUserId"],
          }).then((newUser) => {
            if (!newUser) {
              return res.status(400).send({
                success: false,
                message: "User you are trying to add does not exist",
              });
            }
            if (newUser._id.toString() == parameters["creatorId"]) {
              return res.status(400).send({
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
              return res.status(403).send({
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
                  return res.status(200).send({
                    success: true,
                    message: `A new user been added to the playlist`,
                    newUserId: parameters.newUserId,
                  });
                }
              })
              .catch((error) => {
                if (error) {
                  return res.status(500).send({
                    sucess: false,
					message: "Server related error occured!",
					error
                  });
                }
              });
          });
        }
      })
      .catch((error) => {
        if (error) {
          return res.status(500).send({
            sucess: false,
			message: "Server related error occured!",
			error
          });
        }
      });
  },

  createPlaylist: (req, res) => {
    Playlist.findOne({
      name: req.body.title,
    })
      .then((ExistingPlaylist) => {
        if (ExistingPlaylist) {
          return res.status(409).send({
            success: false,
            message: "Playlist with a name already exist!",
          });
        } else {
          const url = `https://api.deezer.com/user/${req.user._deezerId}/playlists?title=${req.body.title}&access_token=${req.user.deezerToken}`;

          axios
            .post(url)
            .then((result) => {
              const parameters = {
                _deezerPId: result.data.id,
                name: req.body.title,
                type: req.body.type,
              };
              const Newplaylist = new Playlist(parameters);

              //Save playlist
              Newplaylist.save((error, playlist) => {
                if (error) {
                  return res.status(500).send({
                    sucess: false,
					message: "Server related error occured!",
					error: error
                  });
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
                          return res.status(500).send({
                            sucess: false,
							message: "Server related error occured!",
							error: err
                          });
                        }

                        return res.status(201).send({
                          success: true,
                          message: "playlist successfully created",
                          playlist: newPlaylist,
                        });
                      }
                    );
                  })
                  .catch((err) => {
                    if (err) {
                      return res.status(500).send({
                        success: false,
						message: "Server related error occured!",
						error: err
                      });
                    }
                  });
              });
            })
            .catch((err) => {
              if (err) {
                return res.status(500).send({
                  sucess: false,
				  message: "Server related error occured!",
				  error: err
                });
              }
            });
        }
      })
      .catch((err) => {
        if (err) {
          return res.status(500).send({
            sucess: false,
			message: "Server related error occured!",
			error: err
          });
        }
      });
  },
};
