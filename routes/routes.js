const router = require("express").Router();
const User = require("../models/model.js");
const bcrypt = require("bcryptjs");
const passport = require("passport");

router.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register");
});

router.post("/register", checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hashSync(req.body.password, 10);
    let content = new User({
      username: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });
    try {
      await content.save();
      res.redirect("/login");
    } catch (e) {
      console.log(`Error saving users: ${e}`);
      res.redirect("/register");
    }
  } catch (err) {
    console.log(err);
  }
});

router.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

router.get("/login", checkNotAuthenticated, (req, res, next) => {
  res.render("login");
});

router.get("/about", checkAuthenticated , (req, res, next) => {
  res.render("about");
});

router.delete("/logout" , checkAuthenticated, (req, res) => {
  req.logOut();
  res.redirect("/login");
});

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/home");
  }
  next();
}

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}
module.exports = router;
