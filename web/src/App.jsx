import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { NavLink } from "react-router-dom";

import History from "./pages/History";
// import Product1 from "./pages/Product1";
import "./App.css";
import Home from "./pages/Home";
import Subscription from "./pages/Subscription";
import Settings from "./pages/Settings";

const App = () => {

  return (
    <div className="App">
      <Router>
        <nav className="top-nav">
          {/* <NavLink to="/">Single</NavLink> */}
          <NavLink to="/">Subscription</NavLink>
          <NavLink to="/history">History</NavLink>
          <NavLink to="/settings">Settings</NavLink>
          {localStorage.getItem("customerId") !== null &&<p onClick={()=>{localStorage.clear();window.location.reload()}}>Logout</p>}
        </nav>

        <Routes>
          {/* <Route exact path="/" element={<Home />} /> */}
          <Route exact path="/" element={<Subscription />} />
          <Route exact path="/history" element={<History />} />
          <Route exact path="/settings" element={<Settings />} />
          <Route path="*" element={<h1>Not found</h1>} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
