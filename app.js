if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const { success, error } = require("consola");
const authRoutes = require("./routes/routes.js");
const session = require("express-session");
const LocalStrategy = require("passport-local").Strategy;
const MongoStore = require("connect-mongo");
const User = require("./models/model.js");
const { connect, connection } = require("mongoose");
const passport = require("passport");
const flash = require("express-flash");
const initializePassport = require("./passport-config");
const methodOverride = require("method-override");
const path = require('path');
const PORT = process.env.PORT || 3000;
const DB = process.env.DB;

initializePassport(passport);


app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: DB }),
    cookie: {
      maxAge: 1000 * 30,
      sameSite: "strict",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(authRoutes);

const startApp = async () => {
  try {
    await connect(DB, {
      useFindAndModify: true,
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    success({
      message: `Successfully connected with the Database!!`,
      badge: true,
    });

    app.listen(PORT, () => {
      success({
        message: `Server is Successfully listening on PORT: ${PORT}!!`,
        badge: true,
      });
    });
  } catch (err) {
    error({ message: `Unable to connect with Database\n ${err}`, badge: true });

    startApp();
  }
};

app.get("/", checkAuthenticated , (req, res) => {
  res.redirect('/home')

});

app.get("/home", checkAuthenticated , (req, res) => {
  res.render("home", { name: req.user.username });

});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

startApp();
