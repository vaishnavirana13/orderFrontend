import React, { useState, useRef, useEffect } from 'react';
import '../styles/Home.css';
import Cart from './Cart';

const ProductList = ({
  products,
  searchQuery,
  openImagePopup,
  productImagesArray,
}) => {
  const [cart, setCart] = useState([]); 
  const [bouncingImageId, setBouncingImageId] = useState(null); 
  const cartRef = useRef(null);

  
  useEffect(() => {
    console.log("Search Query: ", searchQuery);
    console.log("Products: ", products);
  }, [searchQuery, products]);

 
  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find(item => item.id === product.id);

      if (existingProduct) {
        
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, dateAdded: new Date() }
            : item
        );
      } else {
        
        const newCartItem = {
          ...product,
          quantity: 1,
          dateAdded: new Date(),
        };
        return [...prevCart, newCartItem];
      }
    });

   
    setBouncingImageId(product.id);

    
    setTimeout(() => {
      setBouncingImageId(null); 
    }, 500);

   
    if (cartRef.current) {
      cartRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

 
  const normalizedSearchQuery = searchQuery ? searchQuery.toLowerCase() : '';

  
  const filteredProducts = products.filter((product) => {
    if (!product || !product.productname) {
      console.warn('Skipping product with missing productname', product); 
      return false;
    }
   
    const productName = product.productname ? product.productname.toLowerCase() : '';
    const productId = product.id ? product.id.toString() : '';

    return (
      productName.includes(normalizedSearchQuery) ||
      productId.includes(normalizedSearchQuery)
    );
  });

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-8">
          <h2 className="text-center p-5 text-lg-center">Available Products</h2>
          <div className="product-list">
            {filteredProducts.map((product) => {
            
              const imageSrc = productImagesArray[product.id]
                ? `/${productImagesArray[product.id][0]}`
                : null;

              return (
                <div key={product.id} className="product-card">
                  <div className="product-images">
                    <h3>{product.productname}</h3>
                    {imageSrc && (
                      <img
                        src={imageSrc}
                        alt={product.productname}
                        className={`product-image ${
                          bouncingImageId === product.id ? 'bounce-animation' : ''
                        }`}
                        onClick={() => openImagePopup(imageSrc)}
                      />
                    )}
                  </div>
                  <p>
                    <b>Description:</b> {product.productdescription}
                  </p>
                  <button onClick={() => handleAddToCart(product)}>
                    Add to Cart
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        <div className="col-md-4">
          <div className="stickySidebar">
            <img src="/homeimg.jpg" alt="Sidebar" />
          </div>
        </div>
      </div>

      <div ref={cartRef}>
        <Cart
          cart={cart}
          handleIncrement={(productId) => {
            setCart((prevCart) =>
              prevCart.map((item) =>
                item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
              )
            );
          }}
          handleDecrement={(productId) => {
            setCart((prevCart) =>
              prevCart.map((item) =>
                item.id === productId && item.quantity > 1
                  ? { ...item, quantity: item.quantity - 1 }
                  : item
              )
            );
          }}
          handleDeleteFromCart={(productId) => {
            setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
          }}
          handleProceed={() => {
            alert("Proceed to order summary");
          }}
          productImagesArray={productImagesArray}
        />
      </div>
    </div>
  );
};

export default ProductList;
