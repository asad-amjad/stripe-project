const express = require("express");
const router = express.Router();

const usersRoutes = require("./users");
const stripeRoutes = require("./stripeRoutes");

router.get("/public-key", (req, res) => {
  res.send({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

router.use("/api/users", usersRoutes);
router.use("/stripe", stripeRoutes);


module.exports = router;
