import React, { useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const customerId = localStorage.getItem("customerId");
const customerEmail = localStorage.getItem("customerEmail");

const CheckoutForm = ({ open, toggle }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // if (elements == null) {
    //   return;
    // }

    if(!stripe || !elements){
      return;
    }
console.log(stripe, elements)
    // Trigger form validation and wallet collection
    // const { error: submitError } = await elements.submit();
    // if (submitError) {
    //   // Show error to your customer
    //   setErrorMessage(submitError.message);
    //   return;
    // }

    // // Create the PaymentIntent and obtain clientSecret from your server endpoint
    // const res = await fetch("http://localhost:4000/purchase-product", {
    //   method: "POST",
    //   body: JSON.stringify({ customerId: customerId }),
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // });

    // if (!res.ok) {
    //   throw new Error(`Server response error: ${res.status} ${res.statusText}`);
    // }

    // const { client_secret: clientSecret } = await res.json();

    // if (!clientSecret) {
    //   throw new Error("Invalid or missing clientSecret from the server");
    // }
    // setIsProcessing(true)

    const { error } = await stripe.confirmPayment({
      elements,
      // clientSecret,
      // payment_method: {
      //   card: elements.getElement(PaymentElement),
      //   billing_details: {
      //     email: customerEmail,
      //   },
      // },
      confirmParams: {
        return_url: `${window.location.origin}/success`,
        // error_on_requires_action: true,
        // receipt_email: customerEmail,
      },
      // setup_future_usage: true,
    });

    if (error) {
      // This point will only be reached if there is an immediate error when
      // confirming the payment. Show error to your customer (for example, payment
      // details incomplete)
      setErrorMessage(error.message);
    } else {
      // Your customer will be redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer will be redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
  };

  return (
    <Modal isOpen={open} toggle={toggle}>
      <ModalHeader toggle={toggle}>Product Name</ModalHeader>
      <ModalBody>
        {" "}
        <form onSubmit={handleSubmit}>
          <PaymentElement />

          <Button
            color="primary"
            type="submit"
            className="mt-5"
            disabled={!stripe || !elements}
          >
            Pay Now
          </Button>
          {errorMessage && <div>{errorMessage}</div>}
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

export default CheckoutForm;
