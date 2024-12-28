import React, { useState, useRef, useEffect } from 'react';
import '../styles/Home.css';
import Cart from './Cart';

const ProductList = ({
  products,
  searchQuery,
  openImagePopup,
  productImagesArray, // Pass the images array as a prop
}) => {
  const [cart, setCart] = useState([]); // State to hold the cart items
  const [bouncingImageId, setBouncingImageId] = useState(null); // State to trigger bounce animation
  const cartRef = useRef(null); // Reference to the cart section

  // Log the searchQuery and products to see if they're being passed correctly
  useEffect(() => {
    console.log("Search Query: ", searchQuery);
    console.log("Products: ", products);
  }, [searchQuery, products]);

  // Handle adding product to the cart
  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find(item => item.id === product.id);

      if (existingProduct) {
        // If the product already exists in the cart, update the quantity
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, dateAdded: new Date() }
            : item
        );
      } else {
        // If the product is not in the cart, add it
        const newCartItem = {
          ...product,
          quantity: 1,
          dateAdded: new Date(),
        };
        return [...prevCart, newCartItem];
      }
    });

    // Set the image to bounce when added to the cart
    setBouncingImageId(product.id);

    // After 0.5s (animation duration), reset the bounce effect
    setTimeout(() => {
      setBouncingImageId(null); // Reset bouncing effect
    }, 500); // Match this duration with your CSS animation duration

    // Scroll to the cart section after adding the product
    if (cartRef.current) {
      cartRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Ensure that searchQuery is always a string and is lowercase
  const normalizedSearchQuery = searchQuery ? searchQuery.toLowerCase() : '';

  // Filter products based on the search query
  const filteredProducts = products.filter((product) => {
    if (!product || !product.productname) {
      console.warn('Skipping product with missing productname', product); // Log warning for missing productname
      return false;
    }
    // Ensure product.productname is always a string (empty string if undefined or null)
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
              // Get the image from productImagesArray using the product.id
              const imageSrc = productImagesArray[product.id]
                ? `/${productImagesArray[product.id][0]}`
                : null;

              return (
                <div key={product.id} className="product-card">
                  <div className="product-images">
                    <h3>{product.productname}</h3>
                    {imageSrc && (
                      <img
                        src={imageSrc} // Use the correct image path
                        alt={product.productname}
                        className={`product-image ${
                          bouncingImageId === product.id ? 'bounce-animation' : ''
                        }`}
                        onClick={() => openImagePopup(imageSrc)} // Open the image popup on click
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
