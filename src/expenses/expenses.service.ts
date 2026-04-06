import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ExpenseRecord, ExpenseDocument } from './schemas/expense.schema';
import { SyncDto } from './dto/sync.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(ExpenseRecord.name)
    private expenseModel: Model<ExpenseDocument>,
  ) {}

  async findAllByUser(userId: string) {
    const docs = await this.expenseModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ date: -1, createdAt: -1 })
      .lean()
      .exec();
    return docs.map(d => this.toClient(d));
  }

  async sync(userId: string, dto: SyncDto) {
    const uid = new Types.ObjectId(userId);
    const synced: string[] = [];

    for (const op of dto.operations) {
      try {
        if (op.type === 'create' && op.data) {
          await this.expenseModel.findOneAndUpdate(
            { userId: uid, clientId: op.clientId },
            { userId: uid, ...op.data },
            { upsert: true, new: true },
          );
          synced.push(op.opId);
        } else if (op.type === 'update' && op.data) {
          await this.expenseModel.findOneAndUpdate(
            { userId: uid, clientId: op.clientId },
            { ...op.data },
          );
          synced.push(op.opId);
        } else if (op.type === 'delete') {
          await this.expenseModel.findOneAndDelete({
            userId: uid,
            clientId: op.clientId,
          });
          synced.push(op.opId);
        }
      } catch {
        // skip failed ops — will retry next sync
      }
    }

    const expenses = await this.findAllByUser(userId);
    return { synced, expenses };
  }

  private toClient(doc: any) {
    return {
      id: doc.clientId,
      type: doc.type,
      title: doc.title,
      amount: doc.amount,
      category: doc.category,
      date: doc.date,
      paymentMethod: doc.paymentMethod,
      notes: doc.notes ?? '',
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
