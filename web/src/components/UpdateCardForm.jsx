// Import necessary React modules
import React, { useState } from 'react';

// Your functional component
function UpdateCardForm() {
    // State to store form input values
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvc, setCvc] = useState('');

    // Function to handle form submission
    const updateCard = () => {
        // Make a request to your server to update the card details
        fetch('/update-card', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cardNumber: cardNumber,
                expiryDate: expiryDate,
                cvc: cvc,
            }),
        })
        .then(response => response.json())
        .then(data => {
            // Handle the response from the server (success or error)
            console.log(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    };

    return (
        <div>
            {/* Your HTML form */}
            <form>
                <label htmlFor="cardNumber">Card Number</label>
                <input
                    type="text"
                    id="cardNumber"
                    placeholder="Card Number"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    required
                />

                <label htmlFor="expiryDate">Expiration Date</label>
                <input
                    type="text"
                    id="expiryDate"
                    placeholder="MM/YYYY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    required
                />

                <label htmlFor="cvc">CVC</label>
                <input
                    type="text"
                    id="cvc"
                    placeholder="CVC"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    required
                />

                <button type="button" onClick={updateCard}>Update Card</button>
            </form>
        </div>
    );
}

// Export the component
export default UpdateCardForm;
