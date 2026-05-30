import mongoose, { Schema, Document } from 'mongoose';

interface IOrderItem {
  foodItemId: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  customerName: string;
  customerAddress: string;
  items: IOrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'delivered';
}

const OrderItemSchema: Schema = new Schema({
  foodItemId: { type: Schema.Types.ObjectId, ref: 'FoodItem', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
});

const OrderSchema: Schema = new Schema({
  customerName: { type: String, required: true },
  customerAddress: { type: String, required: true },
  items: { type: [OrderItemSchema], required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'preparing', 'delivered'], default: 'pending' }
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
