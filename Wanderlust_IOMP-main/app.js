// Load environment variables (only in dev)
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// -------------------- IMPORTS --------------------
const express = require("express");
// const paymentRouter = require("./routes/payment");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const ExpressError = require("./utils/ExpressError.js");
const User = require("./models/user.js");

// Routers
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// -------------------- DATABASE CONNECTION --------------------
const dbUrl ="mongodb://localhost:27017/wanderlust" || process.env.ATLASDB_URL ;

async function main() {
  await mongoose.connect(dbUrl);
  console.log("Connected to MongoDB");
}

main().catch((err) => {
  console.error("MongoDB connection error:", err);
});

// -------------------- APP CONFIG --------------------
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
// app.use("/payment", paymentRouter);

// -------------------- SESSION CONFIG --------------------
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: { secret: process.env.SECRET || "thisshouldbeabettersecret" },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => console.error("SESSION STORE ERROR:", err));

const sessionOptions = {
  store,
  secret: process.env.SECRET || "thisshouldbeabettersecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// -------------------- PASSPORT CONFIG --------------------
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// -------------------- GLOBAL MIDDLEWARE --------------------
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// -------------------- ROUTES --------------------
// listings routes (with category filter support)
app.use("/listings", listingRouter);

// reviews nested under listings
app.use("/listings/:id/reviews", reviewRouter);

// user auth routes
app.use("/", userRouter);

// -------------------- 404 HANDLER --------------------
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// -------------------- ERROR HANDLER --------------------
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

// -------------------- SERVER START --------------------
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});