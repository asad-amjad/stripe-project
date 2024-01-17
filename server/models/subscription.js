const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  stripeSubscriptionId: { type: String, required: true },
  // licensedFee: { type: Object, required: true },
  // meteredFee: { type: Object, required: true },
  productId: { type: String, required: true },
  // coupon: { type: String },
  status: { type: String },
  customer: { type: String },
  currentPeriodStart: { type: String },
  currentPeriodEnd: { type: String },
  created: { type: String },
  currency: { type: String },
  paymentMethodId: { type: String },
  // isDefaultPayment: { type: Boolean },
  items: { type: Array },
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;
