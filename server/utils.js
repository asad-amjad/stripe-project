const separateSubscriptions = (subscriptions) => {
  const result = {};
  subscriptions?.map((subscription) => {
    // console.log('ss',subscription)
    if (subscription.status === "active") result["active"] = subscription;
    else if (subscription.status === "trialing")
      result["inQueue"] = subscription;
  });

  return result;
};

const getIdsByUsageType = (subscriptionItems, targetUsageType) => {
  return subscriptionItems?.data
    ?.filter((item) => item.plan && item.plan.usage_type === targetUsageType)
    .find((item) => item);
};

module.exports = {
  separateSubscriptions,
  getIdsByUsageType,
};
