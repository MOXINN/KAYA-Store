import React from 'react';

const ProductCard = ({ product }) => {
  // Grab the first image from the array, or use a placeholder if it's missing
  const imageUrl = product.images && product.images.length > 0 
    ? product.images[0].url 
    : 'https://via.placeholder.com/300?text=No+Image';

  return (
    <div className="product-card" style={styles.card}>
      <img src={imageUrl} alt={product.name} style={styles.image} />
      
      <div style={styles.info}>
        <p style={styles.category}>{product.category}</p>
        <h3 style={styles.title}>{product.name}</h3>
        <p style={styles.price}>₹{product.price}</p>
        
        <button style={styles.button}>Add to Cart</button>
      </div>
    </div>
  );
};

// Simple inline styles to get a clean grid working immediately
const styles = {
  card: {
    border: '1px solid #eaeaea',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#fff',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column'
  },
  image: {
    width: '100%',
    height: '250px',
    objectFit: 'cover'
  },
  info: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1
  },
  category: {
    fontSize: '0.8rem',
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: '4px'
  },
  title: {
    fontSize: '1.1rem',
    margin: '0 0 10px 0',
    color: '#333'
  },
  price: {
    fontWeight: 'bold',
    fontSize: '1.2rem',
    color: '#2c3e50',
    marginTop: 'auto',
    marginBottom: '15px'
  },
  button: {
    backgroundColor: '#222',
    color: '#fff',
    border: 'none',
    padding: '10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  }
};

export default ProductCard;