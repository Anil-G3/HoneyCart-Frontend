import React, { useEffect, useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { useNavigate } from 'react-router-dom';
import API_BASE from './api';

const CartPage = () => {
  const [cartItems, setCartItems]       = useState([]);
  const [overallPrice, setOverallPrice] = useState(0);
  const [username, setUsername]         = useState('');
  const [subtotal, setSubtotal]         = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/cart/items`, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch cart items');
        const data = await response.json();
        setCartItems(
          data?.cart?.products.map(item => ({
            ...item,
            total_price:    parseFloat(item.total_price),
            price_per_unit: parseFloat(item.price_per_unit),
          })) || []
        );
        setOverallPrice(parseFloat(data?.cart?.overall_total_price || 0));
      } catch (error) {
        console.error('Error fetching cart items:', error);
      }
    };
    fetchCartItems();
  }, []);

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const res  = await fetch(`${API_BASE}/api/auth/session`, { credentials: 'include' });
        const data = await res.json();
        setUsername(data.username || '');
      } catch (e) {
        console.error(e);
      }
    };
    fetchUsername();
  }, []);

  useEffect(() => {
    const total = cartItems.reduce((total, item) => total + item.total_price, 0);
    setSubtotal(total);
  }, [cartItems]);

  const handleRemoveItem = async (productId) => {
    try {
      const response = await fetch(`${API_BASE}/api/cart/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, productId }),
      });
      if (response.status === 204) {
        setCartItems(prev => prev.filter(item => item.product_id !== productId));
      } else {
        throw new Error('Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    try {
      if (newQuantity <= 0) { handleRemoveItem(productId); return; }
      const response = await fetch(`${API_BASE}/api/cart/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, productId, quantity: newQuantity }),
      });
      if (response.ok) {
        setCartItems(prev =>
          prev.map(item =>
            item.product_id === productId
              ? { ...item, quantity: newQuantity, total_price: item.price_per_unit * newQuantity }
              : item
          )
        );
      } else {
        throw new Error('Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const fmt = (num) => parseFloat(num).toLocaleString('en-IN', { maximumFractionDigits: 0 });

  const handleCheckout = async () => {
    try {
      const finalTotal  = subtotal + parseFloat(shipping);
      const requestBody = {
        totalAmount: finalTotal,
        cartItems: cartItems.map(item => ({
          productId: item.product_id,
          quantity:  item.quantity,
          price:     item.price_per_unit,
        })),
      };

      const response = await fetch(`${API_BASE}/api/payment/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error(await response.text());
      let razorpayOrderId = await response.text();
      razorpayOrderId = razorpayOrderId.replace(/"/g, '');

      // Razorpay test mode caps the popup amount; charge ₹100 instead of the real total if it exceeds ₹20,000
      const amountForPopup = finalTotal > 20000 ? 100 : finalTotal;

      const options = {
        key:         'rzp_test_SMFhtMnapw3aPc',
        amount:      Math.round(amountForPopup * 100),
        currency:    'INR',
        name:        'HoneyCart',
        description: finalTotal > 20000 ? `Original Total: ₹${fmt(finalTotal)}` : 'Order Checkout',
        order_id:    razorpayOrderId,
        handler: async function (response) {
          try {
            const verifyResponse = await fetch(`${API_BASE}/api/payment/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                razorpayOrderId:    response.razorpay_order_id,
                razorpayPaymentId:  response.razorpay_payment_id,
                razorpaySignature:  response.razorpay_signature,
              }),
            });
            const result = await verifyResponse.text();
            if (verifyResponse.ok) {
              navigate('/orders', { state: { paymentSuccess: true, amount: fmt(finalTotal) } });
            } else {
              alert('Payment verification failed: ' + result);
            }
          } catch (error) {
            console.error('Error verifying payment:', error);
            alert('Payment verification failed. Please try again.');
          }
        },
        prefill: { name: username, email: 'test@example.com', contact: '9999999999' },
        theme:   { color: '#0D9488' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      alert('Payment failed. Please try again.');
      console.error('Error during checkout:', error);
    }
  };

  const totalProducts = () => cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const shipping = 370;

  if (cartItems.length === 0) {
    return (
      <div className="cart-page empty">
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added anything yet.</p>
        <button className="cart-empty-btn" onClick={() => navigate('/categories')}>
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page-wrapper">
      <Header cartCount={totalProducts()} username={username} />
      <div className="cart-container">
        <div className="cart-page">
          <a
            href="#"
            className="back-button"
            onClick={e => { e.preventDefault(); navigate('/customerhome'); }}
          >
            ← Continue Shopping
          </a>

          <div className="cart-header">
            <h2>Shopping Cart</h2>
            <p>You have {cartItems.length} items in your cart</p>
          </div>

          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.product_id} className="cart-item">
                <img
                  src={item.image_url || 'https://via.placeholder.com/80?text=No+Image'}
                  alt={item.name}
                />
                <div className="item-details">
                  <div className="item-info">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                  </div>
                  <div className="item-actions">
                    <div className="quantity-controls">
                      <button onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}>-</button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}>+</button>
                    </div>
                    <span className="price">₹{fmt(item.total_price)}</span>
                    <button className="remove-btn" onClick={() => handleRemoveItem(item.product_id)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="checkout-section">
          <h2>Order Summary</h2>
          <div className="checkout-summary">
            <div className="summary-row"><span>Subtotal</span><span>₹{fmt(subtotal)}</span></div>
            <div className="summary-row"><span>Shipping</span><span>₹{fmt(shipping)}</span></div>
            <div className="summary-row"><span>Total Products</span><span>{totalProducts()}</span></div>
            <div className="summary-row total"><span>Total</span><span>₹{fmt(subtotal + shipping)}</span></div>
            <button className="checkout-button" onClick={handleCheckout}>Proceed to Checkout</button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;