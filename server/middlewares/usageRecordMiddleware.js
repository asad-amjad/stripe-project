const { getIdsByUsageType } = require("../utils");

require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

let callCount = 0;
let extra_used_amount = 0;
const usageRecordMiddleware = async (req, res, next) => {
  const { subscriptionId, planFee } = req.body;
  try {
    // Increment call count
    callCount++;

    // Price per call
    const price = 2;

    // Increment total price
    extra_used_amount += price;

    // Need from db
    // const currentPlanFee = 5;
    const currentPlanFee = planFee / 100; //cents to dollar

    // Get Usage from db
    if (extra_used_amount > currentPlanFee) {
      // DB: Get associated subscription Items id from db
      // Need metered item id for creating usage record

      const subscriptionItems = await stripe.subscriptionItems.list({
        subscription: subscriptionId,
      });

      const meteredItem = getIdsByUsageType(subscriptionItems, "metered");
      // const licensedItem = getIdsByUsageType(subscriptionItems, "licensed");

      // usage record effect in next invoice
      if (meteredItem?.id) {
        const usageRecord = await stripe.subscriptionItems.createUsageRecord(
          meteredItem?.id,
          {
            quantity: 1,
          }
        );
        req.usageRecord = usageRecord;
      }
    }
    req.body.used_amount = extra_used_amount;

    next(); // Continue to the next route handler
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({
      error: "Something went wrong with usage record",
    });
  }
};

module.exports = usageRecordMiddleware;
