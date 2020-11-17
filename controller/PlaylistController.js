const Playlist = require("../model/PlaylistModel");
const axios = require("axios");

module.exports = {
  getPlaylists: (req, res) => {
	  const parameters = {
      userid: req.user._id
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

  createPlaylist: (req, res) => {
    Playlist.findOne({
      name: req.body.title,
    })
      .then((response) => {
        if (response) {
          return res.status(400).send({
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
              const playlist = new Playlist(parameters);

              //Save playlist
              playlist.save((error, playlist) => {
                if (error) {
                  return res.status(500).send({
                    message: "Server related error occured!",
                  });
                }

                Playlist.findByIdAndUpdate(
                  { _id: playlist._id },
                  {
                    $push: {
                      users: { id: req.user._id, role: "RW", creator: true },
                    },
                  },
                  { new: true },
                  (err, newPlaylist) => {
                    if (err) {
                      const resStatusCode = 500;
                      const fullError = { success: false, errors: err };
                      const message = "Something went wrong in server";
                      return generateServerError(
                        res,
                        resStatusCode,
                        fullError,
                        message
                      );
                    }

                    return res.status(200).send({
                      success: true,
                      message: "playlist successfully created",
                      playlist: newPlaylist,
                    });
                  }
                );
              });
            })
            .catch((err) => {
              const resStatusCode = 500;
              const fullError = { success: false, errors: err };
              const message = "Something went wrong in server";
              return generateServerError(
                res,
                resStatusCode,
                fullError,
                message
              );
            });
        }
      })
      .catch((err) => {
        const resStatusCode = 500;
        const fullError = { success: false, errors: err.array() };
        const message = "Something went wrong in server";
        return generateServerError(res, resStatusCode, fullError, message);
      });
  },
};
