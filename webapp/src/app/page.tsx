import Image from "next/image";
import connectToDatabase from '@/lib/mongodb';
import FoodItem from '@/models/FoodItem';
import FoodCard from '@/components/FoodCard';
import redis from '@/lib/redis';

export const revalidate = 0; // Disable cache for this page so it's always fresh in dev/prod unless explicitly cached

async function getFoods() {
  try {
    // Try hitting cache first
    const cachedFoods = await redis.get('foods:all');
    if (cachedFoods) {
      return JSON.parse(cachedFoods);
    }

    await connectToDatabase();
    const foods = await FoodItem.find({}).sort({ createdAt: -1 }).lean();
    
    // Serialize _id to string for Client Components
    const serializedFoods = foods.map(f => ({
      ...f,
      _id: f._id.toString(),
    }));

    await redis.setex('foods:all', 3600, JSON.stringify(serializedFoods));
    return serializedFoods;
  } catch (err) {
    console.error('Failed to load foods:', err);
    return [];
  }
}

export default async function Home() {
  const foods = await getFoods();

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '16px' }}>Delicious Food, Delivered Fast</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
          Explore our premium menu and treat yourself today.
        </p>
      </div>
      
      {foods.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>No food items available yet. Please run the seed API to populate.</p>
        </div>
      ) : (
        <div className="food-grid">
          {foods.map((food: any) => (
            <FoodCard key={food._id} food={food} />
          ))}
        </div>
      )}
    </div>
  );
}
