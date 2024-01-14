const User = require("../models/User");

const { getIdsByUsageType, separateSubscriptions } = require("../utils");
const stripeHelper = require("../Helpers/stripeHelper");

const Subscription = require("../models/subscription"); // Import the Subscription model

require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const subscriptionController = {
  // Create subscription + coupon
  create: async (req, res) => {
    const {
      paymentMethodId,
      selectedProductId,
      subscriptionDescription,

      coupon,
      isDefaultPayment,
      planId,
    } = req.body;

    const { id } = req.user;
    const user = await User.findOne({ _id: id });

    let customerId = user.stripeCustomerId; // Assuming you store the Stripe customer ID in the user object

    if (!user.isRegisteredAtStripe) {
      // If the user doesn't have a Stripe customer ID, register them
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        description: "Registered from app",
      });

      // Update the user's Stripe customer ID in the db
      user.isRegisteredAtStripe = true;
      user.stripeCustomerId = customer.id;
      await user.save();
      customerId = customer.id;
    }

    try {
      if (!isDefaultPayment) {
        // Attaching method as defauld
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
      // getting Price Id
      const { meteredFee, licensedFee } = await stripeHelper.getPrices(
        selectedProductId
      );

      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [
          {
            price: meteredFee?.id,
          },
          {
            price: licensedFee?.id,
          },
        ],
        coupon: coupon,
        default_payment_method: req.body.paymentMethodId,
        description: subscriptionDescription,
      });
      console.log(selectedProductId)
      // Save subscription information in the database
      const newSubscription = await new Subscription({
        userId: user._id,
        stripeSubscriptionId: subscription.id,
        productId: selectedProductId,
        meteredFee: meteredFee,
        licensedFee: licensedFee,
        // coupon: coupon,
        // Add other fields as needed
      });

      await newSubscription.save();
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
    const {
      subItemId,
      newPriceId,
      customerId,
      description,
      newPlanId,
      planFee,
    } = req.body;

    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      const subscriptionItems = await stripe.subscriptionItems.list({
        subscription: subscriptionId,
      });

      const licensedItem = getIdsByUsageType(subscriptionItems, "licensed");

      const prices = await stripe.prices.list({
        product: newPlanId,
      });

      const newPlanAmount = prices?.data?.find(
        (price) => price.recurring.usage_type === "licensed"
      )?.unit_amount;

      // console.log(newPlanAmount)

      const currentPlanAmount = licensedItem?.price?.unit_amount;

      // Check if it's a downgrade
      const isDownGrade = currentPlanAmount > newPlanAmount;

      if (isDownGrade) {
        const current_period_end = subscription.current_period_end;
        // Cancelling the current subscription
        await stripe.subscriptions.update(subscriptionId, {
          cancel_at: current_period_end,
        });

        // Paying susbcription fee + activate usage subscription
        const prices = await stripe.prices.list({
          product: newPlanId,
        });

        const meteredFee = prices?.data?.find(
          (price) => price.recurring.usage_type === "metered"
        );
        const licensedFee = prices?.data?.find(
          (price) => price.recurring.usage_type === "licensed"
        );

        // it will start at the end of the current active subscription period
        const nextRequestedSubscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [
            {
              price: meteredFee?.id,
            },
            {
              price: licensedFee?.id,
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

        // Retrieve the upcoming invoice for the subscription
        const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
          subscription: subscriptionId,
        });
        // Calculate And Charge extra used amount if geater than actual plan price

        // const planFee = 1000; //Previous plan price example
        if (upcomingInvoice?.amount_due > planFee) {
          const extraUsedAmountAtPreviousPlan =
            upcomingInvoice?.amount_due - planFee;
          await stripe.paymentIntents.create({
            amount: extraUsedAmountAtPreviousPlan, // Replace with the actual amount in cents
            currency: upcomingInvoice?.currency, // Replace with the actual currency
            customer: customerId,
            payment_method: defaultPaymentMethodId,
            confirm: true,
            description: "Extra used charges at previous plan",
            return_url: "https://your-website.com/success",
          });
        }

        // Paying susbcription fee + activate usage subscription
        const prices = await stripe.prices.list({
          product: newPlanId,
        });

        const meteredFee = prices?.data?.find(
          (price) => price.recurring.usage_type === "metered"
        );
        const licensedFee = prices?.data?.find(
          (price) => price.recurring.usage_type === "licensed"
        );

        const subscriptionItems = await stripe.subscriptionItems.list({
          subscription: subscriptionId,
        });

        const meteredItem = getIdsByUsageType(subscriptionItems, "metered");
        const licensedItem = getIdsByUsageType(subscriptionItems, "licensed");

        // If it's an upgrade, proceed as before
        const updatedSubscription = await stripe.subscriptions.update(
          subscriptionId,
          {
            items: [
              // Clear previous plan
              {
                id: meteredItem?.id,
                deleted: true,
                clear_usage: true, // Clearing all usage
              },
              {
                id: licensedItem?.id,
                deleted: true,
              },
              // New Price Ids Fee + Metered
              {
                price: meteredFee.id,
              },
              {
                price: licensedFee.id,
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
      // await stripe.subscriptions.del(subscriptionId);
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });

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
    const { id } = req.user;

    try {
      Subscription.find({ userId: id })
        .then((subscriptions) => {
          res.json(subscriptions);
        })
        .catch((error) => {
          console.error("Error fetching subscriptions:", error);
        });
    } catch (error) {
      console.error("Error retrieving active subscriptions:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

module.exports = subscriptionController;
