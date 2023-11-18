require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const customerController = {
  register: async (req, res) => {
    const { email, name, description } = req.body;
    try {
      const customer = await stripe.customers.create({
        email: email,
        name: name,
        description: "Register from app name", // Add a description from the request body
      });

      res.json({ customerId: customer.id });
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

module.exports = customerController;
