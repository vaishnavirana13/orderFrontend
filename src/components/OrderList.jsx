import React, { useEffect, useState } from 'react';
import './styles/Home.css'

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/orders'); // Backend endpoint
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="orders-list-container">
      <h2 className='text-center'>Orders List</h2>
      {orders.length > 0 ? (
        <table className="orders-table">
          <thead>
            <tr>
            
              <th>Created At</th>
              <th>Action</th> {/* For future actions like view/edit */}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
             
                <td>{new Date(order.created_at).toLocaleString()}</td>
                <td>
                  {/* Add buttons for possible actions */}
                  <button className="view-button">View</button>
                  <button className="edit-button">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No orders found.</p>
      )}
    </div>
  );
};

export default OrdersList;
