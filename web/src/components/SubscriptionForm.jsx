import React, { useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";

const SubscriptionForm = ({open, toggle }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);

  const customerId = localStorage.getItem("customerId"); // Get the customer ID
  const customerEmail = localStorage.getItem("customerEmail"); // Get the customer ID


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    });

    if (error) {
      setError(error.message);
    } else {
      // Send paymentMethod.id and customerId to your backend to create a subscription
      const result = await fetch('http://localhost:4000/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: customerId,
          paymentMethodId: paymentMethod.id,
          priceId: 'price_1O6HlaKwiRWUgRBf2GvkmmYd',
        }),
      });

      if (result.ok) {
        // Handle success
      } else {
        const response = await result.json();
        setError(response.error);
      }
    }
  };

  return (
    <Modal isOpen={open} toggle={toggle}>
    <ModalHeader toggle={toggle}>Product Name</ModalHeader>
    <ModalBody>
      {" "}
      <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit">Subscribe</button>
      {error && <div>{error}</div>}
    </form>
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
