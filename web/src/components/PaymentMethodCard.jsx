import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardTitle,
  CardSubtitle,
  ListGroup,
  ListGroupItem,
  Button,
} from "reactstrap";

const PaymentMethodCard = ({ paymentMethod, defaultPaymentMethod, fetchMyPaymentMethods }) => {
  const customerId = localStorage.getItem("customerId");
  const [processing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);


  const handleNewPaymentMethod = (defaultMethodId) => {
    setIsProcessing(true)
    fetch("http://localhost:4000/stripe/set-default-method", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ customerId, newPaymentMethodId: defaultMethodId }),
    }).then(async (r) => {
      const { success, message } = await r.json();
      setIsProcessing(false)
      console.log(message)
      if (!success) {
        setErrorMessage(message)
      }

      if (success) {
        fetchMyPaymentMethods()
      }
    });
  };

  return (
    <Card
      className="shadow-lg p-4 m-3"
      style={{
        width: "30rem",
        borderColor: defaultPaymentMethod?.id == paymentMethod?.id && "green",
        borderWidth: defaultPaymentMethod?.id == paymentMethod?.id && "3px",
        // defaultPaymentMethod?.id ==paymentMethod?.id
      }}
    >
      <CardBody className="">
        <CardTitle tag="h5" className="mb-3">
          {paymentMethod.card.brand} ending in {paymentMethod.card.last4}
        </CardTitle>
        {/* <CardSubtitle tag="h6" className="mb-4 text-muted">
                    {paymentMethod.card.brand} ending in {paymentMethod.card.last4}
                </CardSubtitle> */}
      </CardBody>
      <ListGroup flush>
        <ListGroupItem className="py-2">
          <strong>Card Type:</strong> {paymentMethod.card.brand}
        </ListGroupItem>
        <ListGroupItem className="py-2">
          <strong>Card Number:</strong> **** **** ****{" "}
          {paymentMethod.card.last4}
        </ListGroupItem>
        <ListGroupItem className="py-2">
          <strong>Expiration Date:</strong> {paymentMethod.card.exp_month}/
          {paymentMethod.card.exp_year}
        </ListGroupItem>
        <ListGroupItem className="py-2">
          <strong>Address Postal Code Check:</strong>{" "}
          {paymentMethod.card.checks.address_postal_code_check}
        </ListGroupItem>
        <ListGroupItem className="py-2">
          <strong>CVC Check:</strong> {paymentMethod.card.checks.cvc_check}
        </ListGroupItem>
        <ListGroupItem className="py-2">
          <strong>Country:</strong> {paymentMethod.card.country}
        </ListGroupItem>

        {defaultPaymentMethod?.id !== paymentMethod?.id && (
          <div className="d-flex justify-content-between mt-5">

            <Button onClick={() => handleNewPaymentMethod(paymentMethod?.id)}>
              {processing ? 'processing...' : 'Make it defalut'}
            </Button>

            {/* <Button>
              Edit
            </Button> */}
          </div>
        )}
      </ListGroup>
    </Card>
  );
};

export default PaymentMethodCard;
