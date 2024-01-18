import { useEffect, useState } from "react";
import { convertTimestampToReadable, isObjectEmpty } from "../utils";

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
  isActiveInQueue,

  activeSubscription,
  fetchMyActiveSubscriptions,
  handleUpdatePlan,
  inQueueSubscription,
  shouldUpdateEnable,
  disableActiveBtns,
}) => {
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [planDetails, setPlanDetails] = useState({});
  const [priceDetail, setPriceDetail] = useState({});

// console.log(planDetails)

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

  const handleCancellation = async (subscriptionId) => {



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


  const handleRemoveFromQue = async (subscriptionId) => {

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
  const meteredFee = planDetails?.allPrices?.find(
    (price) => price.recurring.usage_type === "metered"
  );
  const licensedFee = planDetails?.allPrices?.find(
    (price) => price.recurring.usage_type === "licensed"
  );
// console.log(licensedFee)

  return (
    <Card
      style={{
        width: "18rem",
        borderColor: isActive && "green",
        borderWidth: isActive && "3px",
      }}
    >


      {isActiveInQueue && (
        <div className="text-success mt-1">
          <span>Active In Que</span>
        </div>
      )}


      {/* <div className="text-success mt-1">
        <span style={{ fontSize: '12px' }}>Current period end: {convertTimestampToReadable(activeSubscription.current_period_end)}</span>
      </div> */}




      {/* <div className="text-success mt-1">
        <span style={{ fontSize: '12px' }}>canceled_at: {convertTimestampToReadable(activeSubscription?.canceled_at)}</span>
      </div> */}
{/* 
      {isActive && (
        <div className="text-success mt-1">
          <span style={{ fontSize: "12px" }}>
            Cancel At:{" "}
            {convertTimestampToReadable(activeSubscription?.cancel_at)}
          </span>
        </div>
      )} */}

      {isActiveInQueue && (
        <div className="text-success mt-1">
          <span style={{ fontSize: "12px" }}>
            Start date:{" "}
            {convertTimestampToReadable(inQueueSubscription?.trial_end)}
          </span>
        </div>
      )}

      {/* console.log(activeSubscription?.canceled_at)
  console.log(activeSubscription?.cancel_at) */}
      {/* {console.log(convertTimestampToReadable(activeSubscription.current_period_end))} */}

      <div className="w-100 p-4" style={{ height: "150px" }}>
        {planDetails?.images?.[0] && (
          <img alt="Sample" src={planDetails?.images?.[0]} width={100} />
        )}
      </div>
      <CardBody>
        <CardTitle tag="h5">{planDetails?.name}</CardTitle>
        <CardTitle tag="h5">
          {" "}
          Fee: $
          {licensedFee?.unit_amount / 100 || 0}
        </CardTitle>
        <CardSubtitle className="mb-2 text-muted" tag="h6">
          ${meteredFee?.unit_amount / 100 || 0} /{" "} 
          <span>usage per request after fee</span>
          {/* {priceDetail?.recurring?.interval} */}
        </CardSubtitle>
        <CardText>{planDetails?.description}</CardText>

        {isActive && (
          <Button onClick={() => handleCancellation(activeSubscription?.id)}>
            {" "}
            {processing ? "Processing.." : "Cancel"}
          </Button>
        )}

        {!isActive && (
          <div className="d-flex justify-content-between">
            {isActiveInQueue ? (
              <Button
                // disabled={!isQueueEmpty}
                onClick={() => {
                  handleRemoveFromQue(inQueueSubscription?.id);
                }}
              >
                Remove From Que
              </Button>
            ) : (
              <Button
                disabled={!disableActiveBtns}
                onClick={() => {
                  shouldUpdateEnable
                    ? handlePlan({ planDetails, priceDetail })
                    : handleUpdatePlan({
                        planDetails,
                        newPriceDetail: priceDetail,
                      });
                }}
              >
                {shouldUpdateEnable ? "Choose Plan" : "Upgrade Plan"}
              </Button>
            )}

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
