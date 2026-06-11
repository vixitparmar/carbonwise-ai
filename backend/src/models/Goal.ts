import mongoose, { Schema } from 'mongoose';

const GoalSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true, enum: ['weekly', 'monthly'] },
    category: { type: String, required: true, default: 'overall' }, // e.g. travel, electricity, overall
    targetEmissions: { type: Number, required: true }, // target in kg CO2
    currentEmissions: { type: Number, default: 0 }, // progress in kg CO2
    startDate: { type: String, required: true }, // YYYY-MM-DD
    endDate: { type: String, required: true }, // YYYY-MM-DD
    status: { type: String, required: true, enum: ['active', 'achieved', 'failed'], default: 'active' }
  },
  { timestamps: true }
);

export const GoalModel = mongoose.models.Goal || mongoose.model('Goal', GoalSchema);
