import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    carbonGoal: { type: Number, default: 500 }, // Monthly limit in kg CO2
    greenCoins: { type: Number, default: 100 },
    streak: { type: Number, default: 0 },
    lastLoggedDate: { type: String, default: '' }, // YYYY-MM-DD
    badges: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
