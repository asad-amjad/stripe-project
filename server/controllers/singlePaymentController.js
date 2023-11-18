const { getProductDetails } = require("../data");

require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// Pending
const singlePaymentController = {
  createIntent: async (req, res) => {
    const body = req.body;
    const productDetails = getProductDetails(); //TODO: Use stripe product id for details
    const customerId = req.body.customerId;

    const options = {
      amount: productDetails.amount,
      currency: productDetails.currency,
      customer: customerId,
      // setup_future_usage: 'off_session',
      // save_payment_method:true,
      // off_session: true,
      // confirm: true,
      // automatic_payment_methods: {
      //   enabled: true,
      // },
    };

    try {
      const paymentIntent = await stripe.paymentIntents.create(options);
      res.json({ clientSec: paymentIntent.client_secret });
    } catch (err) {
      return res.json(err);
    }
  },
};

module.exports = singlePaymentController;
