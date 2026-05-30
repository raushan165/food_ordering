import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerName, customerAddress, items, totalAmount } = body;

    if (!customerName || !customerAddress || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required order fields' }, { status: 400 });
    }

    await connectToDatabase();

    const newOrder = new Order({
      customerName,
      customerAddress,
      items,
      totalAmount,
    });

    await newOrder.save();

    return NextResponse.json({ message: 'Order created successfully', orderId: newOrder._id }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
