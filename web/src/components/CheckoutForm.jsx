import React, { useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";

const customerId = localStorage.getItem("customerId");
const customerEmail = localStorage.getItem("customerEmail");

const CheckoutForm = ({ open, toggle }) => {
  const [processing, setIsProcessing] = useState(false);
  const [selectedTab, setSelectedTab] = useState(false);

  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    const { paymentIntent, error } = await stripe.confirmPayment({
      elements,
      // clientSecret,
      // payment_method: {
      //   card: elements.getElement(PaymentElement),
      //   billing_details: {
      //     name: "name here",
      //   },
      // },
      // receipt_email: "test@gmail.com",
      redirect: "if_required",
      confirmParams: {
        // return_url: `${window.location.origin}/success`,
        receipt_email: customerEmail,
        payment_method: "",
        payment_method_data: {
          billing_details: {
            name: "name here",
            email: customerEmail,
          },
        },
      },
    });

    setIsProcessing(false);
    toggle();

    if (error) {
      setErrorMessage(error.message);
      setIsProcessing(false);
    }
  };

  return (
    <Modal isOpen={open} toggle={toggle}>
      <ModalHeader toggle={toggle}>Product Name</ModalHeader>
      <ModalBody>
        {" "}
        <form onSubmit={handleSubmit}>
          <PaymentElement
            onChange={(e) => {
              setSelectedTab(e.value.type);
            }}
          />

          <Button
            color="primary"
            type="submit"
            className="mt-5"
            disabled={!stripe || !elements || processing}
          >
            {processing ? "processing" : "Pay Now"}
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
