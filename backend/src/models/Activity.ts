import mongoose, { Schema } from 'mongoose';

const ActivitySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    type: {
      type: String,
      required: true,
      enum: [
        'travel',
        'food',
        'electricity',
        'shopping',
        'waste',
        'water',
        'flight',
        'public_transport',
        'cycling',
        'walking'
      ]
    },
    value: { type: Number, required: true }, // quantity (km, kWh, liters, etc.)
    carbonEmissions: { type: Number, required: true }, // calculated in kg CO2
    details: { type: Schema.Types.Mixed, default: {} } // metadata (e.g. vehicle type, food type, etc.)
  },
  { timestamps: true }
);

export const ActivityModel = mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);
