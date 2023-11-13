const getProductDetails = (options) => {
  return window
    .fetch(`http://localhost:4000/product-details`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      if (res.status === 200) {
        return res.json();
      } else {
        return null;
      }
    })
    .then((data) => {
      if (!data || data.error) {
        console.log("API error:", { data });
        throw Error("API Error");
      } else {
        return data;
      }
    });
};

const getProductDetailById = (productId) => {
  return window
    .fetch(`http://localhost:4000/get-product-details/${productId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      if (res.status === 200) {
        return res.json();
      } else {
        return null;
      }
    })
    .then((data) => {
      if (!data || data.error) {
        console.log("API error:", { data });
        throw Error("API Error");
      } else {
        return data;
      }
    });
};

const getSubscriptionDetails = (options) => {
  return window
    .fetch(`http://localhost:4000/subscription-details`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      if (res.status === 200) {
        return res.json();
      } else {
        return null;
      }
    })
    .then((data) => {
      if (!data || data.error) {
        console.log("API error:", { data });
        throw Error("API Error");
      } else {
        return data;
      }
    });
};

const getPublicStripeKey = (options) => {
  return window
    .fetch(`http://localhost:4000/public-key`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      if (res.status === 200) {
        return res.json();
      } else {
        return null;
      }
    })
    .then((data) => {
      if (!data || data.error) {
        console.log("API error:", { data });
        throw Error("API Error");
      } else {
        return data.publishableKey;
      }
    });
};

const api = {
  getProductDetailById: getProductDetailById,
  getPublicStripeKey: getPublicStripeKey,
  getProductDetails: getProductDetails,
  getSubscriptionDetails: getSubscriptionDetails,
};

export default api;
