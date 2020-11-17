const nodemailer = require("nodemailer");
const passport = require("passport");
const chalk = require("chalk");
const { v4: uuidv4 } = require("uuid");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../model/UserModel");
const keys = require("../config/keys");

module.exports = {
  isAuthenticated: (req, res) => {
    if (req.isAuthenticated())
      res.status(200).json({ code: 200, auth: true, user: req.user });
    else res.status(401).json({ code: 401, auth: false });
  },

  logout: (req, res) => {
    req.logout();
    res.json({ disconnected: true });
  },

  connect: (req, res) => {
    if (req.user) {
      const payload = {
        _id: req.user._id,
        username: req.user.username,
      };

      JWT.sign(payload, keys.JWT.secret, { expiresIn: "1d" }, (err, token) => {
        res.redirect(`http://localhost:5000/login?token=Bearer ${token}`);
      });
    } else {
      res.redirect("http://localhost:5000/login");
    }
  },

  confirm: (req, res) => {
    const key = req.body.key;
    User.findOneAndUpdate(
      { confirmKey: key },
      { confirmKey: "confirmed" },
      (err, user) => {
        if (err) return res.json({ success: false, error: err });
        else if (user) return res.json({ success: true });
        else return res.json({ success: false });
      }
    );
  },
  unlink: (req, res) => {
    User.find({ _id: req.params.userId }, (err, user) => {
      User.findByIdAndUpdate({ _id:req.params.userId },
        { deezerToken: "" , _deezerId: ""},
        { new: true },
        (err, user) => { 
          if (err) return res.json({ success: false, error: err });
          else if (user) return res.json({ success: true });
          else return res.json({ success: false });
        }
      );
    
    });
  },
  
};

