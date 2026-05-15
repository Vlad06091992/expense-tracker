import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/database/src/index';

import { PrismaService } from '../prisma/prisma.service';

type ExpenseCreateData = {
  amount: number;
  currency: string;
  description?: string;
  spentAt?: Date;
  categoryId?: string;
};

type ExpenseUpdateData = Partial<ExpenseCreateData>;

@Injectable()
export class ExpensesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllByUser(userId: string) {
    return this.prisma.expense.findMany({
      where: { userId },
      orderBy: { spentAt: 'desc' },
    });
  }

  findOneByUser(userId: string, id: string) {
    return this.prisma.expense.findFirst({ where: { id, userId } });
  }

  create(userId: string, data: ExpenseCreateData) {
    return this.prisma.expense.create({
      data: { userId, ...data },
    });
  }

  updateByUser(userId: string, id: string, data: ExpenseUpdateData) {
    return this.prisma.expense.updateMany({
      where: { id, userId },
      data,
    });
  }

  removeByUser(userId: string, id: string) {
    return this.prisma.expense.deleteMany({ where: { id, userId } });
  }
}
