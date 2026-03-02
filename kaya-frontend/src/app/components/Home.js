import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard'; // Make sure this path is correct!

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetching from your working backend
        const response = await axios.get('http://localhost:5000/products');
        
        // We use response.data.products because of your JSON structure!
        setProducts(response.data.products);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching inventory:", err);
        setError("Could not load the products. Is your backend running?");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // Empty dependency array means this runs once when the page loads

  if (loading) return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Loading Collection...</h2>;
  if (error) return <h2 style={{ color: 'red', textAlign: 'center' }}>{error}</h2>;

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px', color: '#333' }}>
        KAYA Originals
      </h1>
      
      {/* CSS Grid for the layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '30px'
      }}>
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Home;