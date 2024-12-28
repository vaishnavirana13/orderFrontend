import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './homepage/Header';
import ProductList from './homepage/ProductList';
import { supabase } from '../supabaseClient'; // Import Supabase client
import './styles/Home.css';

const Home = () => {
  const [products, setProducts] = useState([]); // State to store products fetched from Supabase
  const [cart, setCart] = useState(() => {
    // State to manage cart, retrieves saved cart from localStorage if available
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [error, setError] = useState(''); // Error state for error messages
  const [searchQuery, setSearchQuery] = useState(''); // Search query state for product search
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    id: '',
  }); // Customer details (e.g. name, email, id)
  const [bouncingImageId, setBouncingImageId] = useState(null); // State for handling the bouncing effect of the image
  const [filteredProducts, setFilteredProducts] = useState([]); // Filtered products based on search query
  const navigate = useNavigate(); // For navigation
  const cartRef = useRef(null); // For scrolling to the cart section when a product is added

  const productImagesArray = {
    1: ["laptop1.jpg"], // Updated path for public folder
    2: ["laptop2.jpg"], // Updated path for public folder
    3: ["carimage.jpg"], // Updated path for public folder
    4: ["bikeimage.jpg"], // Updated path for public folder
  };

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        setProducts(data); // Set fetched products in the state
        setFilteredProducts(data); // Initially show all products
      } catch (err) {
        console.error('Error fetching products:', err.message);
        setError('Unable to fetch products. Please try again later.');
      }
    };

    fetchProducts();
  }, []); // Empty dependency array to run this only once when component mounts

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]); // This effect runs whenever the cart state changes

  // Handle search query change
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(products); // Show all products if search query is empty
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = products.filter((product) => {
        const productName = product.productname ? product.productname.toLowerCase() : '';
        const productDescription = product.productdescription ? product.productdescription.toLowerCase() : '';
        const productId = product.id ? product.id.toString() : '';
        
        return (
          productName.includes(lowerCaseQuery) ||
          productDescription.includes(lowerCaseQuery) ||
          productId.includes(lowerCaseQuery)
        );
      });
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]); // Re-filter products when search query or products list changes

  // Add product to cart
  const handleAddToCart = (product) => {
    const currentDate = new Date().toISOString(); // Store current date for when the product is added to the cart
    const orderDescription = `Customer: ${customerDetails.name}, Email: ${customerDetails.email}, Product: ${product.productname}`;

    setBouncingImageId(product.productid); // Trigger bouncing effect on the added product image
    setTimeout(() => setBouncingImageId(null), 600); // Reset bouncing effect after 600ms

    // Update cart by either adding a new product or increasing quantity if the product already exists in the cart
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item.productid === product.productid);
      if (existingProduct) {
        return prevCart.map((item) =>
          item.productid === product.productid
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prevCart,
        {
          ...product,
          quantity: 1,
          dateAdded: currentDate,
          orderDescription,
        },
      ];
    });

    // Scroll to the cart section after adding a product
    if (cartRef.current) {
      cartRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Delete a product from the cart
  const handleDeleteFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.productid !== productId));
  };

  // Increment product quantity in the cart
  const handleIncrement = (productId) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productid === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // Decrement product quantity in the cart
  const handleDecrement = (productId) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productid === productId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  // Handle proceeding to order summary
  const handleProceed = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty. Please add products to your cart.");
      return;
    }

    const orderDetails = cart.map((item) => ({
      orderDescription: item.orderDescription,
      createdAt: item.dateAdded,
      productId: item.productid,
      quantity: item.quantity,
      customerId: customerDetails.id,
    }));

    try {
      // Insert orders into Supabase
      const { error } = await supabase.from('orders').insert(orderDetails);
      if (error) throw error;

      // Clear cart and customer details
      setCart([]);
      setCustomerDetails({
        name: '',
        email: '',
        id: '',
      });
      localStorage.removeItem('cart'); // Remove cart from localStorage

      // Navigate to order summary page
      navigate('/order-summary', { state: { cart } });
    } catch (error) {
      console.error('Error processing order:', error.message);
      setError('Unable to process the order. Please try again later.');
    }
  };

  return (
    <div className="home-outer">
      <Header
        searchQuery={searchQuery}
        handleSearchChange={(e) => setSearchQuery(e.target.value)} // Handle search query change
      />
     
      <ProductList
        products={filteredProducts} // Pass filtered products to ProductList
        productImagesArray={productImagesArray}
        handleAddToCart={handleAddToCart}
        bouncingImageId={bouncingImageId} // Pass bouncing effect ID to ProductList
      />
    </div>
  );
};

export default Home;
