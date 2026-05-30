import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import FoodItem from '@/models/FoodItem';
import redis from '@/lib/redis';

export async function GET() {
  try {
    // Try hitting cache first
    const cachedFoods = await redis.get('foods:all');
    if (cachedFoods) {
      console.log('Serving foods from Redis cache');
      return NextResponse.json(JSON.parse(cachedFoods));
    }

    await connectToDatabase();
    const foods = await FoodItem.find({}).sort({ createdAt: -1 });

    // Store in cache for 1 hour (3600 seconds)
    await redis.setex('foods:all', 3600, JSON.stringify(foods));
    
    console.log('Serving foods from MongoDB');
    return NextResponse.json(foods);
  } catch (error) {
    console.error('Error fetching foods:', error);
    return NextResponse.json({ error: 'Failed to fetch food items' }, { status: 500 });
  }
}
