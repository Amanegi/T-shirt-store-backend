const User = require("../models/user");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const { check, validationResult } = require("express-validator");

exports.signup = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
      param: errors.array()[0].param,
    });
  }

  const user = new User(req.body);
  user.save((err, user) => {
    if (err) {
      return res.status(400).json({
        err: err.message,
      });
    }
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
    });
  });
};

exports.signin = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
      param: errors.array()[0].param,
    });
  }

  const { email, password } = req.body;
  // finds first exact match from mongodb
  User.findOne({ email }, (err, user) => {
    // check if email is correct
    if (err || !user) {
      return res.status(400).json({
        error: "User email does not exists",
      });
    }

    // check if password is correct
    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: "Incorrect password",
      });
    }

    // create token
    const token = jwt.sign({ _id: user._id }, process.env.SECRET);
    // put token in cookie
    res.cookie("token", token, { expire: new Date() + 9999 });
    // send response to frontend
    const { _id, name, email, role } = user;
    return res.json({ token, user: { _id, name, email, role } });
  });
};

exports.signout = (req, res) => {
  // remove token from cookie
  res.clearCookie("token");
  res.json({
    message: "User successfully signed out",
  });
};

// protected routes
exports.isSignedIn = expressJwt({
  secret: process.env.SECRET,
  userProperty: "auth",
  algorithms: ["HS256"],
  // the third part middlewares already have next in them so we don't need to define
});

// custom middlewares
exports.isAuthenticated = (req, res, next) => {
  let checker = req.profile && req.auth && req.profile._id == req.auth._id;
  // req.profile -> to be set up from frontend
  // req.auth -> set in userProperty of isSignedIn
  if (!checker) {
    return res.status(403).json({
      error: "Access Denied!!!",
    });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0) {
    return res.status(403).json({
      error: "Admin Rights Denied",
    });
  }
  next();
};
