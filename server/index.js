const express = require("express");
const app = express();
require("dotenv").config({ path: "../.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const bodyParser = require("body-parser");
const cors = require("cors");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

let getProductDetails = () => {
  return { currency: "usd", amount: 1099, name: "lemon" };
};

const getSubscriptionDetails = () => {
  return {
    currency: "usd",
    amount: 500, // Monthly subscription amount in cents
    name: "Subscription Name",
  };
};

app.get("/public-key", (req, res) => {
  res.send({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

app.get("/product-details", (req, res) => {
  let data = getProductDetails();
  res.send(data);
});

app.get("/subscription-details", (req, res) => {
  let data = getSubscriptionDetails();
  res.send(data);
});

app.post("/create-payment-intent", async (req, res) => {
  const body = req.body;
  const productDetails = getProductDetails();
  const customerId = req.body.customerId;

  const options = {
    ...body,
    amount: productDetails.amount,
    currency: productDetails.currency,
    customer: customerId,
  };

  try {
    const paymentIntent = await stripe.paymentIntents.create(options);
    res.json(paymentIntent);
  } catch (err) {
    res.json(err);
  }
});

const transactionsDatabase = [];

// Step 1: Create a Customer
app.post("/create-customer", async (req, res) => {
  try {
    const customer = await stripe.customers.create({
      email: req.body.email,
      name: req.body.name,
    });

    res.json({ customerId: customer.id });
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Step 2: Purchase a Product
app.post("/purchase-product", async (req, res) => {
  try {
    console.log(req.body)
    const customerId = req.body.customerId;
    const productPriceInCents = 1000;
    const quantity = 1;

    // Create a PaymentIntent using the default payment method
    const paymentIntent = await stripe.paymentIntents.create({
      amount: productPriceInCents * quantity,
      currency: "usd",
      customer: customerId,
      //Othe Options
      // automatic_payment_methods: {enabled: true},
      // confirm:true
    });

    // TODO: Store the transaction in the database

    res.json({ client_secret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating PaymentIntent:", error);

    // Check the type of error and handle it appropriately
    if (error.type === "StripeCardError") {
      // Handle card-related errors
      return res.status(400).json({ error: error.message });
    } else if (error.type === "StripeInvalidRequestError") {
      // Handle invalid request errors
      return res.status(400).json({ error: error.message });
    } else {
      // Handle other errors (e.g., server errors)
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
});

// app.post("/purchase-product", async (req, res) => {
//   try {
//     const customerId = req.body.customerId;
//     const productId = "prod_OuSY5EHKJsmgJU"; // Product ID from your dashboard
//     const quantity = 1;

//     // Fetch the product price from the Stripe catalog using the product ID
//     const product = await stripe.products.retrieve(productId);

//     if (!product) {
//       return res.status(404).json({ error: "Product not found" });
//     }
//     console.log(product);
//     // Find the appropriate price for the product
//     // const price = product.prices.find(price => price.currency === 'usd');

//     const defaultPriceId = product.default_price;

//     // Retrieve the default price using the price ID
//     const defaultPrice = await stripe.prices.retrieve(defaultPriceId);
//     console.log(defaultPrice);
//     // return defaultPrice;

//     if (!price) {
//       return res.status(404).json({ error: "Price not found for the product" });
//     }

//     // Create a PaymentIntent using the product's price
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: price.unit_amount * quantity,
//       currency: price.currency,
//       customer: customerId,
//     });
//     // console.log(paymentIntent)
//     // Store the transaction in the database

//     res.json({ client_secret: paymentIntent.client_secret });
//   } catch (error) {
//     console.error("Error purchasing product:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// app.post("/purchase-product", async (req, res) => {
//   try {
//     const customerId = req.body.customerId;
//     const priceId = "price_12345"; // Replace with the specific price ID you want to use
//     const quantity = 1;

//     // Create a PaymentIntent using the price ID
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: null, // You don't need to specify the amount when using a price ID
//       currency: "usd", // Replace with the desired currency
//       customer: customerId,
//       payment_method_types: ["card"], // Add other payment method types as needed
//       confirm: true, // Set to true if you want to confirm the PaymentIntent immediately
//       setup_future_usage: "off_session", // Set to 'off_session' if the payment is not intended for immediate use
//       item_list: [
//         {
//           price: priceId, // Specify the price ID
//           quantity: quantity,
//         },
//       ],
//     });

//     // Store the transaction in the database

//     res.json({ client_secret: paymentIntent.client_secret });
//   } catch (error) {
//     console.error("Error purchasing product:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// Step 2: Create a Subscription with the attached PaymentMethod
app.post("/create-subscription", async (req, res) => {
  const customerId = req.body.customerId;
  const paymentMethodId = req.body.paymentMethodId; // Add paymentMethodId to the request

  // const paymentMethodId = req.body.paymentMethodId;
  // const subscriptionDetails = getSubscriptionDetails();
  try {
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set the payment method as the default for the customer
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      // paymentMethodId: paymentMethodId,
      items: [
        {
          price: "price_1O6HlaKwiRWUgRBf2GvkmmYd", // TODO:env
        },
      ],
      default_payment_method: req.body.paymentMethodId, // Use the attached PaymentMethod
    });
    console.log(subscription);

    res.json({ subscription }); // res.json({ client_secret: paymentIntent.client_secret }); // Change the key to "client_secret"
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({ error: "Error creating subscription" });
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

// Define more routes for managing subscription-related operations as needed

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
