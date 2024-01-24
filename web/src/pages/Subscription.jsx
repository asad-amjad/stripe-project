import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import SubscriptionForm from "../components/SubscriptionForm";
import LoginModal from "../components/LoginModal";
import api from "../api";
import PlanCard from "../components/PlanCard";
import { convertTimestampToReadable, isObjectEmpty } from "../utils";

function Subscription() {
  const [modal, setModal] = useState(false);
  const [loginModal, setLoginModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState({});
  const [subscriptionPlans, setSubscriptionPlans] = useState({});

  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState(null);

  const [activeSubscription, setActiveSubscription] = useState({});
  const [inQueueSubscription, setInQueueSubscription] = useState({});
  const [usage, setUsage] = useState({});
  const stripePromise = api.getPublicStripeKey().then((key) => loadStripe(key));
  const customerId = localStorage.getItem("customerId");

  const getIdsByUsageType = (subscriptionItems, targetUsageType) => {
    return subscriptionItems?.items.data
      ?.filter((item) => item.plan && item.plan.usage_type === targetUsageType)
      .find((item) => item);
  };

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

  const fetchAllProducts = () => {
    fetch(`http://localhost:4000/stripe/products`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then(async (r) => {
      const aa = await r.json();
      console.log(aa);
      // setSubscriptionPlans(plans);
    });
  };

  const fetchMyActiveSubscriptions = () => {
    fetch(`http://localhost:4000/stripe/subscriptions-list/${customerId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then(async (r) => {
      const { inQueue, active } = await r.json();

      setActiveSubscription(active);
      setInQueueSubscription(inQueue);
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

  // const licensedFee = planDetails?.allPrices?.find(
  //   (price) => price.recurring.usage_type === "licensed"
  // );
  const fetchRecord = () => {
    const licensedItem = getIdsByUsageType(activeSubscription, "licensed");
    const planFee = licensedItem?.price?.unit_amount;
    fetch(`http://localhost:4000/stripe/fetch-record`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscriptionId: activeSubscription?.id,
        customerId: customerId,
        planFee: planFee,
      }),
    }).then(async (r) => {
      const { data, usage } = await r.json();
      setUsage(usage);
      // setDefaultPaymentMethod(defaultPaymentMethod);
    });
  };

  // Example usage with a new parameter value
  // fetchRecord('yourNewParameterValue');

  const fetchInvoice = () => {
    fetch(`http://localhost:4000/stripe/invoice/${customerId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then(async (r) => {
      const aa = await r.json();
      console.log("sa", aa);
      // setDefaultPaymentMethod(defaultPaymentMethod);
    });
  };

  const toggle = () => {
    setModal(!modal);
  };

  const handlePlan = (e) => {
    setModal(!modal);
    setSelectedPlan(e);
  };

  // useEffect(() => {
  //   fetchPlanDetails();
  // }, []);

  useEffect(() => {
    if (!localStorage.getItem("customerId")) {
      setLoginModal(true);
    } else {
      fetchPlanDetails();
      fetchAllProducts()
      fetchMyActiveSubscriptions();
      fetchMyDefaultPaymentMethod();
    }
  }, [localStorage.getItem("customerId")]);

  const handleUpdatePlan = ({ planDetails, newPriceDetail }) => {
    const licensedItem = getIdsByUsageType(activeSubscription, "licensed");
    const planFee = licensedItem?.price?.unit_amount;

    const subscriptionId = activeSubscription.id;
    const subItemId = activeSubscription?.items.data[0]?.id;

    // activeSubscription?.items?.data[0]?.plan
    const newPriceId = newPriceDetail.id;
    fetch(
      `http://localhost:4000/stripe/update-subscription/${subscriptionId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriptionId: subscriptionId,
          subItemId: subItemId,
          newPriceId: newPriceId,
          customerId: customerId,
          description: `Fee: ${planDetails?.name}`,
          newPlanId: planDetails.id,
          planFee: planFee,
        }),
      }
    ).then(async (r) => {
      const rs = await r.json();
      fetchMyActiveSubscriptions();
    });
  };

  // const meteredItem = getIdsByUsageType(activeSubscription, "metered");
  // const licensedItem = getIdsByUsageType(activeSubscription, "licensed");
  // console.log(licensedItem?.price?.unit_amount)

  return (
    <div className="App">
      <LoginModal loginModal={loginModal} setLoginModal={setLoginModal} />
      <div className="">
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
                    fetchMyActiveSubscriptions={fetchMyActiveSubscriptions}
                    handleUpdatePlan={handleUpdatePlan}
                    isActiveInQueue={inQueueSubscription?.plan?.product?.includes(
                      k
                    )}
                    // Filter todo:
                    isActive={activeSubscription?.items?.data[0]?.plan?.product?.includes(
                      k
                    )}
                    // shouldUpdateEnable={isObjectEmpty(activeSubscription)}
                    shouldUpdateEnable={isObjectEmpty(activeSubscription)}
                    activeSubscription={activeSubscription}
                    inQueueSubscription={inQueueSubscription}
                    disableActiveBtns={isObjectEmpty(inQueueSubscription)}
                  />
                );
              })}
            </div>
          </div>
        </>
      </div>

      <div className="d-flex justify-content-center flex-column">
        {Object.keys(usage).length > 0 && (
          <>
            For db record
            {usage && (
              <p>
                Used Amount : <strong>{usage.used_amount}</strong>
              </p>
            )}
            {/* {usage && (
              <p>
                Used call count for db: <strong>{usage.call_count}</strong>
              </p>
            )} */}
          </>
        )}
        <div>
          <button style={{ width: "250px" }} onClick={() => fetchRecord()}>
            Fectch API
          </button>
        </div>
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
