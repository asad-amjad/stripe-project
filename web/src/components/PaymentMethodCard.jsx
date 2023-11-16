import React from "react";
import {
  Card,
  CardBody,
  CardTitle,
  CardSubtitle,
  ListGroup,
  ListGroupItem,
  Button,
} from "reactstrap";

const PaymentMethodCard = ({ paymentMethod, defaultPaymentMethod }) => {
  const customerId = localStorage.getItem("customerId");

  const handleNewPaymentMethod = () => {
    console.log('sda')
    // const
    // fetch("http://localhost:4000/update-payment-method", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ customerId: customerId }),
    // }).then(async (r) => {
    //   const { paymentMethods } = await r.json();
    //   // setPaymentMethodsList(paymentMethods);
    // });
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
          <Button onClick={() => handleNewPaymentMethod()}>
            Make it defalut
          </Button>
        )}
      </ListGroup>
    </Card>
  );
};

export default PaymentMethodCard;
