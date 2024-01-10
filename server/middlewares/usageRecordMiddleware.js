require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

let callCount = 0;
let totalCost = 0;
const usageRecordMiddleware = async (req, res, next) => {
  const customerId = req.params.customerId;
  try {
    // Increment call count
    callCount++;

    // Price per call
    const price = 0.5;

    // Increment total price
    totalCost += price;

    // Product: Get from DB

    // const prices = await stripe.prices.list({
    //   type: "one_time",
    //   product: planId,
    // });
    // const productFee = prices?.data?.find(
    //   (price) => price.nickname === "fee"
    // )?.unit_amount;


    if (totalCost > 5) {
      // For Getting subscription item id
      const subscriptions = await stripe.subscriptions.list({
        limit: 1,
        customer: customerId,
        status: "active",
      });

      // Todo: Db
      let subItem = null; // Subscription item id
      subscriptions?.data?.forEach((subscription) => {
        subscription.items.data.forEach((item) => {
          subItem = item;
        });
      });

      // Charging
      if (subItem) {
        const usageRecord = await stripe.subscriptionItems.createUsageRecord(
          subItem?.id,
          {
            quantity: 1,
          }
        );
        req.usageRecord = usageRecord;
      }
    }
    req.body.call_count = callCount; // Attach usage record to request object
    req.body.used_amount = totalCost;
    // console.log(
    //   `Call #${callCount} - Price: $${price} - Total Cost: $${totalCost}`
    // );
    next(); // Continue to the next route handler
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({
      error: "Something went wrong with usage record",
    });
  }
};

module.exports = usageRecordMiddleware;
