const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stripeSubscriptionId: { type: String, required: true },
  licensedFee: { type: Object, required: true },
  meteredFee: { type: Object, required: true },
  productId: { type: String, required: true },
//   coupon: String,
  // Add other fields as needed
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
