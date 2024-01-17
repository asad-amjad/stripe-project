const User = require("../models/User");

// const { getIdsByUsageType, separateSubscriptions } = require("../utils");
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
      // subscriptionDescription,
      coupon,
      isDefaultPayment,
    } = req.body;

    const { id } = req.user;
    const user = await User.findOne({ _id: id });

    let customerId = user?.stripeCustomerId;

    if (!user.isRegisteredAtStripe) {
      // If the user doesn't have a Stripe customer ID, register them
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        description: "Registered from app",
      });

      // Update the user's Stripe customer ID in the db
      user.isRegisteredAtStripe = true;
      user.stripeCustomerId = customer?.id;
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
        // description: subscriptionDescription,
      });

      // Save subscription information in the db
      const newSubscription = await new Subscription({
        userId: user._id,
        customer: subscription.customer,
        stripeSubscriptionId: subscription.id,
        productId: selectedProductId,
        status: subscription.status,
        items: subscription.items?.data,
        currentPeriodStart: subscription.current_period_start, // Convert UNIX timestamp to JavaScript Date
        currentPeriodEnd: subscription.current_period_end,
        created: subscription.created,
        currency: subscription.currency,
        paymentMethodId: req.body.paymentMethodId,
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
    const { newSelectedPlanId } = req.body;
    const { id } = req.user;

    try {
      const { meteredFee, licensedFee } = await stripeHelper.getPrices(
        newSelectedPlanId
      );

      const subscription = await Subscription.findOne({ userId: id });

      const meteredItem = stripeHelper.subscriptionByUsageType(
        subscription,
        "metered"
      );
      const licensedItem = stripeHelper.subscriptionByUsageType(
        subscription,
        "licensed"
      );
      const currentPlanAmount = licensedItem?.price?.unit_amount;
      const newPlanAmount = licensedFee?.unit_amount;

      // // Check if it's a downgrade
      const isDownGrade = currentPlanAmount > newPlanAmount;
      if (isDownGrade) {
        const current_period_end = subscription?.current_period_end;

        console.log('sad', subscription);
        // Cancelling the current subscription
        await stripe.subscriptions.update(subscription?.stripeSubscriptionId, {
          // cancel_at: current_period_end,
          cancel_at_period_end: true,
        });

        // it will start at the end of the current active subscription period
        const nextRequestedSubscription = await stripe.subscriptions.create({
          customer: subscription?.customer,
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

        //  Update the subscription details in the database if necessary
         await Subscription.findOneAndUpdate(
          { userId: id },
          {
            $set: {
              stripeSubscriptionId: nextRequestedSubscription.id,
              productId: newSelectedPlanId,
              status: nextRequestedSubscription.status,
              items: nextRequestedSubscription.items?.data,
              currentPeriodStart: nextRequestedSubscription.current_period_start,
              currentPeriodEnd: nextRequestedSubscription.current_period_end,
              created: nextRequestedSubscription.created,
              currency: nextRequestedSubscription.currency,
              paymentMethodId: "req.body.paymentMethodId",
            },
          },
          { new: true }
        );


        res.status(200).json({
          message:
            "Downgrade subscription request applied, It will start after end of current subscription",
          // data: nextRequestedSubscription,
        });
        // Handle Downgrade
      } else {
        // If it's an upgrade, proceed as before
        const updatedSubscription = await stripe.subscriptions.update(
          subscription?.stripeSubscriptionId,
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
            // description: description,
          }
        );

        // Update the subscription details in the database if necessary
        await Subscription.findOneAndUpdate(
          { userId: id },
          {
            $set: {
              stripeSubscriptionId: updatedSubscription.id,
              productId: newSelectedPlanId,
              status: updatedSubscription.status,
              items: updatedSubscription.items?.data,
              currentPeriodStart: updatedSubscription.current_period_start,
              currentPeriodEnd: updatedSubscription.current_period_end,
              created: updatedSubscription.created,
              currency: updatedSubscription.currency,
              paymentMethodId: "req.body.paymentMethodId",
            },
          },
          { new: true }
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
