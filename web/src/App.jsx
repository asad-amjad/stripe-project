import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { NavLink } from "react-router-dom";

import History from "./pages/History";
// import Product1 from "./pages/Product1";
import "./App.css";
import Home from "./pages/Home";
import Subscription from "./pages/Subscription";

const App = () => {
  return (
    <div className="App">
      <Router>
        <nav className="top-nav">
          <NavLink to="/">Single</NavLink>
          <NavLink to="/subscription">Subscription</NavLink>
          <NavLink to="/history">History</NavLink>
        </nav>

        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/subscription" element={<Subscription />} />
          <Route exact path="/history" element={<History />} />
          <Route path="*" element={<h1>Not found</h1>} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
