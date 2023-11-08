import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "reactstrap";

import SubscriptionForm from "../components/SubscriptionForm";
import LoginModal from "../components/LoginModal";
import api from "../api";

function Subscription() {
  const [modal, setModal] = useState(false);
  const [loginModal, setLoginModal] = useState(false);
  const [details, setDetails] = useState({});

  const toggle = () => setModal(!modal);
  const stripePromise = api.getPublicStripeKey().then((key) => loadStripe(key));

  const options = {
    mode: "payment",
    currency: details?.currency,
    amount: details?.amount,
    // Fully customizable with appearance API.
    appearance: {
      /*...*/
    },
  };

  useEffect(() => {
    if (!localStorage.getItem("customerId")) {
      setLoginModal(true);
    } else {
      api.getSubscriptionDetails().then((productDetails) => {
        setDetails(productDetails);
      });
    }
  }, []);

  return (
    <div className="App">
      <LoginModal loginModal={loginModal} setLoginModal={setLoginModal} />
      <div className="w-100 p-1">
      <p>Single Payment</p>
        Product details Here Price:
        <p>{details?.name}</p>
        <p>${details?.amount / 100}</p>
        <Button color="danger" onClick={toggle}>
          Buy Product
        </Button>
      </div>
      {details.amount && (
        <Elements stripe={stripePromise} options={options}>
          <SubscriptionForm open={modal} toggle={toggle} />
        </Elements>
      )}
    </div>
  );
}

export default Subscription;
