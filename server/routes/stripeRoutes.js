// routes/stripeRoutes.js
const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const subscriptionController = require("../controllers/subscriptionController");
const couponController = require("../controllers/couponController");
const productController = require("../controllers/productController");
const paymentMethodController = require("../controllers/paymentMethodController");
const singlePaymentController = require("../controllers/singlePaymentController");

// Customer
router.post("/register-customer", customerController.register);

//Products
router.get("/product/:productId", productController.detail);

// Subscriptions
router.post("/create-subscription", subscriptionController.create);
router.post(
  "/update-subscription/:Id",
  subscriptionController.update
);
router.post("/cancel-subscription", subscriptionController.cancel);
router.get("/active-subscriptions/:customerId", subscriptionController.list);

// Coupon
router.post("/validate-coupon", couponController.validation);

// Payment Methods
router.post("/payment-method-list", paymentMethodController.list);
router.post("/add-new-payment-method", paymentMethodController.addNewMethod);
router.post("/set-default-method", paymentMethodController.setDefault);

// Single Payment
router.post("/create-payment-intent", singlePaymentController.createIntent);

module.exports = router;
