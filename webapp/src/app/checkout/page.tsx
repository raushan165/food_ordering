"use client";
import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export default function Checkout() {
  const { cart, totalPrice, clearCart, removeFromCart } = useCart();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return alert('Your cart is empty!');

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          customerAddress: address,
          items: cart.map(item => ({
            foodItemId: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          totalAmount: totalPrice,
        })
      });

      if (res.ok) {
        clearCart();
        alert('Order placed successfully!');
        router.push('/');
      } else {
        alert('Failed to place order. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
      <div style={{ flex: '1 1 300px' }}>
        <h2>Order Summary</h2>
        <div style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: 'var(--radius)', marginTop: '20px' }}>
          {cart.length === 0 ? (
            <p>No items in cart.</p>
          ) : (
            cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ flexGrow: 1 }}>{item.quantity}x {item.name}</span>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                  <button onClick={() => removeFromCart(item.id)} className="btn-remove">Remove</button>
                </div>
              </div>
            ))
          )}
          <hr style={{ borderColor: 'var(--border)', margin: '20px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem' }}>
            <span>Total:</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div style={{ flex: '2 1 400px' }}>
        <h2>Checkout Details</h2>
        <form onSubmit={handleCheckout} style={{ background: 'var(--card-bg)', padding: '30px', borderRadius: 'var(--radius)', marginTop: '20px' }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              required 
              className="form-input" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="John Doe"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Delivery Address</label>
            <textarea 
              required 
              className="form-input" 
              value={address} 
              onChange={e => setAddress(e.target.value)} 
              placeholder="123 Main St, Apt 4B"
              rows={4}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={isSubmitting || cart.length === 0}>
            {isSubmitting ? 'Processing...' : 'Place Order'}
          </button>
        </form>
      </div>
    </div>
  );
}
