import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button, Card, CardBody, CardTitle } from "reactstrap";

import api from "../api";
import PaymentMethodCard from "../components/PaymentMethodCard";
import AddNewMethod from "./AddNewMethod";

function Settings() {
  const [modal, setModal] = useState(false);
  const [paymentMethodsList, setPaymentMethodsList] = useState("");
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState(null);

  const stripePromise = api.getPublicStripeKey().then((key) => loadStripe(key));
  const customerId = localStorage.getItem("customerId");

  const fetchMyPaymentMethods = () => {
    fetch("http://localhost:4000/payment-method-list", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ customerId: customerId }),
    }).then(async (r) => {
      const { paymentMethods, defaultPaymentMethod } = await r.json();
      setPaymentMethodsList(paymentMethods);
      setDefaultPaymentMethod(defaultPaymentMethod);
    });
  }

  useEffect(() => {
    fetchMyPaymentMethods()
  }, []);


  return (
    <div className="App">
      <h1>Settings</h1>
      <div className="d-flex justify-content-center">
        <Card className="shadow-lg p-4 w-25 my-5">
          <CardBody className="justify-content-between w-100">
            <CardTitle tag="h5" className="mb-5">
              Add New Card
            </CardTitle>
            <Elements stripe={stripePromise}>
              <AddNewMethod fetchMyPaymentMethods={fetchMyPaymentMethods} />
            </Elements>
          </CardBody>
        </Card>
      </div>

      <div className="d-flex justify-content-center">
        {paymentMethodsList.length > 0
          ? paymentMethodsList.map((k, i) => {
            return (
              <PaymentMethodCard
                key={i}
                paymentMethod={k}
                defaultPaymentMethod={defaultPaymentMethod}
                fetchMyPaymentMethods={fetchMyPaymentMethods}
              />
            );
          })
          : "No Payment method found"}
      </div>
    </div>
  );
}

export default Settings;
