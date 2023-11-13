import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "reactstrap";

import LoginModal from "../components/LoginModal";
import api from "../api";
import HandlePaymentMethod from "../components/HandlePaymentMethod";

function Settings() {
  const [modal, setModal] = useState(false);
  const [loginModal, setLoginModal] = useState(false);
  // const [details, setDetails] = useState({});
  const [clientSecret, setClientSecret] = useState("");
  const [paymentMethodsList, setPaymentMethodsList] = useState("");

  const toggle = () => setModal(!modal);
  const stripePromise = api.getPublicStripeKey().then((key) => loadStripe(key));
  const customerId = localStorage.getItem("customerId");

  useEffect(() => {
    if (!localStorage.getItem("customerId")) {
      setLoginModal(true);
    } else {
      //Getting attached payment list
      fetch("http://localhost:4000/payment-method-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ customerId: customerId }),
      }).then(async (r) => {
        const { paymentMethods } = await r.json();
        setPaymentMethodsList(paymentMethods);
      });
    }
  }, [customerId]);

  useEffect(() => {
    if (modal) {
      fetch("http://localhost:4000/create-payment-intent", {
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
      <h1>Settings</h1>
      <div>
        {paymentMethodsList.length > 0
          ? paymentMethodsList.length
          : "No Payment method found"}
      </div>
      <div className="w-100 p-1">
        <Button color="danger" onClick={toggle}>
          Attach Method
        </Button>
      </div>
      {clientSecret && stripePromise && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <HandlePaymentMethod open={modal} toggle={toggle} />
        </Elements>
      )}
    </div>
  );
}

export default Settings;
