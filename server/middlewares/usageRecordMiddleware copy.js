
require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

let callCount = 0;
let totalCost = 0;

const usageRecordMiddleware = async (req, res, next) => {
  const customerId = req.params.customerId;
  try {
    // const invoice = await stripe.invoices.retrieve('in_1OVtH2GFh2MSTjvegdKsisHb');

    // // Update the invoice with the new amount
    // const aa = await stripe.invoiceItems.update('in_1OVtH2GFh2MSTjvegdKsisHb', {
    //   amount: 2000,
    // });

    // getfrom subscription
    // const invoiceItems = await stripe.invoiceItems.list({
    //   // limit: 3,
    //   customer: customerId,
    // });
    // console.log(invoiceItems)

    //     console.log(invoiceItems)
    // const invoice = await stripe.invoices.update(
    //   'in_1OVtH2GFh2MSTjvegdKsisHb',
    //   {
    //     metadata: {
    //       order_id: 'aabbb',
    //     },
    //   }
    // );

    // const invoiceItem = await stripe.invoiceItems.update(
    //   "ii_1OVuu0GFh2MSTjveJhtTrpbX",
    //   {
    //     price: "price_1OVuLVGFh2MSTjveJRO2BSFv",
    //   }
    // );

    // console.log(invoiceItem)

    // if(totalCost > 10){
      const invoiceItem = await stripe.invoiceItems.create({
        customer: customerId,
        price: "price_1OVuLVGFh2MSTjveJRO2BSFv", // active plan call charge id | dashboard
        description: "Extra Charge",
      });

      console.log(invoiceItem)
    // invoice id should save in DB
    // }

    // console.log(invoiceItem)

    // const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
    //   customer: customerId,
    // });

    // console.log(upcomingInvoice)

    // const subscriptions = await stripe.subscriptions.list({
    //   // limit: 1,
    //   customer: customerId,
    //   status: "active",
    // });

    // console.log(invoice)
    // console.log(invoiceItem);
    // il_tmp_1410fdGFh2MSTjve8891e78d
    // console.log(subscriptions.data)

    // Increment call count
    callCount++;

    function calculatePrice() {
      // For simplicity, Fixed price of $5 per call
      return 2;
    }

    // Calculate price based on some logic (you can customize this)
    const price = calculatePrice();

    // Increment total cost
    totalCost += price;

    // Log information (you can customize this)
    console.log(
      `Call #${callCount} - Price: $${price} - Total Cost: $${totalCost}`
    );

    next();
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({
      error: "Something went wrong with usage record",
    });
  }
};

module.exports = usageRecordMiddleware;