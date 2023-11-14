import React from 'react';
import { Card, CardBody, CardTitle, CardSubtitle, ListGroup, ListGroupItem } from 'reactstrap';

const PaymentMethodCard = ({ paymentMethod }) => {
    return (
        <Card className="shadow-lg p-4 m-3" style={{
            width: "30rem"
        }} >
            <CardBody className=''>
                <CardTitle tag="h5" className="mb-3">Payment Method</CardTitle>
                <CardSubtitle tag="h6" className="mb-4 text-muted">
                    {paymentMethod.card.brand} ending in {paymentMethod.card.last4}
                </CardSubtitle>
            </CardBody>
            <ListGroup flush>
                <ListGroupItem className="py-2">
                    <strong>Card Type:</strong> {paymentMethod.card.brand}
                </ListGroupItem>
                <ListGroupItem className="py-2">
                    <strong>Card Number:</strong> **** **** **** {paymentMethod.card.last4}
                </ListGroupItem>
                <ListGroupItem className="py-2">
                    <strong>Expiration Date:</strong> {paymentMethod.card.exp_month}/{paymentMethod.card.exp_year}
                </ListGroupItem>
                <ListGroupItem className="py-2">
                    <strong>Address Postal Code Check:</strong> {paymentMethod.card.checks.address_postal_code_check}
                </ListGroupItem>
                <ListGroupItem className="py-2">
                    <strong>CVC Check:</strong> {paymentMethod.card.checks.cvc_check}
                </ListGroupItem>
                <ListGroupItem className="py-2">
                    <strong>Country:</strong> {paymentMethod.card.country}
                </ListGroupItem>
            </ListGroup>
        </Card>
    );
};

export default PaymentMethodCard;
