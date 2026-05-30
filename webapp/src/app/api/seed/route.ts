import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import FoodItem from '@/models/FoodItem';
import redis from '@/lib/redis';

const dummyData = [
  {
    name: 'Butter Chicken & Naan',
    description: 'Tender chicken simmered in a rich, creamy tomato gravy, served with garlic naan.',
    price: 349,
    imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=800',
    category: 'Main Course',
  },
  {
    name: 'Paneer Tikka Masala',
    description: 'Grilled cottage cheese cubes in a spicy, flavorful onion-tomato gravy.',
    price: 299,
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=800',
    category: 'Vegetarian',
  },
  {
    name: 'Hyderabadi Chicken Biryani',
    description: 'Aromatic basmati rice cooked with marinated chicken, saffron, and traditional spices.',
    price: 249,
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=800',
    category: 'Biryani',
  },
  {
    name: 'Masala Dosa',
    description: 'Crispy rice crepe filled with spiced potato curry, served with sambar and chutney.',
    price: 149,
    imageUrl: '/masala_dosa.png',
    category: 'South Indian',
  },
  {
    name: 'Samosa Chaat',
    description: 'Crushed samosas topped with spicy chole, sweet yogurt, and tangy chutneys.',
    price: 99,
    imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&q=80&w=800',
    category: 'Snacks',
  }
];

export async function POST() {
  try {
    await connectToDatabase();
    
    // Clear existing to avoid duplicates
    await FoodItem.deleteMany({});
    
    // Insert dummy data
    const insertedItems = await FoodItem.insertMany(dummyData);

    // Clear the Redis cache so the frontend fetches the new Indian foods!
    await redis.del('foods:all');
    
    return NextResponse.json({ message: 'Database seeded successfully', data: insertedItems }, { status: 201 });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}

