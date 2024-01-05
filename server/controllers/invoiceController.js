require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const invoiceController = {
  list: async (req, res) => {
    const customerId = req.params.customerId;
    try {
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("Stripe secret key not found in environment variables.");
      }

      const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
        customer: customerId,
      });

      res.json(upcomingInvoice);
    } catch (error) {
      console.error("Error fetching upcoming invoice:", error.message);
      res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
  },
};

module.exports = invoiceController;
