require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const getProductPrice = async (priceId) => {
  try {
    const price = await stripe.prices.retrieve(priceId);
    // console.log(price)
    return price;
  } catch (error) {
    console.error("Error retrieving price:", error);
    throw new Error("Error retrieving price");
  }
};

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

const productController = {
  detail: async (req, res) => {
    const productId = req.params.productId;
    try {
      const product = await stripe.products.retrieve(productId);

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      if (product) {
        // const price = await stripe.prices.retrieve(product.default_price);
        const allPrices = await getAllProductPrice(product);
        const default_price = allPrices?.find((k) => {
          return k.id === product.default_price;
        });

        product.extended_price_details = default_price; //Send price details
        product.allPrices= allPrices
        
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
          const allPrices = await getAllProductPrice(product);

          const default_price = allPrices?.find((k) => {
            return k.id === product.default_price;
          });

          return {
            ...product,
            extended_price_details: default_price,
            allPrices: allPrices,
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
