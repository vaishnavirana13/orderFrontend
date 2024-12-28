import React, { useState, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../styles/Home.css';

const Cart = forwardRef(
  ({ 
    cart, 
    handleIncrement, 
    handleDecrement, 
    handleDeleteFromCart, 
    productImagesArray, 
  }, ref) => {

    const [bouncingImageId, setBouncingImageId] = useState(null); 
    const navigate = useNavigate();

    
    const handleIncrementWithBounce = (itemId) => {
      handleIncrement(itemId); 
      setBouncingImageId(itemId);

     
      setTimeout(() => {
        setBouncingImageId(null);
      }, 500); 
    };

    
    const handleDecrementWithBounce = (itemId) => {
      handleDecrement(itemId);
      setBouncingImageId(itemId); 

      
      setTimeout(() => {
        setBouncingImageId(null);
      }, 500); 
    };

    
    const handleProceed = () => {
      if (cart.length > 0) {
      
        navigate('/order-summary', { state: { cart } });
      } else {
        alert("Your cart is empty. Add items to proceed.");
      }
    };

    return (
      <div className="cart-outer">
        <div className="container" ref={ref}>
          <h2>Cart</h2>
          {cart.length > 0 ? (
            <>
              <table className="cart-table">
                <thead>
                  <tr>
                    <th>Product ID</th>
                    <th>Product Name</th>
                    <th>Quantity</th>
                    <th>Date Added</th>
                    <th>Order Description</th>
                    <th>Product Images</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => {
                   
                    const imageSrc = productImagesArray[item.id] ? `/${productImagesArray[item.id][0]}` : null;

                    return (
                      <tr key={item.id + item.dateAdded}>
                        <td>{item.id}</td>
                        <td>{item.productname}</td>
                        <td className="quantdata">
                          <button
                            className="incredecre"
                            onClick={() => handleDecrementWithBounce(item.id)} 
                          >
                            -
                          </button>
                          {item.quantity}
                          <button
                            className="incredecre"
                            onClick={() => handleIncrementWithBounce(item.id)} 
                          >
                            +
                          </button>
                        </td>
                        <td>{new Date(item.dateAdded).toLocaleString()}</td>
                        <td>{item.productdescription}</td>
                        <td>
                          <div className="image-stack">
                            {imageSrc && item.quantity > 0 && (
                              <>
                                {Array.from({ length: Math.min(item.quantity, 3) }).map((_, index) => {
                                  
                                  let tiltClass = '';
                                  if (index === 1) {
                                    tiltClass = 'tilt-left';  
                                  } else if (index === 2) {
                                    tiltClass = 'tilt-right'; 
                                  }

                                  return (
                                    <img
                                      key={index}
                                      src={imageSrc} 
                                      alt={`product-image-${item.id}-${index}`}
                                      className={`stacked-image ${bouncingImageId === item.id ? 'bounce-animation' : ''} ${tiltClass}`} 
                                    />
                                  );
                                })}
                                {item.quantity > 3 && (
                                  <div className="extra-images">+{item.quantity - 3}</div>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                        <td>
                          <button onClick={() => handleDeleteFromCart(item.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="orderSummaryBtn">
                <button onClick={handleProceed} className="proceed-button">
                  Proceed to Order Summary
                </button>
              </div>
            </>
          ) : (
            <p>Your cart is empty. Add products to see them here.</p>
          )}
        </div>
      </div>
    );
  }
);

export default Cart;
