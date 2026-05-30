import mongoose, { Schema, Document } from 'mongoose';

export interface IFoodItem extends Document {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

const FoodItemSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  category: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.FoodItem || mongoose.model<IFoodItem>('FoodItem', FoodItemSchema);
