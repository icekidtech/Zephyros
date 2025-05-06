import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
<<<<<<< HEAD

export type UserDocument = User & Document;

export enum UserRole {
  ADMIN = 'admin',
  ORGANIZATION = 'organization',
  VERIFIER = 'verifier',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
=======
import { UserRoles } from './userRoles.enum';

@Schema({ timestamps: true })
export class User extends Document {

  @Prop({ required: true, unique: true, index: true })
>>>>>>> 2488104ed40c7a73a626b5f4059bc8ee7fd7615f
  email: string;

  @Prop({ required: true })
  password: string;

<<<<<<< HEAD
  @Prop({ enum: UserRole, required: true })
  role: UserRole;
=======
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
>>>>>>> 2488104ed40c7a73a626b5f4059bc8ee7fd7615f
}

export const UserSchema = SchemaFactory.createForClass(User);
