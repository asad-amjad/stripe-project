import { useEffect, useState } from "react";

const {
  Card,
  CardBody,
  CardTitle,
  CardSubtitle,
  CardText,
  Button,
} = require("reactstrap");

const PlanCard = ({ planId, handlePlan }) => {
  const [modal, setLoading] = useState(false);
  const [planDetails, setPlanDetails] = useState({});
  const [priceDetail, setPriceDetail] = useState({});

  useEffect(() => {
    if (planId) {
      setLoading(true);
      fetch(`http://localhost:4000/get-product-details/${planId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }).then(async (r) => {
        const { product } = await r.json();
        setPlanDetails(product);
        setPriceDetail(product?.extended_price_details);
      });
    }
  }, []);

  return (
    <Card
      style={{
        width: "18rem",
      }}
    >
      {planDetails?.images?.[0] && (
        <div className="w-100 p-4">
          <img alt="Sample" src={planDetails?.images?.[0]} width={100} />
        </div>
      )}
      <CardBody>
        <CardTitle tag="h5">{planDetails?.name}</CardTitle>
        <CardSubtitle className="mb-2 text-muted" tag="h6">
          ${priceDetail?.unit_amount / 100 || 0} /{" "}
          {priceDetail?.recurring?.interval}
        </CardSubtitle>
        <CardText>{planDetails?.description}</CardText>
        <Button onClick={() => handlePlan({planDetails, priceDetail})}>Choose Plan</Button>
      </CardBody>
    </Card>
  );
};
export default PlanCard;
