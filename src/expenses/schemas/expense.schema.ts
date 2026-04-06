import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExpenseDocument = ExpenseRecord & Document;

@Schema()
export class ExpenseRecord {
  @Prop({ required: true, index: true })
  clientId: string; // UUID generated on the frontend

  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: ['expense', 'income'] })
  type: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  paymentMethod: string;

  @Prop({ default: '' })
  notes: string;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ required: true })
  updatedAt: string;
}

export const ExpenseSchema = SchemaFactory.createForClass(ExpenseRecord);
ExpenseSchema.index({ userId: 1, clientId: 1 }, { unique: true });
