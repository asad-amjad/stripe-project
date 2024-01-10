const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const cors = require("cors");
const path = require("path");
const db = require("./config/keys").mongoURI;
const {mongoURI} = require("./config/keys");

// Routes
const users = require("./routes/users");
const stripeRoutes = require("./routes/stripeRoutes");

const app = express();

// Bodyparser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Enable CORS
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(
    mongoURI
    // { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("MongoDB successfully connected"))
  .catch((err) => console.log(err));

// Passport middleware
app.use(passport.initialize());

// Passport config
require("./config/passport")(passport);

// API Routes
app.get("/public-key", (req, res) => {
  res.send({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

//Product Id for subscription Plans
app.get("/home-plans", async (req, res) => {
  res.send({
    plans: {
      plan_a: process.env.STRIPE_HOME_PLAN_A,
      plan_b: process.env.STRIPE_HOME_PLAN_B,
      // plan_c: 'prod_PKe0Y96e2HgFpD',
    },
  });
});

app.use("/api/users", users);
app.use("/stripe", stripeRoutes);

// Serve static assets if in production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const port = process.env.PORT || 4000;

app.listen(port, () => console.log(`Server up and running on port ${port}!`));
