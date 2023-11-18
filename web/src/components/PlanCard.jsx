import { useEffect, useState } from "react";

const {
  Card,
  CardBody,
  CardTitle,
  CardSubtitle,
  CardText,
  Button,
} = require("reactstrap");

const PlanCard = ({
  planId,
  handlePlan,
  isActive,
  activeSubscriptions,
  fetchMyActiveSubscriptions,
  updatePlan,
  // calculateInvoice,
}) => {
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [planDetails, setPlanDetails] = useState({});
  const [priceDetail, setPriceDetail] = useState({});

  function getIdOfProductSubscription(product, activeSubscriptions) {
    for (const subscription of activeSubscriptions) {
      if (subscription.plan.product === product) {
        return subscription.id;
      }
    }
    return null;
  }
  
  useEffect(() => {
    if (planId) {
      setLoading(true);
      fetch(`http://localhost:4000/stripe/product/${planId}`, {
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

  const handleCancellation = async () => {
    const subscriptionId = getIdOfProductSubscription(
      planId,
      activeSubscriptions.activeSubscriptions
    );

    setProcessing(true);
    try {
      const response = await fetch(
        `http://localhost:4000/stripe/cancel-subscription`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ subscriptionId }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const { success, message } = await response.json();
      if (success) {
        setProcessing(false);
        fetchMyActiveSubscriptions();
      }
    } catch (error) {
      setProcessing(false);
      console.error("Error cancelling subscription:", error.message);
      // Handle error scenarios
    }
  };

  return (
    <Card
      style={{
        width: "18rem",
        borderColor: isActive && "green",
        borderWidth: isActive && "3px",
      }}
    >
      {isActive && (
        <div className="text-success mt-1">
          <strong>Active Plan</strong>
        </div>
      )}
      <div className="w-100 p-4" style={{ height: "150px" }}>
        {planDetails?.images?.[0] && (
          <img alt="Sample" src={planDetails?.images?.[0]} width={100} />
        )}
      </div>

      <CardBody>
        <CardTitle tag="h5">{planDetails?.name}</CardTitle>
        <CardSubtitle className="mb-2 text-muted" tag="h6">
          ${priceDetail?.unit_amount / 100 || 0} /{" "}
          {priceDetail?.recurring?.interval}
        </CardSubtitle>
        <CardText>{planDetails?.description}</CardText>

        {isActive && (
          <Button onClick={() => handleCancellation()}>
            {" "}
            {processing ? "Processing.." : "Cancel"}
          </Button>
        )}

        {!isActive && (
          <div className="d-flex justify-content-between">
            <Button
              onClick={() => {
                activeSubscriptions?.activeSubscriptions?.length
                  ? updatePlan({ newPriceDetail: priceDetail })
                  : handlePlan({ planDetails, priceDetail });
              }}
            >
              {activeSubscriptions?.activeSubscriptions?.length
                ? "Upgrade Plan"
                : "Choose Plan"}
            </Button>

            {/* <Button onClick={() => calculateInvoice({ newPriceDetail: priceDetail })}>
              Preview effet
            </Button> */}
          </div>
        )}
      </CardBody>
    </Card>
  );
};
export default PlanCard;
