"use client";
import React from 'react';
import { useCart } from '@/context/CartContext';

type FoodCardProps = {
  food: {
    _id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    category: string;
  };
};

export default function FoodCard({ food }: FoodCardProps) {
  const { addToCart } = useCart();

  const handleAdd = () => {
    addToCart({
      id: food._id,
      name: food.name,
      price: food.price,
      quantity: 1,
    });
  };

  return (
    <div className="food-card">
      <img src={food.imageUrl} alt={food.name} className="food-image" />
      <div className="food-content">
        <h3 className="food-title">{food.name}</h3>
        <p className="food-desc">{food.description}</p>
        <div className="food-footer">
          <span className="food-price">₹{food.price.toFixed(2)}</span>
          <button className="btn-add" onClick={handleAdd}>Add to Cart</button>
        </div>
      </div>
    </div>
  );
}
