 const getProductDetails = () => {
  return { currency: "usd", amount: 500, name: "Article-1" };
};



 const getSubscriptionDetails = () => {
    return {
      currency: "usd",
      amount: 500, // Monthly subscription amount in cents
      name: "Subscription Name",
    };
  };


  const staticData = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    // Add more data here
  ];
  
  module.exports = {getProductDetails,getSubscriptionDetails };
  