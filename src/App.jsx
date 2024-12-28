import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import OrderSummary from './components/OrderSummary';
import OrderManagementPage from './components/OrderManagementPage';
import OrdersList from './components/OrderList';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/order-summary" element={<OrderSummary />} />
        <Route path="/order-management" element={<OrderManagementPage />} />
        <Route path="/orders-list" element={<OrdersList />} />
      </Routes>
    </Router>
  );
};

export default App;
