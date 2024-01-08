const express = require("express");
const app = express();
require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const bodyParser = require("body-parser");
const cors = require("cors");

const stripeRoutes = require("./routes/stripeRoutes");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.get("/public-key", (req, res) => {
  res.send({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

//Product Id for subscription Plans
app.get("/home-plans", async (req, res) => {
  res.send({
    plans: {
      plan_a: 'prod_PKe9v9k9Zc39Ik',
      plan_b: 'prod_PKFTVWt7NLzP3x',
      // plan_c: 'prod_PKe0Y96e2HgFpD',
    },
  });
});

app.use("/stripe", stripeRoutes);

app.listen(process.env.PORT || 4000, () => {
  console.log("Server is listening on port 4000");
});
