const createPaymentIntent = options => {
  return window
    .fetch(`http://localhost:4000/create-payment-intent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(options)
    })
    .then(res => {
      if (res.status === 200) {
        return res.json();
      } else {
        return null;
      }
    })
    .then(data => {
      if (!data || data.error) {
        console.log("API error:", { data });
        throw new Error("PaymentIntent API Error");
      } else {
        return data.client_secret;
      }
    });
};

const getProductDetails = options => {
  return window
    .fetch(`http://localhost:4000/product-details`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(res => {
      if (res.status === 200) {
        return res.json();
      } else {
        return null;
      }
    })
    .then(data => {
      if (!data || data.error) {
        console.log("API error:", { data });
        throw Error("API Error");
      } else {
        return data;
      }
    });
};


const getSubscriptionDetails = options => {
  return window
    .fetch(`http://localhost:4000/subscription-details`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(res => {
      if (res.status === 200) {
        return res.json();
      } else {
        return null;
      }
    })
    .then(data => {
      if (!data || data.error) {
        console.log("API error:", { data });
        throw Error("API Error");
      } else {
        return data;
      }
    });
};

const getPublicStripeKey = options => {
  return window
    .fetch(`http://localhost:4000/public-key`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(res => {
      if (res.status === 200) {
        return res.json();
      } else {
        return null;
      }
    })
    .then(data => {
      if (!data || data.error) {
        console.log("API error:", { data });
        throw Error("API Error");
      } else {
        return data.publishableKey;
      }
    });
};

const api = {
  createPaymentIntent,
  getPublicStripeKey: getPublicStripeKey,
  getProductDetails: getProductDetails,
  getSubscriptionDetails: getSubscriptionDetails,
};

export default api;
