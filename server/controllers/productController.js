require("dotenv").config({ path: "./.env" });
const stripeHelper = require("../Helpers/stripeHelper");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const stripeService1Plans =
  process.env.STRIPE_SERVICE1_SUBSCRIPTION_PRODUCTS.split(",");

const getAllProductPrice = async (product) => {
  try {
    const prices = await stripe.prices.list({
      product: product.id,
    });
    return prices?.data;
  } catch (error) {
    console.error("Error retrieving price:", error);
    throw new Error("Error retrieving price");
  }
};

const productController = {
  list: async (req, res) => {
    try {
      const products = await stripe.products.list({
        ids: stripeService1Plans,
      });

      // Fetch prices for each product
      const productsWithPrices = await Promise.all(
        products.data.map(async (product) => {

          const { meteredFee, licensedFee } = await stripeHelper.getPrices(product.id);


          // const allPrices = await getAllProductPrice(product);
          // const meteredFee = allPrices.find(
          //   (price) => price.recurring.usage_type === "metered"
          // );
          // const licensedFee = allPrices.find(
          //   (price) => price.recurring.usage_type === "licensed"
          // );

          // const default_price = allPrices?.find((k) => {
          //   return k.id === product.default_price;
          // });

          // TO be removed
          // product.extended_price_details = default_price;
          // product.allPrices = allPrices;
          // ==================

          product.meteredFee = meteredFee;
          product.licensedFee = licensedFee;
          return {
            ...product,
            // extended_price_details: default_price,
            // allPrices: allPrices,
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
