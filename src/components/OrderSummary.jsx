import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Adjust path as needed for your project structure
import './styles/OrderSummary.css';

const OrderSummary = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get the location object to access passed state
  const { cart } = location.state || {}; // Retrieve cart from state passed via navigate
  const [selectedProducts, setSelectedProducts] = useState([]); // Track selected products
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [customer, setCustomer] = useState(null); // Track customer details

  // Fetch customer details (using a dummy customer ID of 1)
  useEffect(() => {
    const fetchCustomerDetails = async () => {
      const userId = 2; // Use a valid user ID from the customer table (e.g., userId = 2)

      try {
        const { data, error } = await supabase
          .from('customers')
          .select('id, customer_name, email')
          .eq('id', userId); // Ensure this ID matches one of the IDs in your API data

        console.log('Supabase fetch result:', data); // Log the result to the console for debugging
        if (error) {
          console.error('Error fetching customer details:', error);
          setError('Error fetching customer details.');
          return;
        }

        if (data.length > 0) {
          setCustomer(data[0]); // Store customer data if found
        } else {
          setError('Customer not found.');
        }
      } catch (err) {
        console.error('Unexpected error fetching customer details:', err);
        setError('Unexpected error fetching customer details.');
      }
    };

    fetchCustomerDetails();
  }, []); // Empty array to run once when the component mounts

  // Handle product selection for the order
  const handleSelectProduct = (productId) => {
    setSelectedProducts((prevSelected) =>
      prevSelected.includes(productId)
        ? prevSelected.filter((id) => id !== productId) // Deselect if already selected
        : [...prevSelected, productId] // Select if not selected
    );
  };

  // Handle cancel order (navigate to home or cart)
  const handleCancel = () => {
    navigate('/'); // Navigate back to the home page or cart page
  };

  // Handle order submission
  const handleSubmit = async () => {
    if (selectedProducts.length === 0) {
      setShowPopup(true); // Show a popup if no product is selected
      return;
    }

    if (!customer) {
      setError('Customer details are missing.');
      return;
    }

    // Provide customer details and current time
    const customerId = customer.id;
    const customerName = customer.customer_name;
    const customerEmail = customer.email;
    const createdAt = new Date().toISOString(); // Ensure created_at is in ISO format

    try {
      // Insert order into 'orders' table with customer_id
      const { data: orderData, error: orderError } = await supabase.from('orders').insert([{
        orderdescription: 'New Order', // Default description, modify as needed
        created_at: createdAt,  // Ensure this matches your column name
        customer_id: customerId,  // Ensure this matches the exact column name in your DB schema
      }]).select('id');  // Return the id of the newly inserted order

      if (orderError) {
        console.error('Error submitting order:', orderError);
        setError('Error submitting order.');
        return;
      }

      const orderId = orderData[0].id; // Get the order id after insertion

      // Now insert into 'orderproductmap' to link products with the order
      const orderProductMapInserts = selectedProducts.map(async (productId) => {
        const product = cart.find((item) => item.id === productId); // Find the product by id
        if (product) {
          const { id, quantity } = product; // Retrieve the product details
          // Insert into the 'orderproductmap' table to link the order with the product
          const { error: linkError } = await supabase.from('orderproductmap').insert([{
            order_id: orderId, // Link the order to the orderproductmap
            product_id: id, // Link the product to the orderproductmap
            quantity, // Include the quantity
          }]);

          if (linkError) {
            console.error('Error linking product to order:', linkError);
            
            return;
          }
        }
      });

      // Wait for all products to be linked to the order
      await Promise.all(orderProductMapInserts);

      setOrderSubmitted(true);
      setTimeout(() => {
        alert('Order submitted successfully!');
        navigate('/'); // Navigate to the home or cart page after submission
      }, 1000);
    } catch (err) {
      console.error('Unexpected error submitting order:', err);
      setError('Unexpected error submitting order.');
    }
  };

  // Handle closing the popup
  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="order-summary-container">
      <h1>Order Summary</h1>

      {orderSubmitted && <p className="success-message">Order Submitted!</p>}
      {error && <p className="error-message">{error}</p>}

      <h2>Select Products</h2>
      {cart && cart.length > 0 ? (
        <div className="product-list">
          {cart.map((product) => (
            <div className="productDetailOuter" key={product.id}>
              <div className="productDetailInner">
                {/* Show selected product details when the product is checked */}
                {selectedProducts.includes(product.id) && (
                  <div className="selected-product-details">
                    <h4>Selected Product Details</h4>
                    <ul className='orderDes'>
                      <li><strong>Product Name:</strong> {product.productname}</li>
                      <li><strong>Product Description:</strong> {product.productdescription}</li>
                      <li><strong>Quantity:</strong> {product.quantity}</li> 
                    </ul>
                  </div>
                )}
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)} 
                  onChange={() => handleSelectProduct(product.id)} 
                />
                <h3>{product.productname}</h3>
                <p>{product.productdescription}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No products in your cart.</p>
      )}

      <div className="order-actions">
        <button onClick={handleCancel} className="cancel-button">
          Cancel
        </button>
        <button onClick={handleSubmit} className="submit-button">
          Submit Order
        </button>
      </div>

      {/* Sidebar with images */}
      <div className="sidebar">
        {selectedProducts.length === 0 ? (
          <img
            src="selectfirst.jpg"
            alt="No product selected"
            className="sidebar-image"
          />
        ) : (
          <img
            src="productselected.jpg"
            alt="Product selected"
            className="sidebar-image"
          />
        )}
      </div>

      {/* Popup for no item selected */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <img
              src="oppsi.png"
              alt="No items selected"
              className="popup-image"
            />
            <p>Please select at least one item to proceed with the order.</p>
            <button onClick={closePopup} className="close-popup-button">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Button to redirect to the Order List */}
      <div className="order-list-button-container">
        <button
          className="go-to-order-list-button"
          onClick={() => navigate('/orders-list')}
        >
          Go to Order List
        </button>
      </div>
    </div>
  );
};

export default OrderSummary;
