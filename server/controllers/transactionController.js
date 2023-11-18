require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const transactionController = {
  list: async (req, res) => {
    const customerId = req.params.customerId;
    try {
      const transactions = await stripe.paymentIntents.list({
        customer: customerId,
      });
      res.json(transactions);
    } catch (error) {
      console.error("Error retrieving transaction history:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

module.exports = transactionController;
