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
  getPublicStripeKey: getPublicStripeKey,
};

export default api;
