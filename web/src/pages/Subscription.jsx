import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "reactstrap";

import SubscriptionForm from "../components/SubscriptionForm";
import LoginModal from "../components/LoginModal";
import api from "../api";
import PlanCard from "../components/PlanCard";

function Subscription() {
  const [modal, setModal] = useState(false);
  const [loginModal, setLoginModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState({});
  const [clientSecret, setClientSecret] = useState("");
  const [subscriptionPlans, setSubscriptionPlans] = useState({});

  const toggle = () => {
    setModal(!modal);
  };

  const handlePlan = (e) => {
    setModal(!modal);
    setSelectedPlan(e);
  };
  const stripePromise = api.getPublicStripeKey().then((key) => loadStripe(key));

  useEffect(() => {
    if (!localStorage.getItem("customerId")) {
      setLoginModal(true);
    } else {
      fetch("http://localhost:4000/home-plans", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }).then(async (r) => {
        const plans = await r.json();
        setSubscriptionPlans(plans);
      });
    }
  }, []);

  const customerId = localStorage.getItem("customerId");

  return (
    <div className="App">
      <LoginModal loginModal={loginModal} setLoginModal={setLoginModal} />
      <div className="">
        {Object.keys(subscriptionPlans).length > 0 && (
          <>
            <h1>Subscription Plans</h1>
            <div className="mt-4 mb-4 w-80 d-flex justify-content-center">
              <div className="d-flex gap-5">
                <PlanCard
                  planId={subscriptionPlans?.plan_a}
                  handlePlan={handlePlan}
                />
                <PlanCard
                  planId={subscriptionPlans?.plan_b}
                  handlePlan={handlePlan}
                />
                <PlanCard
                  planId={subscriptionPlans?.plan_c}
                  handlePlan={handlePlan}
                />
              </div>
            </div>
          </>
        )}
      </div>
      {
      Object.keys(selectedPlan).length > 0 &&
      <Elements stripe={stripePromise}>
        <SubscriptionForm
          open={modal}
          toggle={toggle}
          selectedPlan={selectedPlan}
          />
      </Elements>
        }
    </div>
  );
}

export default Subscription;
