import React, { useEffect, useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";

const SubscriptionForm = ({
  open,
  toggle,
  selectedPlan,
  defaultPaymentMethod,
  fetchMyActiveSubscriptions,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [price, setPrice] = useState(0);
  const [validCoupon, setValidCoupon] = useState({});
  const [showCoupen, setShowCoupen] = useState(false);
  const [chooseOtherPayment, setChooseOtherPayment] = useState(false);

  const customerId = localStorage.getItem("customerId"); // Get the customer ID
  const customerEmail = localStorage.getItem("customerEmail"); // Get the customer ID

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }
    setLoading(true);
    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardElement),
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Send paymentMethod.id and customerId to your backend to create a subscription
      const result = await fetch("http://localhost:4000/stripe/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: customerId,
          paymentMethodId: paymentMethod.id,
          priceId: selectedPlan?.planDetails?.default_price,
          subscriptionDescription: selectedPlan?.planDetails?.name,
          coupon: validCoupon?.couponId,
          isDefaultPayment: false,
          // geZbHDVJ
        }),
      });
      if (result.ok) {
        const { subscriptionId } = await result.json();
        if (subscriptionId) {
          setLoading(false);
          fetchMyActiveSubscriptions();
          toggle();
        }
        // Handle success
      } else {
        const response = await result.json();
        setError(response.error);
        setLoading(false);
      }
    }
  };

  const handleSubmitWithDefaultPayment = async (e) => {
    setLoading(true);

    const result = await fetch("http://localhost:4000/stripe/create-subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerId: customerId,
        paymentMethodId: defaultPaymentMethod.id,
        priceId: selectedPlan?.planDetails?.default_price,
        subscriptionDescription: selectedPlan?.planDetails?.name,
        coupon: validCoupon?.couponId,
        isDefaultPayment: true,
      }),
    });

    if (result.ok) {
      const { subscriptionId } = await result.json();
      if (subscriptionId) {
        setLoading(false);
        fetchMyActiveSubscriptions();
        toggle();
      }
      // Handle success
    } else {
      const response = await result.json();
      setError(response.error);
      setLoading(false);
    }
  };

  const handleCoupen = async () => {
    await fetch("http://localhost:4000/stripe/validate-coupon", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        couponCode: coupon,
      }),
    })
      .then(async (res) => {
        const response = await res.json();
        if (response.valid) {
          setPrice((1 - response.couponDetails.percentageOff / 100) * price);
          setValidCoupon(response.couponDetails);
          setShowCoupen(false);
          setError("");
        }
        if (!response.valid) {
          setError("Invalid Coupon");
        }
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    setPrice(selectedPlan?.priceDetail?.unit_amount);
  }, [selectedPlan]);

  return (
    <Modal isOpen={open} toggle={toggle}>
      <ModalHeader toggle={toggle}>
        {selectedPlan?.planDetails?.name}
      </ModalHeader>
      <ModalBody>
        {" "}
        <h4 className="mb-4">
          {Object.keys(validCoupon).length > 0 ? "Updated" : "Plan"} Price: $
          {price / 100}
        </h4>
        {Object.keys(validCoupon).length > 0 && (
          <p>Discount: {validCoupon.percentageOff}%</p>
        )}
        {showCoupen && (
          <div className="mt-4 mb-4 d-flex flex-column gap-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <label htmlFor="coupon">Coupon Code:</label>
                <div>
                  <input
                    type="text"
                    id="coupon"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                  />
                </div>
              </div>

              <div
                role="button"
                className="text-danger"
                onClick={() => { setShowCoupen(false); setError(""); }}
              >
                X
              </div>
            </div>
            <div>
              {coupon.length > 0 && (
                <Button
                  color="primary"
                  type="submit"
                  className=""
                  onClick={() => handleCoupen()}
                // disabled={!stripe || !elements || processing}
                >
                  Apply Coupon
                </Button>
              )}
            </div>
          </div>
        )}
        {!showCoupen && (
          <>
            {Object.keys(validCoupon).length < 1 && (
              <p
                className="text-info mt-4 mb-4"
                style={{ cursor: "pointer" }}
                onClick={() => setShowCoupen(true)}
              >
                I have a coupon
              </p>
            )}
            {
              (chooseOtherPayment || !defaultPaymentMethod) && (
                // <div className="d-flex justify-content-between">
                <form onSubmit={handleSubmit}>
                  <CardElement />
                  <Button
                    color="primary"
                    type="submit"
                    className="mt-5"
                  // disabled={!stripe || !elements || processing}
                  >
                    {loading ? "Processing" : "Subscribe Now"}
                  </Button>
                </form>
              )
              // </div>
            }
          </>
        )}
        {error && <div className="text-danger">{error}</div>}
        {!showCoupen && defaultPaymentMethod && (
          <div className="d-flex justify-content-between">
            <Button
              color="primary"
              type="submit"
              className="mt-5"
              onClick={handleSubmitWithDefaultPayment}
            // disabled={!stripe || !elements || processing}
            >
              {loading ? "Processing" : "Pay with My Default Payment"}
            </Button>
            {!chooseOtherPayment && (
              <Button
                color="primary"
                type="submit"
                className="mt-5 btn btn-dark"
                onClick={() => setChooseOtherPayment(true)}
              // disabled={!stripe || !elements || processing}
              >
                Choose Other
              </Button>
            )}
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default SubscriptionForm;
