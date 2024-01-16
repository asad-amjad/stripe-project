require("dotenv").config({ path: "./.env" });
const stripeHelper = require("../Helpers/stripeHelper");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const stripeService1Plans =
  process.env.STRIPE_SERVICE1_SUBSCRIPTION_PRODUCTS.split(",");

const productController = {
  list: async (req, res) => {
    try {
      const products = await stripe.products.list({
        ids: stripeService1Plans,
      });

      // Fetch prices for each product
      const productsWithPrices = await Promise.all(
        products.data.map(async (product) => {
          const { meteredFee, licensedFee } = await stripeHelper.getPrices(
            product.id
          );

          product.meteredFee = meteredFee;
          product.licensedFee = licensedFee;
          return {
            ...product,
          };
        })
      );

      res.json(productsWithPrices);
    } catch (error) {
      console.error("Error retrieving product details:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

module.exports = productController;
