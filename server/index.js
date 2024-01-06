const express = require("express");
const app = express();
require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const connectDB = require('./config/db');

const bodyParser = require("body-parser");
const cors = require("cors");

// connectDB(); 
const stripeRoutes = require("./routes/stripeRoutes");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());


// Connect Database

app.get("/public-key", (req, res) => {
  res.send({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

//Product Id for subscription Plans
app.get("/home-plans", async (req, res) => {
  res.send({
    plans: {
      plan_a: process.env.STRIPE_HOME_PLAN_A,
      plan_b: process.env.STRIPE_HOME_PLAN_B,
      plan_c: process.env.STRIPE_HOME_PLAN_C,
    },
  });
});

app.use("/stripe", stripeRoutes);

app.listen(process.env.PORT || 4000, () => {
  console.log("Server is listening on port 4000");
});
