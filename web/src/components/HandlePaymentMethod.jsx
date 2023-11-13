import React, { useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";
import axios from "axios";

const HandlePaymentMethod = ({ open, toggle }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState(null);

  const customerId = localStorage.getItem("customerId"); // Get the customer ID

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

      const { paymentMethod,token, error } = await stripe.createPaymentMethod({
        type: "card",
        card: elements.getElement(CardElement),
      });

    // const { paymentMethod, error } = await stripe.createPaymentMethod({
    //   // type: selectedTab,
    //   elements: elements.getElement(PaymentElement),
    // });

    // console.log(token)

    if (error) {
      setError(error.message);
    } else {
      try {
        const response = await axios.post(
          "http://localhost:4000/attach-payment-method",
          {
            customerId,
            paymentMethodId: paymentMethod.id,
          }
        );

        console.log(response.data);
        // Handle success, e.g., show a success message to the user
      } catch (error) {
        console.error(error.response.data);
        // Handle error, e.g., show an error message to the user
      }
      // console.log(paymentMethod);
      // Send paymentMethod.id and customerId to your backend to create a subscription
    }
  };

  return (
    <Modal isOpen={open} toggle={toggle}>
      <ModalHeader toggle={toggle}>Product Name</ModalHeader>
      <ModalBody>
        {" "}
        <form onSubmit={handleSubmit}>
          <CardElement />
          <Button
            color="primary"
            type="submit"
            className="mt-5"
            // disabled={!stripe || !elements || processing}
          >
            Attach Card
          </Button>
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

export default HandlePaymentMethod;
