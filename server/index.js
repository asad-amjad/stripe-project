const express = require("express");
const app = express();
require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const bodyParser = require("body-parser");
const cors = require("cors");
const { getProductDetails, getSubscriptionDetails } = require("./data");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.get("/public-key", (req, res) => {
  res.send({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

app.get("/product-details", (req, res) => {
  let data = getProductDetails();
  res.send(data);
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

app.get("/my-active-subscriptions/:customerId", async (req, res) => {
  const customerId = req.params.customerId;
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
    });

    const activeSubscriptions = subscriptions.data;

    const productIds = activeSubscriptions.flatMap((subscription) => {
      return subscription.items.data.map((item) => {
        return item.price.product;
      });
    });
    res.json({ activeSubscriptions, productIds });
  } catch (error) {
    console.error("Error retrieving active subscriptions:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/cancel-subscription", async (req, res) => {
  const { subscriptionId } = req.body;
  try {
    const deletedSubscription = await stripe.subscriptions.del(subscriptionId);

    res.json({
      success: true,
      message: `Subscription ${subscriptionId} cancelled successfully`,
    });
  } catch (error) {
    console.error(
      `Error cancelling subscription ${subscriptionId}:`,
      error.message
    );
    res
      .status(500)
      .json({ error: `Failed to cancel subscription ${subscriptionId}` });
  }
});

app.post("/create-customer", async (req, res) => {
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
});

app.post("/update-payment-method", async (req, res) => {
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
});

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

// Get product details from Stripe
app.get("/get-product-details/:productId", async (req, res) => {
  const productId = req.params.productId;
  try {
    const product = await stripe.products.retrieve(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product) {
      const price = await stripe.prices.retrieve(product.default_price);
      product.extended_price_details = price; //Send price details
    }

    res.json({ product });
  } catch (error) {
    console.error("Error retrieving product details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Customer payment method list
app.post("/payment-method-list", async (req, res) => {
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
});

app.post("/add-new-payment-method", async (req, res) => {
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
});

// Pending: Attch payment method to customer
app.post("/attach-payment-method", async (req, res) => {
  const { customerId, paymentMethodId } = req.body;
  try {
    // console.log(customerId, paymentMethodId);
    // Attach the payment method to the customer
    // await stripe.paymentMethods.attach(paymentMethodId, {
    //   customer: customerId,
    // });

    const bb = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
    console.log(bb, "s");
    // Set the payment method as the default for the customer
    const dd = await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    console.log("dd", dd);
    // res.json({
    //   success: true,
    //   message: "Payment method attached successfully",
    // });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/create-payment-intent", async (req, res) => {
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
});

app.post("/validate-coupon", async (req, res) => {
  const { couponCode } = req.body;

  try {
    const promotionCodes = await stripe.promotionCodes.list({
      limit: 10,
    });

    const promotion = promotionCodes?.data?.find(
      (promo) => promo.code === couponCode
    );

    if (!promotion) {
      res.json({ valid: false, error: "In valid" });
    }

    if (promotion) {
      const couponDetails = {
        couponId: promotion.coupon.id,
        couponName: promotion.coupon.name,
        percentageOff: promotion.coupon.percent_off,
      };

      res.json({ valid: true, couponDetails });
    }
  } catch (error) {
    res.json({ valid: false, error: error.message });
  }
});

// Step 2: Create a Subscription with the attached PaymentMethod
app.post("/create-subscription", async (req, res) => {
  const customerId = req.body.customerId;
  const priceId = req.body.priceId;
  const paymentMethodId = req.body.paymentMethodId;
  const subscriptionDescription = req.body.subscriptionDescription;
  const coupon = req.body.coupon;
  const isDefaultPayment = req.body.isDefaultPayment;

  try {
    if (!isDefaultPayment) {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Set the payment method as the default for the customer
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: priceId,
        },
      ],
      coupon: coupon,
      default_payment_method: req.body.paymentMethodId,
      description: subscriptionDescription,
    });
    res.json({ subscriptionId: subscription.id });
  } catch (error) {
    console.error("Error creating subscription:", error);

    res
      .status(500)
      .json({ error: "Subscription creation failed. Please try again later." });
  }
});

// Define a route for handling subscription cancellations
app.post("/cancel-subscription", async (req, res) => {
  const { subscriptionId } = req.body;

  try {
    // Cancel a subscription using the Stripe API
    const canceledSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end: true, // Optionally set to true if you want to cancel at the end of the billing period
      }
    );

    // You can also update your database to reflect the cancellation
    // ...

    res.json(canceledSubscription);
  } catch (error) {
    console.error("Error canceling subscription:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Step 3: Retrieve Customer Information and Transaction History
app.get("/get-customer/:customerId", async (req, res) => {
  const customerId = req.params.customerId;
  try {
    const customer = await stripe.customers.retrieve(customerId);
    const customerTransactions = transactionsDatabase.filter(
      (transaction) => transaction.customerId === customerId
    );
    res.json({ customer, transactions: customerTransactions });
  } catch (error) {
    console.error("Error retrieving customer:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

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
