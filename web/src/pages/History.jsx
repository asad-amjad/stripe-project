import axios from "axios";
import { useEffect, useState } from "react";

function History() {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Define the API endpoint URL

    // Make the API request when the component mounts#
    if (localStorage.getItem("customerId")) {
      const apiUrl = `http://localhost:4000/stripe/transaction-history/${localStorage.getItem(
        "customerId"
      )}`;
      axios
        .get(apiUrl)
        .then((response) => {
          setTransactions(response.data);
        })
        .catch((err) => {
          console.error("Error retrieving transaction history:", err);
          setError("Internal Server Error");
        });
    }
  }, []);

  return (
    <div>
      <h1>My transaction history</h1>
      <p>
        Welcome to the About Page! This page provides information about our
        application.
      </p>
      {console.log(transactions)}
      {transactions?.data &&
        transactions?.data?.map((transaction) => (
          <li  className="d-flex justify-content-center gap-4" key={transaction.id}>
          <div><b>Transaction ID:</b> {transaction.id}</div>
          <div><b>Status:</b> {transaction.status}</div>
          </li>
        ))}
    </div>
  );
}
export default History;
