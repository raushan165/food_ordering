"use client";
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const { totalItems, totalPrice } = useCart();

  return (
    <nav className="navbar">
      <Link href="/" className="nav-brand">
        🍔 Gourmet Bites
      </Link>
      
      <Link href="/checkout" className="cart-button">
        🛒 Cart 
        {totalItems > 0 && (
          <span className="cart-badge">{totalItems}</span>
        )}
        <span style={{ marginLeft: '8px' }}>₹{totalPrice.toFixed(2)}</span>
      </Link>
    </nav>
  );
}
