const express = require("express");
const app = express();
require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const bodyParser = require("body-parser");
const cors = require("cors");
const { getProductDetails } = require("./data");

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
      plan_a: process.env.STRIPE_HOME_PLAN_A,
      plan_b: process.env.STRIPE_HOME_PLAN_B,
      plan_c: process.env.STRIPE_HOME_PLAN_C,
    },
  });
});

app.use("/stripe", stripeRoutes);

// app.post("/calculateInvoice", async (req, res) => {
//   const { subscriptionId, subItemId, newPriceId, customerId } = req.body;
//   try {
//     const proration_date = Math.floor(Date.now() / 1000);

//     const subscription = await stripe.subscriptions.retrieve(subscriptionId);

//     const items = [
//       {
//         id: subscription.items.data[0].id,
//         price: newPriceId, // Switch to new price
//       },
//     ];

//     const invoice = await stripe.invoices.retrieveUpcoming({
//       customer: customerId,
//       subscription: subscriptionId,
//       subscription_items: items,
//       subscription_proration_date: proration_date,
//     });

//     res.json({ invoice });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// app.post('/update-card', async (req, res) => {
//   const { customerId, paymentMethodId, cardNumber, expiryDate, cvc } = req.body;
//   try {
//       // Update the payment method details in Stripe
//       await stripe.paymentMethods.update(paymentMethodId, {
//           card: {
//               number: cardNumber,
//               exp_month: parseInt(expiryDate.split('/')[0]),
//               exp_year: parseInt(expiryDate.split('/')[1]),
//               cvc: cvc,
//           },
//       });

//       res.json({ success: true, message: 'Card updated successfully' });
//   } catch (error) {
//       console.error(error);
//       res.status(500).json({ success: false, message: 'Error updating card' });
//   }
// });



// Step 5: Retrieve Transaction History (Optional)
app.get("/transaction-history/:customerId", async (req, res) => {
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
});

app.listen(process.env.PORT || 4000, () => {
  console.log("Server is listening on port 4000");
});
