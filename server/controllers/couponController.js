require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const couponController = {
  validation: async (req, res) => {
    try {
      const { couponCode } = req.body;

      const promotionCodes = await stripe.promotionCodes.list({
        limit: 10,
      });

      const promotion = promotionCodes.data.find(
        (promo) => promo.code === couponCode
      );

      if (!promotion) {
        return res.json({ valid: false, error: "Invalid coupon code" });
      }

      const couponDetails = {
        couponId: promotion.coupon.id,
        couponName: promotion.coupon.name,
        percentageOff: promotion.coupon.percent_off,
      };

      return res.json({ valid: true, couponDetails });
    } catch (error) {
      return res.json({ valid: false, error: error.message });
    }
  },
};

module.exports = couponController;
