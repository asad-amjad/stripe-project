const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const getPrices = async (planId) => {
    try {
      const prices = await stripe.prices.list({
        product: planId,
      });
  
      const meteredFee = prices?.data?.find(
        (price) => price.recurring.usage_type === "metered"
      );
      const licensedFee = prices?.data?.find(
        (price) => price.recurring.usage_type === "licensed"
      );
  
      return { meteredFee, licensedFee };
    } catch (error) {
      console.error("Error fetching prices:", error);
      throw new Error("Failed to fetch prices. Please try again later.");
    }
  };
  
  module.exports = {
    getPrices,
  };
  