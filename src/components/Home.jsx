import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './homepage/Header';
import ProductList from './homepage/ProductList';
import { supabase } from '../supabaseClient';
import './styles/Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => {
   
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    id: '',
  });
  const [bouncingImageId, setBouncingImageId] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const navigate = useNavigate();
  const cartRef = useRef(null);
  const productImagesArray = {
    1: ["laptop1.jpg"], 
    2: ["laptop2.jpg"],
    3: ["carimage.jpg"],
    4: ["bikeimage.jpg"],
  };


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err.message);
        setError('Unable to fetch products. Please try again later.');
      }
    };

    fetchProducts();
  }, []);

 
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);


  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(products);
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
  }, [searchQuery, products]);

 
  const handleAddToCart = (product) => {
    const currentDate = new Date().toISOString();
    const orderDescription = `Customer: ${customerDetails.name}, Email: ${customerDetails.email}, Product: ${product.productname}`;

    setBouncingImageId(product.productid);
    setTimeout(() => setBouncingImageId(null), 600);

    
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

 
    if (cartRef.current) {
      cartRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

 
  const handleDeleteFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.productid !== productId));
  };

 
  const handleIncrement = (productId) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productid === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };


  const handleDecrement = (productId) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productid === productId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };


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
     
      const { error } = await supabase.from('orders').insert(orderDetails);
      if (error) throw error;

      
      setCart([]);
      setCustomerDetails({
        name: '',
        email: '',
        id: '',
      });
      localStorage.removeItem('cart');

     
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
        handleSearchChange={(e) => setSearchQuery(e.target.value)}
      />
     
      <ProductList
        products={filteredProducts}
        productImagesArray={productImagesArray}
        handleAddToCart={handleAddToCart}
        bouncingImageId={bouncingImageId}
      />
    </div>
  );
};

export default Home;
