// YourComponent.js

import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { Button } from 'reactstrap';

const YourComponent = () => {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            return;
        }
        const customerId = localStorage.getItem("customerId"); // Get the customer ID

        const cardElement = elements.getElement(CardElement);

        const { token, error } = await stripe.createToken(cardElement);

        if (error) {
            console.error(error);
        } else {
            // console.log(token)

            try {
                const response = await axios.post(
                    "http://localhost:4000/add-new-payment-method",
                    {
                        customerId: customerId,
                        token: token,
                    }
                );

                console.log(response.data);
                // Handle success, e.g., show a success message to the user
            } catch (error) {
                console.error(error.response.data);
                // Handle error, e.g., show an error message to the user
            }
            // Send the token to your server
            // Handle the server response (explained in the next step)
        }
    };

    return (
        <div className='w-100'>
            <form onSubmit={handleSubmit}>
                <CardElement />
                <Button type="submit" className='mt-4'>Submit</Button>
            </form>
        </div>
    );
};

export default YourComponent;
