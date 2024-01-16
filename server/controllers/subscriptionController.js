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
      console.log(selectedProductId);
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
    // const subscriptionId = req.params.subscriptionId;
    const {
      // subItemId,
      // newPriceId,
      // customerId,
      // description,
      // newPlanId,
      // planFee,
      newSelectedPlanId,
    } = req.body;
    // console.log(req.user);
    const { id } = req.user;
    try {
      const { meteredFee: newMeteredFee, licensedFee: newLicensedFee } =
        await stripeHelper.getPrices(newSelectedPlanId);

      const subscription = await Subscription.findOne({ userId: id });
      console.log(subscription);
      // const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      // const subscriptionItems = await stripe.subscriptionItems.list({
      //   subscription: subscriptionId,
      // });

      // const licensedItem = getIdsByUsageType(subscriptionItems, "licensed");

      // const prices = await stripe.prices.list({
      //   product: newSelectedPlanId,
      // });

      // const newPlanAmount = prices?.data?.find(
      //   (price) => price.recurring.usage_type === "licensed"
      // )?.unit_amount;

      // console.log(newPlanAmount)

      // const currentPlanAmount = licensedItem?.price?.unit_amount;

      // // Check if it's a downgrade
      // const isDownGrade = currentPlanAmount > newPlanAmount;

      // if (isDownGrade) {
      // } else {
      //   // TODO DB + payment_method_id from ui:
      // }
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
