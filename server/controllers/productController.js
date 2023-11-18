require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const productController = {
  detail: async (req, res) => {
    const productId = req.params.productId;
    try {
      const product = await stripe.products.retrieve(productId);

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      if (product) {
        const price = await stripe.prices.retrieve(product.default_price);
        product.extended_price_details = price; //Send price details
      }

      res.json({ product });
    } catch (error) {
      console.error("Error retrieving product details:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

module.exports = productController;
