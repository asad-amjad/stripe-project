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
      planId,
    } = req.body;
    try {
      const prices = await stripe.prices.list({
        type: "one_time",
        product: planId,
      });
      const productFee = prices?.data?.find(
        (price) => price.nickname === "fee"
      )?.unit_amount;

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

      await stripe.paymentIntents.create({
        amount: productFee, // Replace with the actual amount in cents
        currency: "cad", // Replace with the actual currency
        customer: customerId,
        payment_method: paymentMethodId,
        confirm: true, // Ensure automatic confirmation
        return_url: "https://your-website.com/success",
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
    const { subItemId, newPriceId, customerId, description, newPlanId } =
      req.body;

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

        // create a new subscription as requested by the customer
        // const prices = await stripe.prices.list({
        //   type: "one_time",
        //   product: planId,
        // });
        // const productFee = prices?.data?.find(
        //   (price) => price.nickname === "fee"
        // )?.unit_amount;

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
        // TODO DB + payment_method_id from ui:
        const customer = await stripe.customers.retrieve(customerId);
        const defaultPaymentMethodId =
          customer.invoice_settings.default_payment_method;

        // Paying susbcription fee
        const prices = await stripe.prices.list({
          type: "one_time",
          product: newPlanId,
        });
        const productFee = prices?.data?.find(
          (price) => price.nickname === "fee"
        )?.unit_amount;

        // Pay extra api charges before updating
        // const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
        //   // customer: customerId,
        //   subscription: subscriptionId,

        // });

        // Retrieve the upcoming invoice for the subscription
        const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
          subscription: subscriptionId,
        });

        // Upcoming invoice object
        const extraUsedAmountAtPreviousPlan = upcomingInvoice?.amount_due; //cents

        const totalAmountToPay = extraUsedAmountAtPreviousPlan + productFee;

        await stripe.paymentIntents.create({
          amount: totalAmountToPay, // Replace with the actual amount in cents
          currency: upcomingInvoice?.currency, // Replace with the actual currency
          customer: customerId,
          payment_method: defaultPaymentMethodId,
          confirm: true,
          return_url: "https://your-website.com/success",
        });

        // If it's an upgrade, proceed as before
        const updatedSubscription = await stripe.subscriptions.update(
          subscriptionId,
          {
            items: [
              {
                id: subItemId,
                deleted: true,
                clear_usage: true,
              },
              {
                price: newPriceId,
              },
            ],
            // proration_behavior: "always_invoice",
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
