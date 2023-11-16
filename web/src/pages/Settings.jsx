import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "reactstrap";

import LoginModal from "../components/LoginModal";
import api from "../api";
import HandlePaymentMethod from "../components/HandlePaymentMethod";
import PaymentMethodCard from "../components/PaymentMethodCard";
import YourComponent from "./CardElement";

function Settings() {
  const [modal, setModal] = useState(false);
  const [loginModal, setLoginModal] = useState(false);
  // const [details, setDetails] = useState({});
  const [clientSecret, setClientSecret] = useState("");
  const [paymentMethodsList, setPaymentMethodsList] = useState("");
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState(null);

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


      fetch(`http://localhost:4000/get-default-payment-method/${customerId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }).then(async (r) => {
        const { defaultPaymentMethod, success, customer } = await r.json();
        if (success) {
          // console.log(defaultPaymentMethod)
          setDefaultPaymentMethod(defaultPaymentMethod);
        }
      });
    }
  }, [customerId]);

  // useEffect(() => {
  //   if (modal) {
  //     fetch("http://localhost:4000/create-payment-intent", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ customerId: customerId }),
  //     }).then(async (r) => {
  //       const { clientSec } = await r.json();
  //       setClientSecret(clientSec);
  //     });
  //   }
  // }, [customerId, modal]);
// console.log(defaultPaymentMethod)

  return (
    <div className="App">
      <LoginModal loginModal={loginModal} setLoginModal={setLoginModal} />
      <h1>Settings</h1>
      <div className="d-flex justify-content-center">
        {paymentMethodsList.length > 0
          ? paymentMethodsList.map((k, i) => {
            return (
              <PaymentMethodCard key={i} paymentMethod={k} defaultPaymentMethod={defaultPaymentMethod}/>
            )
          })
          : "No Payment method found"}
      </div>
      <Elements stripe={stripePromise}>
      <YourComponent />
      </Elements>
      {/* <div className="w-100 p-1">
        <Button color="danger" onClick={toggle}>
          Attach Method
        </Button>
      </div>
      {clientSecret && stripePromise && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <HandlePaymentMethod open={modal} toggle={toggle} />
        </Elements>
      )} */}
    </div>
  );
}

export default Settings;
