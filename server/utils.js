const separateSubscriptions = (subscriptions) => {
  const result = {};
  subscriptions?.map((subscription) => {
    if (subscription.status === "active") result["active"] = subscription;
    else if (subscription.status === "trialing")
      result["inQueue"] = subscription;
  });

  return result;
};

module.exports = separateSubscriptions;
