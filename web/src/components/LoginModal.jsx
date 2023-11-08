import React, { useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input } from "reactstrap";
import axios from "axios";

function LoginModal({ loginModal, setLoginModal }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handleCreateCustomer = async () => {
    try {
      const response = await axios.post(
        "http://localhost:4000/create-customer",
        { email, name }
      );
      if (response) {
        console.log(response)
        localStorage.setItem("customerId", response.data.customerId);
        localStorage.setItem("customerEmail", email);
        localStorage.setItem("name", name);
        setLoginModal(!loginModal);
      }
    } catch (error) {
      console.error("Error creating customer:", error);
    }
  };

  return (
    <div>
      <Modal isOpen={loginModal}>
        <ModalHeader>
          Enter you email to login
        </ModalHeader>
        <ModalBody>
          <div className="mt-2">
            <label>Your Name:</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your Name"
            />
          </div>
          
          <div className="mt-4 mb-4">
            <label>Your Email:</label>
            <Input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleCreateCustomer} color="primary">
            Login
          </Button>

          <Button color="secondary" onClick={()=>setLoginModal(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default LoginModal;
