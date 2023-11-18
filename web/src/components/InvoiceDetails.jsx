import React, { useState } from "react";

const InvoiceDetails = ({ invoice }) => {
  if (!invoice) {
    return null;
  }

  return (
    <div>
      <h2>Invoice Details:</h2>
      <p>Status: {invoice.status}</p>
      <p>Total Amount: {invoice.total / 100} USD</p>
      <p>Customer Email: {invoice.customer_email}</p>

      <h3>Invoice Items:</h3>
      <ul>
        {invoice.lines.data.map((item) => (
          <li key={item.id}>
            {item.description} - {item.amount / 100} USD
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InvoiceDetails;
