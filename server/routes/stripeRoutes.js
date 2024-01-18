// routes/stripeRoutes.js
const express = require("express");
const router = express.Router();
// const customerController = require("../controllers/customerController");
const subscriptionController = require("../controllers/subscriptionController");
const couponController = require("../controllers/couponController");
const productController = require("../controllers/productController");
const paymentMethodController = require("../controllers/paymentMethodController");
const singlePaymentController = require("../controllers/singlePaymentController");
const invoiceController = require("../controllers/invoiceController");
const fetchRecordController = require("../controllers/fetchRecordController");
const usageRecordMiddleware = require("../middlewares/usageRecordMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");



//Products
router.get("/products", productController.list);

// Subscriptions
router.post("/create-subscription", authMiddleware, subscriptionController.create);
router.post(
  "/update-subscription", authMiddleware,
  subscriptionController.update
);

router.post("/cancel-subscription", subscriptionController.cancel);
router.get("/subscriptions-list", authMiddleware, subscriptionController.list);

// Coupon
router.post("/validate-coupon", couponController.validation);

// Payment Methods
router.post("/payment-method-list", paymentMethodController.list);
router.post("/add-new-payment-method", paymentMethodController.addNewMethod);
router.post("/set-default-method", paymentMethodController.setDefault);

// Single Payment
router.post("/create-payment-intent", singlePaymentController.createIntent);

// Transactions
router.post("/fetch-record", usageRecordMiddleware, fetchRecordController.fetchRecord);
router.get("/invoice/:customerId", invoiceController.list);

module.exports = router;
