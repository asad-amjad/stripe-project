// const { separateSubscriptions } = require("../utils");
const separateSubscriptions = require("../utils");

require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const subscriptionController = {
  // Create subscription + coupon
  create: async (req, res) => {
    const {
      customerId,
      priceId,
      paymentMethodId,
      subscriptionDescription,
      coupon,
      isDefaultPayment,
      amount,
    } = req.body;

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

        // res.json({ subscriptionId: subscription.id });

        // const confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntent?.id);

        // console.log(confirmedPaymentIntent)

        // const invoice = await stripe.invoices.create({
        //   customer: customerId,
        // });

        // console.log(invoice)
      }


      // const customerBalanceTransaction = await stripe.customers.createBalanceTransaction(
      //   customerId,
      //   {
      //     amount: -500,
      //     currency: 'cad',
      //   }
      // );

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount, // Replace with the actual amount in cents
        currency: "cad", // Replace with the actual currency
        customer: customerId,
        payment_method: paymentMethodId,
        confirm: true, // Ensure automatic confirmation
        return_url: "https://your-website.com/success", // Replace with your actual success URL
      });

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
        billing_cycle_anchor: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // Set to a future timestamp (e.g., 7 days from now)
      });


      // const subscription = await stripe.subscriptions.create({
      //   customer: customerId,
      //   items: [
      //     {
      //       price: priceId,
      //     },
      //   ],
      //   coupon: coupon,
      //   default_payment_method: req.body.paymentMethodId,
      //   description: subscriptionDescription,
      // });
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
        // Cancelling the current subscription
        await stripe.subscriptions.update(subscriptionId, {
          cancel_at: current_period_end,
        });

        // create a new subscription as requuested by the customer
        // it will start at the end of the current active subscription period
        const nextRequestedSubscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [
            {
              price: newPriceId,
            },
          ],
          trial_end: current_period_end,
          billing_cycle_anchor: current_period_end,
        });

        res.status(200).json({
          message:
            "Downgrade subscription request applied, It will start after end of current subscription",
          data: nextRequestedSubscription,
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
      await stripe.subscriptions.del(subscriptionId);

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
  },

  list: async (req, res) => {
    const customerId = req.params.customerId;
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
      });

      const separatedSubscriptions = separateSubscriptions(subscriptions?.data);

      res.json({
        active: separatedSubscriptions.active || {},
        inQueue: separatedSubscriptions.inQueue || {},
      });
    } catch (error) {
      console.error("Error retrieving active subscriptions:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

module.exports = subscriptionController;
