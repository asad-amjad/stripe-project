require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const paymentMethodController = {
    list: async (req, res) => {
    const { customerId } = req.body;

    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
      });
      const customer = await stripe.customers.retrieve(customerId);
      let defaultPaymentMethod;

      // Check if the customer has a default payment method
      if (customer.invoice_settings.default_payment_method) {
        // Retrieve the default payment method details
        defaultPaymentMethod = await stripe.paymentMethods.retrieve(
          customer.invoice_settings.default_payment_method
        );
      }

      res.json({
        paymentMethods: paymentMethods.data,
        defaultPaymentMethod,
      });
    } catch (error) {
      console.error("Error retrieving payment methods:", error);
      // Send a more informative error response
      res.status(500).json({ error: "Failed to retrieve payment methods" });
    }
  },

// updateDefaultMethod
  setDefault: async (req, res) => {
    try {
      const { customerId, newPaymentMethodId } = req.body;
      // Update the default payment method for the customer
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: newPaymentMethodId,
        },
      });

      res.status(200).json({
        success: true,
        message: "Default payment method updated successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  },
  
  addNewMethod: async (req, res) => {
    try {
        const { token, customerId } = req.body;
        const paymentMethod = await stripe.paymentMethods.create({
          type: "card",
          card: {
            token: token.id,
          },
        });
        await stripe.paymentMethods.attach(paymentMethod.id, {
          customer: customerId,
        });
    
        res
          .status(200)
          .json({ success: true, message: "Payment method added successfully" });
      } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
      }
  },
};

module.exports = paymentMethodController;
