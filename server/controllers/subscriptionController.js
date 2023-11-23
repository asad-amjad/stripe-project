require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const subscriptionController = {
  // Create subscription + coupon
  create: async (req, res) => {
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

      res.status(500).json({
        error: "Subscription creation failed. Please try again later.",
      });
    }
  },

  update: async (req, res) => {
    const subscriptionId = req.params.subscriptionId;
    const { subItemId, newPriceId, customerId, description } = req.body;

    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      const currentPlanAmount = await subscription.items.data[0].price
        .unit_amount;
      const newPlanAmount = await stripe.prices
        .retrieve(newPriceId)
        .then((price) => price.unit_amount);

      // Check if it's a downgrade
      const isDownGrade = currentPlanAmount > newPlanAmount;

      if (isDownGrade) {
        const current_period_end = subscription.current_period_end;
        // console.log(subscription)
        const updatesubscription = await stripe.subscriptions.update(
          subscriptionId,
          {
            cancel_at: current_period_end,
          }
        );

        // console.log(updatesubscription);
        // get current end time
        // Start new at end of that time
        // current should stop also

        // const  = await stripe.subscriptions.create({

        const upComingsubscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [
            {
              price: newPriceId,
            },
          ],
          // current_period_start: current_period_end,
          trial_end: current_period_end,
          billing_cycle_anchor: current_period_end,
        });
       


        res.status(200).json({
          message: "Downgrade subscription updated successfully",
          // data: downSubscription,
        });
      } else {
        // If it's an upgrade, proceed as before
        const updatedSubscription = await stripe.subscriptions.update(
          subscriptionId,
          {
            items: [
              {
                id: subItemId,
                deleted: true,
              },
              {
                price: newPriceId,
              },
            ],
            proration_behavior: "always_invoice",
            description: description,
          }
        );

        res.status(200).json({
          message: "Upgrade subscription updated successfully",
          data: updatedSubscription,
        });
      }
    } catch (error) {
      console.error("Error updating subscription:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // cancelSubscription
  cancel: async (req, res) => {
    const { subscriptionId } = req.body;
    try {
      const deletedSubscription = await stripe.subscriptions.del(
        subscriptionId
      );

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

    // OR

    // try {
    //   // Cancel a subscription using the Stripe API
    //   const canceledSubscription = await stripe.subscriptions.update(
    //     subscriptionId,
    //     {
    //       cancel_at_period_end: true, // Optionally set to true if you want to cancel at the end of the billing period
    //     }
    //   );

    //   // You can also update your database to reflect the cancellation
    //   // ...

    //   res.json(canceledSubscription);
    // } catch (error) {
    //   console.error("Error canceling subscription:", error);
    //   res.status(500).json({ error: "Internal Server Error" });
    // }
  },

  list: async (req, res) => {
    const customerId = req.params.customerId;
    try {
      const trialing = await stripe.subscriptions.list({
        status: "trialing",
        customer: customerId,
      });

      const subscriptionInQue = trialing?.data.flatMap((subscription) => {
        return subscription.items.data.map((item) => {
          return item;
        });
      });

      console.log(trialing);
      // console.log(
      //   "trialing.data.trial_end",
      //   new Date(trialing.data[0].trial_end * 1000)
      // );

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
      res.json({
        activeSubscriptions,
        productIds,
        subscriptionInQue: trialing.data[0],
      });
    } catch (error) {
      console.error("Error retrieving active subscriptions:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // TODO:
  calculateInvoice: async (req, res) => {
    const { subscriptionId, subItemId, newPriceId, customerId } = req.body;
    try {
      const proration_date = Math.floor(Date.now() / 1000);

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      const items = [
        {
          id: subscription.items.data[0].id,
          price: newPriceId, // Switch to new price
        },
      ];

      const invoice = await stripe.invoices.retrieveUpcoming({
        customer: customerId,
        subscription: subscriptionId,
        subscription_items: items,
        subscription_proration_date: proration_date,
      });

      res.json({ invoice });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = subscriptionController;

// TODO:
// app.post("/updateSubscription/:subscriptionId", async (req, res) => {
//   const subscriptionId = req.params.subscriptionId;
//   const { subItemId, newPriceId } = req.body;

//   try {
//     // Get the current subscription to calculate the remaining amount
//     const currentSubscription = await stripe.subscriptions.retrieve(
//       subscriptionId
//     );

//     // Check if currentSubscription.items is an array
//     const itemsArray = Array.isArray(currentSubscription.items)
//       ? currentSubscription.items
//       : [];

//     // Calculate the remaining amount by summing up the remaining item amounts
//     const remainingAmount = itemsArray
//       .filter((item) => item.id === subItemId)
//       .reduce((total, item) => total + item.amount_remaining, 0);

//     // Update the subscription with the new price and delete the old item
//     const updatedSubscription = await stripe.subscriptions.update(
//       subscriptionId,
//       {
//         items: [
//           {
//             id: subItemId,
//             deleted: true,
//           },
//           {
//             price: newPriceId,
//           },
//         ],
//         proration_behavior: "always_invoice",
//       }
//     );

//     // If there's a remaining amount, create a refund
//     if (remainingAmount > 0) {
//       const refund = await stripe.refunds.create({
//         payment_intent: updatedSubscription.latest_invoice.payment_intent,
//         amount: remainingAmount,
//       });

//       console.log("Refund created:", refund);
//     }

//     res
//       .status(200)
//       .json({
//         message: "Subscription updated successfully",
//         data: updatedSubscription,
//       });
//   } catch (error) {
//     console.error("Error updating subscription:", error.message);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });
