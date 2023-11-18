require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const customerController = {
  register: async (req, res) => {
    try {
      const { email, name, description } = req.body;

      const customer = await stripe.customers.create({
        email,
        name,
        description: description || "Registered from app",
      });

      res.json({ customerId: customer.id });
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

module.exports = customerController;
