require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const couponController = {
  validation: async (req, res) => {
    const { couponCode } = req.body;
    try {
      const promotionCodes = await stripe.promotionCodes.list({
        limit: 10,
      });

      const promotion = promotionCodes?.data?.find(
        (promo) => promo.code === couponCode
      );

      if (!promotion) {
        res.json({ valid: false, error: "In valid" });
      }

      if (promotion) {
        const couponDetails = {
          couponId: promotion.coupon.id,
          couponName: promotion.coupon.name,
          percentageOff: promotion.coupon.percent_off,
        };

        res.json({ valid: true, couponDetails });
      }
    } catch (error) {
      res.json({ valid: false, error: error.message });
    }
  },
};

module.exports = couponController;
