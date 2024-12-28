import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient'; 
import './styles/OrderSummary.css';

const OrderSummary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = location.state || {};
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [customer, setCustomer] = useState(null);

 
  useEffect(() => {
    const fetchCustomerDetails = async () => {
      const userId = 2; 

      try {
        const { data, error } = await supabase
          .from('customers')
          .select('id, customer_name, email')
          .eq('id', userId); 

        console.log('Supabase fetch result:', data);
        if (error) {
          console.error('Error fetching customer details:', error);
          setError('Error fetching customer details.');
          return;
        }

        if (data.length > 0) {
          setCustomer(data[0]);
        } else {
          setError('Customer not found.');
        }
      } catch (err) {
        console.error('Unexpected error fetching customer details:', err);
        setError('Unexpected error fetching customer details.');
      }
    };

    fetchCustomerDetails();
  }, []);

  
  const handleSelectProduct = (productId) => {
    setSelectedProducts((prevSelected) =>
      prevSelected.includes(productId)
        ? prevSelected.filter((id) => id !== productId) 
        : [...prevSelected, productId]
    );
  };

  
  const handleCancel = () => {
    navigate('/');
  };

 
  const handleSubmit = async () => {
    if (selectedProducts.length === 0) {
      setShowPopup(true);
      return;
    }

    if (!customer) {
      setError('Customer details are missing.');
      return;
    }

   
    const customerId = customer.id;
    const customerName = customer.customer_name;
    const customerEmail = customer.email;
    const createdAt = new Date().toISOString();

    try {
    
      const { data: orderData, error: orderError } = await supabase.from('orders').insert([{
        orderdescription: 'New Order', 
        created_at: createdAt,  
        customer_id: customerId, 
      }]).select('id');

      if (orderError) {
        console.error('Error submitting order:', orderError);
        setError('Error submitting order.');
        return;
      }

      const orderId = orderData[0].id;

      
      const orderProductMapInserts = selectedProducts.map(async (productId) => {
        const product = cart.find((item) => item.id === productId);
        if (product) {
          const { id, quantity } = product; 
          
          const { error: linkError } = await supabase.from('orderproductmap').insert([{
            order_id: orderId,
            product_id: id,
            quantity,
          }]);

          if (linkError) {
            console.error('Error linking product to order:', linkError);
            
            return;
          }
        }
      });

     
      await Promise.all(orderProductMapInserts);

      setOrderSubmitted(true);
      setTimeout(() => {
        alert('Order submitted successfully!');
        navigate('/');
      }, 1000);
    } catch (err) {
      console.error('Unexpected error submitting order:', err);
      setError('Unexpected error submitting order.');
    }
  };

 
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
