import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { useNavigate, useLocation } from 'react-router-dom';
import API_BASE from './api';

export default function OrdersPage() {
  const [orders, setOrders]                 = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [cartCount, setCartCount]           = useState(0);
  const [username, setUsername]             = useState('');
  const [cartError, setCartError]           = useState(false);
  const [isCartLoading, setIsCartLoading]   = useState(true);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [paidAmount, setPaidAmount]         = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.paymentSuccess) {
      setShowSuccessToast(true);
      setPaidAmount(location.state?.amount || '');
      setTimeout(() => setShowSuccessToast(false), 5000);
      // Clear state so a page refresh doesn't re-show the toast
      window.history.replaceState({}, document.title);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => {
    if (username && username !== 'Guest') fetchCartCount();
  }, [username]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/orders`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data.products || []);
      setUsername(data.username || 'Guest');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  if (!loading && !error && orders.length === 0) {
    return (
      <div className="maindiv">
        <div className="orders-page-empty">
          <h2>No Orders Yet</h2>
          <p>Looks like you haven't placed any orders.</p>
          <button className="cart-empty-btn" onClick={() => navigate('/categories')}>
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="maindiv">
      <div className="customer-homepage">
        <Header
          cartCount={isCartLoading ? '...' : cartError ? 'Error' : cartCount}
          username={username}
        />

        {showSuccessToast && (
          <div className="payment-success-toast">
            <div className="payment-success-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="payment-success-body">
              <div className="payment-success-title">Payment Successful!</div>
              <div className="payment-success-sub">
                {paidAmount ? `₹${paidAmount} paid` : 'Your order has been placed'} — thank you for shopping with HoneyCart 🎉
              </div>
            </div>
            <button className="payment-success-close" onClick={() => setShowSuccessToast(false)}>
              ✕
            </button>
          </div>
        )}

        <main className="main-content">
          <button className="back-button orders-back" onClick={() => navigate('/customerhome')}>
            ← Continue Shopping
          </button>

          <h1 className="form-title">Your Orders</h1>

          {loading && <p className="orders-loading">Loading orders...</p>}
          {error && <p className="error-message">{error}</p>}

          {!loading && !error && orders.length > 0 && (
            <div className="orders-list">
              {orders.map((order, index) => (
                <div key={index} className="order-card">
                  <div className="order-card-header">
                    <h3>Order # {order.order_id.slice(-8).toUpperCase()}</h3>
                  </div>
                  <div className="order-card-body">
                    <img src={order.image_url} alt={order.name} className="order-product-image" />
                    <div className="order-details">
                      <h3 className="product-name">{order.name}</h3>
                      <p className="order-desc">{order.description}</p>
                      <div className="order-meta-row">
                        <span className="order-meta-key">Quantity</span>
                        <span className="order-meta-val">{order.quantity}</span>
                      </div>
                      <div className="order-meta-row">
                        <span className="order-meta-key">Price per Unit</span>
                        <span className="order-meta-val">₹{parseFloat(order.price_per_unit).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="order-meta-row order-total-row">
                        <span className="order-meta-key">Total Price</span>
                        <span className="order-meta-val order-total-val">₹{parseFloat(order.total_price).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
}