require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const getAllProductPrice = async (product) => {
  try {
    const prices = await stripe.prices.list({
      product: product.id,
      // limit: 3,
    });
    return prices?.data;
  } catch (error) {
    console.error("Error retrieving price:", error);
    throw new Error("Error retrieving price");
  }
};

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

    return { meteredFee, licensedFee, prices };
  } catch (error) {
    console.error("Error fetching prices:", error);
    throw new Error("Failed to fetch prices. Please try again later.");
  }
};

const productController = {
  detail: async (req, res) => {
    const productId = req.params.productId;
    try {
      const product = await stripe.products.retrieve(productId);

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      if (product) {
        const allPrices = await getAllProductPrice(product);
        const meteredFee = allPrices.find(
          (price) => price.recurring.usage_type === "metered"
        );
        const licensedFee = allPrices.find(
          (price) => price.recurring.usage_type === "licensed"
        );

        // console.log(allPrices)
        const default_price = allPrices?.find((k) => {
          return k.id === product.default_price;
        });

        // TODO: be removed
        product.extended_price_details = default_price;
        product.allPrices = allPrices;
        // ==================

        product.meteredFee = meteredFee;
        product.licensedFee = licensedFee;
      }
      res.json({ product });
    } catch (error) {
      console.error("Error retrieving product details:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  list: async (req, res) => {
    const stripeService1Plans =
      process.env.STRIPE_SERVICE1_SUBSCRIPTION_PRODUCTS.split(",");

    try {
      const products = await stripe.products.list({
        ids: stripeService1Plans,
      });

      // Fetch prices for each product
      const productsWithPrices = await Promise.all(
        products.data.map(async (product) => {
          const { meteredFee, licensedFee, prices } = await getPrices(
            product.id
          );

          const default_price = prices?.data?.find((k) => {
            return k.id === product.default_price;
          });

          // TO be removed After ui migrate to meteredFee and licensedFee
          product.extended_price_details = default_price;
          product.allPrices = prices?.data;
          // ==================

          product.meteredFee = meteredFee;
          product.licensedFee = licensedFee;
          return product;
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
