import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import SubscriptionForm from "../components/SubscriptionForm";
import LoginModal from "../components/LoginModal";
import api from "../api";
import PlanCard from "../components/PlanCard";
// import InvoiceDetails from "../components/InvoiceDetails";

function Subscription() {
  const [modal, setModal] = useState(false);
  const [loginModal, setLoginModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState({});
  const [subscriptionPlans, setSubscriptionPlans] = useState({});
  const [activeSubscriptionsDetails, setActiveSubscriptionsDetails] = useState({});
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState(null);
  const [invoice, setInvoice] = useState(null);

  const stripePromise = api.getPublicStripeKey().then((key) => loadStripe(key));
  const customerId = localStorage.getItem("customerId");

  const { activeSubscriptions, productIds } = activeSubscriptionsDetails || {}

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
    fetch(`http://localhost:4000/stripe/active-subscriptions/${customerId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then(async (r) => {
      const { activeSubscriptions, productIds } = await r.json();
      setActiveSubscriptionsDetails({ activeSubscriptions, productIds });
    });
  };

  const fetchMyDefaultPaymentMethod = () => {
    fetch("http://localhost:4000/stripe/payment-method-list", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ customerId: customerId }),
    }).then(async (r) => {
      const { defaultPaymentMethod } = await r.json();
      setDefaultPaymentMethod(defaultPaymentMethod);
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

  const updatePlan = ({ newPriceDetail }) => {
    const subscriptionId = activeSubscriptions[0].id;
    const subItemId =
      activeSubscriptions[0]?.items.data[0]?.id;
    const newPriceId = newPriceDetail.id;

    fetch(`http://localhost:4000/stripe/update-subscription/${subscriptionId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscriptionId: subscriptionId,
        subItemId: subItemId,
        newPriceId: newPriceId,
      }),
    }).then(async (r) => {
      const rs = await r.json();
      fetchMyActiveSubscriptions();
    });
  };
  
// TODO:
  const calculateInvoice = async ({ newPriceDetail }) => {
    const subscriptionId = activeSubscriptions[0].id;
    const subItemId =
      activeSubscriptions[0]?.items.data[0]?.id;
    const newPriceId = newPriceDetail.id;

    try {
      const response = await fetch("http://localhost:4000/stripe/calculate-plan-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriptionId: subscriptionId,
          subItemId: subItemId,
          newPriceId: newPriceId,
          customerId: customerId
        }),
      });

      const data = await response.json();
      setInvoice(data.invoice);
    } catch (error) {
      console.error("Error calculating invoice:", error);
    }
  };

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
                      activeSubscriptions={activeSubscriptionsDetails}
                      fetchMyActiveSubscriptions={fetchMyActiveSubscriptions}
                      isActive={activeSubscriptionsDetails?.productIds?.includes(k)}
                      updatePlan={updatePlan}
                      calculateInvoice={calculateInvoice}
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

      {/* <InvoiceDetails invoice={invoice} /> */}
    </div>
  );
}

export default Subscription;
