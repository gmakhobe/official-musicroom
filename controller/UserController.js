const User = require("../model/UserModel");
const bcrypt = require("bcryptjs");

module.exports = {
  //gets all users
  getUsers: (req, res) => {
    User.find({}, (err, users) => {
      if (err) res.json({ success: false });
      else res.json({ success: true, users: users });
    });
  },

  //gets a specific user by ID
  getUserById: (req, res) => {
    User.find({ _id: req.user._id }, (err, user) => {
      if (err) {
        res.json({ success: false });

        res.status(400).json({
          success: false,
          message: `There was an error trying to get user`,
          error: err,
        });
      } else {
		   res.status(200).json({
         success: true,
         message: `Get user by id successful`,
         user: user,
       });
        res.json({ success: true, user: user });
      }
    });
  },

  //update specific user by ID
  putUserById: (req, res) => {
    const updateQuery = {};

    console.log("Our Request  body", req.body);

    if (req.body.firstname) updateQuery.firstname = req.body.firstname;
    if (req.body.lastname) updateQuery.lastname = req.body.lastname;
    if (req.body.username) updateQuery.username = req.body.username;
    if (req.body.password)
      updateQuery.password = bcrypt.hashSync(req.body.password, 10);
    if (req.body.email) updateQuery.email = req.body.email;

    User.find({ _id: req.body.id }, (err, user) => {
      console.log("Info received from DB", user);

      if (err) {
        return res.json({ success: false });
      } else if (!user || !err) {
        User.findOneAndUpdate(
          { _id: req.params.id },
          updateQuery,
          { upsert: true },
          (err, user) => {
            if (err) return res.json({ success: false });
            else {
              console.log("User Info updated", user);
              return res.json({ success: true, updated: user });
            }
          }
        );
      }
    });
  },

  //get user by username
  getUserByUsername: (req, res) => {
    User.find({ username: req.params.username }, (err, user) => {
      if (err) {
        res.json({ success: false });
      } else {
        res.json({ success: true, user: user });
      }
    });
  },
};
