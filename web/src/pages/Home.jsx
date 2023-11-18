import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "reactstrap";

import CheckoutForm from "../components/CheckoutForm";
import LoginModal from "../components/LoginModal";
import api from "../api";

function Home() {
  const [modal, setModal] = useState(false);
  const [loginModal, setLoginModal] = useState(false);
  const [details, setDetails] = useState({});
  const [clientSecret, setClientSecret] = useState("");
  const [stripePromise, setStripePromise] = useState(null); // Initialize stripePromise as null.

  const toggle = () => setModal(!modal);
  const customerId = localStorage.getItem("customerId");

  useEffect(() => {
    if (!localStorage.getItem("customerId")) {
      setLoginModal(true);
    }

    api.getProductDetails().then((productDetails) => {
      setDetails(productDetails);
    });

    api.getPublicStripeKey().then((k) => {
      setStripePromise(loadStripe(k));
    });
  }, []);

  useEffect(() => {
    if (modal) {
      fetch("http://localhost:4000/stripe/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ customerId: customerId }),
      }).then(async (r) => {
        const { clientSec } = await r.json();
        setClientSecret(clientSec);
      });
    }
  }, [customerId, modal]);

  return (
    <div className="App">
      <LoginModal loginModal={loginModal} setLoginModal={setLoginModal} />
      <div className="w-100 p-1">
        <h1>Single Payment</h1>
        <div className="d-flex flex-column align-items-center justify-content-center">
          <div>
            <p>Name: {details?.name}</p>
          </div>
          <div>
            <p>Price: ${details?.amount / 100}</p>
          </div>
        </div>
        <Button color="danger" onClick={toggle}>
          Buy Product
        </Button>
      </div>
      {clientSecret && stripePromise && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm open={modal} toggle={toggle} />
        </Elements>
      )}
    </div>
  );
}

export default Home;
