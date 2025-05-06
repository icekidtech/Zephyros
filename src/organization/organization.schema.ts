import { Schema } from 'mongoose';

export const OrganizationSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});