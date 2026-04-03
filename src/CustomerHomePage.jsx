import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CategoryNavigation } from './CategoryNavigation';
import { ProductList } from './ProductList';
import { Footer } from './Footer';
import { Header } from './Header';
import API_BASE from './api';

export default function CustomerHomePage() {
  const location = useLocation();
  const initialCategory = location.state?.selectedCategory || 'Mobiles';

  const [products, setProducts]             = useState([]);
  const [cartCount, setCartCount]           = useState(0);
  const [username, setUsername]             = useState('');
  const [cartError, setCartError]           = useState(false);
  const [isCartLoading, setIsCartLoading]   = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [toastMsg, setToastMsg]             = useState('');
  const [toastProduct, setToastProduct]     = useState('');

  useEffect(() => {
    fetchProducts(initialCategory);
  }, []);

  useEffect(() => {
    if (username) fetchCartCount();
  }, [username]);

  const fetchProducts = async (category = '') => {
    try {
      const response = await fetch(
        `${API_BASE}/api/products${category ? `?category=${category}` : '?category=Mobiles'}`,
        { credentials: 'include' }
      );
      const data = await response.json();
      if (data) {
        setUsername(data.user?.name || 'Guest');
        setProducts(data.products || []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const fetchCartCount = async () => {
    setIsCartLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/cart/items/count?username=${username}`,
        { credentials: 'include' }
      );
      const count = await response.json();
      setCartCount(count);
      setCartError(false);
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCartError(true);
    } finally {
      setIsCartLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    fetchProducts(category);
  };

  const handleAddToCart = async (productId) => {
    if (!username) return;

    try {
      const response = await fetch(`${API_BASE}/api/cart/add`, {
        credentials: 'include',
        method: 'POST',
        body: JSON.stringify({ username, productId }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        fetchCartCount();
        const product = products.find(p => p.product_id === productId);
        setToastProduct(product?.name || 'Product');
        setToastMsg('Added to cart!');
        setTimeout(() => setToastMsg(''), 3000);
      } else {
        console.error('Failed to add product to cart');
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };

  return (
    <div className="customer-homepage">
      <Header
        cartCount={isCartLoading ? '...' : cartError ? 'Error' : cartCount}
        username={username}
      />
      <nav className="navigation">
        <CategoryNavigation onCategoryClick={handleCategoryClick} activeCategory={selectedCategory} />
      </nav>
      <main className="main-content">
        <ProductList
          products={products}
          onAddToCart={handleAddToCart}
          selectedCategory={selectedCategory}
        />
      </main>
      <Footer />

      {toastMsg && (
        <div className="pd-toast">
          <div className="pd-toast-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <div className="pd-toast-text">Added to cart!</div>
            <div className="pd-toast-sub">{toastProduct}</div>
          </div>
        </div>
      )}
    </div>
  );
}