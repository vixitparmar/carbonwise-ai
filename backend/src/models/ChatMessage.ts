import mongoose, { Schema } from 'mongoose';

const ChatMessageSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, required: true, enum: ['user', 'assistant'] },
    content: { type: String, required: true }
  },
  { timestamps: true }
);

export const ChatMessageModel =
  mongoose.models.ChatMessage || mongoose.model('ChatMessage', ChatMessageSchema);
