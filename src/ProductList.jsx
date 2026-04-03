import React from 'react';
import { useNavigate } from 'react-router-dom';

export function ProductList({ products, onAddToCart, isAdmin = false, onDeleteProduct, selectedCategory }) {
  const navigate = useNavigate();

  if (products.length === 0) {
    return <p className="no-products">No products available.</p>;
  }

  const handleCardClick = (product) => {
    if (!isAdmin) {
      navigate(`/product/${product.product_id}`, {
        state: { product, category: selectedCategory },
      });
    } else {
      // Save scroll position so admin can return to the same spot
      navigate(`/admin/product/${product.product_id}`, {
        state: { product, category: selectedCategory, scrollY: window.scrollY },
      });
    }
  };

  return (
    <div className="product-list">
      <div className="product-grid">
        {products.map(product => (
          <div
            key={product.product_id}
            className="product-card"
            onClick={() => handleCardClick(product)}
          >
            <img
              src={product.images[0]}
              alt={product.name}
              className="product-image"
              loading="lazy"
              onError={e => { e.target.src = 'https://via.placeholder.com/150'; }}
            />
            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <p className="product-price">₹{product.price?.toLocaleString('en-IN')}</p>

              {isAdmin ? (
                <button
                  className="delete-product-btn"
                  onClick={e => { e.stopPropagation(); onDeleteProduct(product.product_id); }}
                >
                  🗑 Delete Product
                </button>
              ) : (
                <button
                  className="add-to-cart-btn"
                  onClick={e => { e.stopPropagation(); onAddToCart(product.product_id); }}
                >
                  Add to Cart
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}