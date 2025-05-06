import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRoles } from './userRoles.enum';

@Schema({ timestamps: true })
export class User extends Document {

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: Object.values(UserRoles), default: UserRoles.Organization })
  role: UserRoles;

  @Prop()
  name?: string;

  @Prop()
  organizationId?: string; // Optional: links user to an organization if needed

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isVerified: boolean; // Useful for email verification or admin approval
}

export const UserSchema = SchemaFactory.createForClass(User);
