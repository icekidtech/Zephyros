// Initial implementation for MilestoneSchema
import { Schema } from 'mongoose';

export const MilestoneSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
});