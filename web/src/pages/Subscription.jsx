import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import SubscriptionForm from "../components/SubscriptionForm";
import LoginModal from "../components/LoginModal";
import api from "../api";
import PlanCard from "../components/PlanCard";

function Subscription() {
  const [modal, setModal] = useState(false);
  const [loginModal, setLoginModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState({});
  const [subscriptionPlans, setSubscriptionPlans] = useState({});
  const [activeSubscriptions, setActiveSubscriptions] = useState({});
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState(null);

  const stripePromise = api.getPublicStripeKey().then((key) => loadStripe(key));
  const customerId = localStorage.getItem("customerId");

  const fetchPlanDetails = () => {
    fetch(`http://localhost:4000/home-plans`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then(async (r) => {
      const { plans } = await r.json();
      setSubscriptionPlans(plans);
    });
  };

  const fetchMyActiveSubscriptions = () => {
    fetch(`http://localhost:4000/my-active-subscriptions/${customerId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then(async (r) => {
      const { activeSubscriptions, productIds } = await r.json();
      setActiveSubscriptions({ activeSubscriptions, productIds });
    });
  };

  const fetchMyDefaultPaymentMethod = () => {
    fetch(`http://localhost:4000/get-default-payment-method/${customerId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then(async (r) => {
      const { defaultPaymentMethod, success } = await r.json();
      if (success) {
        setDefaultPaymentMethod(defaultPaymentMethod);
      }
    });
  };

  const toggle = () => {
    setModal(!modal);
  };

  const handlePlan = (e) => {
    setModal(!modal);
    setSelectedPlan(e);
  };

  useEffect(() => {
    if (!localStorage.getItem("customerId")) {
      setLoginModal(true);
    } else {
      fetchPlanDetails();
      fetchMyActiveSubscriptions();
      fetchMyDefaultPaymentMethod();
    }
  }, [localStorage.getItem("customerId")]);
  // console.log(activeSubscriptions);
  return (
    <div className="App">
      <LoginModal loginModal={loginModal} setLoginModal={setLoginModal} />
      <div className="">
        {Object.keys(subscriptionPlans).length > 0 && (
          <>
            <h1>Subscription Plans</h1>
            <div className="mt-4 mb-4 w-80 d-flex justify-content-center">
              <div className="d-flex gap-5">
                {Object.values(subscriptionPlans)?.map((k, i) => {
                  return (
                    <PlanCard
                      key={i}
                      planId={k}
                      handlePlan={handlePlan}
                      activeSubscriptions={activeSubscriptions}
                      fetchMyActiveSubscriptions={fetchMyActiveSubscriptions}
                      isActive={activeSubscriptions?.productIds?.includes(k)}
                    />
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
      {Object.keys(selectedPlan).length > 0 && (
        <Elements stripe={stripePromise}>
          <SubscriptionForm
            open={modal}
            toggle={toggle}
            selectedPlan={selectedPlan}
            defaultPaymentMethod={defaultPaymentMethod}
            fetchMyActiveSubscriptions={fetchMyActiveSubscriptions}
          />
        </Elements>
      )}
    </div>
  );
}

export default Subscription;
