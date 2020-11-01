const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const { signout, signup, signin, isSignedIn } = require("../controllers/auth");

router.post(
  "/signup",
  [
    check("name")
      .isLength({ min: 3 })
      .withMessage("Name must be at least 3 chars long"),
    check("email", "Email is required").isEmail(), // alternate way to define error message
    check("password")
      .isLength({ min: 3 })
      .withMessage("Password must be at least 3 chars long"),
  ],
  signup
);

router.post(
  "/signin",
  [
    check("email", "Email is required").isEmail(),
    check("password")
      .isLength({ min: 3 })
      .withMessage("Password field is required"),
  ],
  signin
);

router.get("/signout", signout);

router.get("/testroute", isSignedIn, (req, res) => {
  res.json(req.auth);
});

// throwing the file contents outside
module.exports = router;
