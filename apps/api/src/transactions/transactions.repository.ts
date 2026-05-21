import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TransactionType } from '@repo/database';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

export interface PeriodFilter {
  month?: number;
  year?: number;
}

@Injectable()
export class TransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private buildDateFilter({ month, year }: PeriodFilter): Prisma.DateTimeFilter | undefined {
    if (year && month) {
      const start = new Date(Date.UTC(year, month - 1, 1));
      const end = new Date(Date.UTC(year, month, 1));
      return { gte: start, lt: end };
    }
    if (year) {
      const start = new Date(Date.UTC(year, 0, 1));
      const end = new Date(Date.UTC(year + 1, 0, 1));
      return { gte: start, lt: end };
    }
    return undefined;
  }

  findAllByUser(userId: string, period: PeriodFilter) {
    const date = this.buildDateFilter(period);
    return this.prisma.transaction.findMany({
      where: { userId, ...(date ? { date } : {}) },
      orderBy: { date: 'desc' },
    });
  }

  async findOneByUser(userId: string, id: string) {
    const transaction = await this.prisma.transaction.findFirst({ where: { id, userId } });
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }

  create(userId: string, dto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        amount: dto.amount,
        type: dto.type,
        description: dto.description,
        date: new Date(dto.date),
        categoryId: dto.categoryId,
        userId,
      },
    });
  }

  async updateByUser(userId: string, id: string, dto: UpdateTransactionDto) {
    await this.findOneByUser(userId, id);
    const { date, ...rest } = dto;
    return this.prisma.transaction.update({
      where: { id },
      data: { ...rest, ...(date ? { date: new Date(date) } : {}) },
    });
  }

  async removeByUser(userId: string, id: string) {
    await this.findOneByUser(userId, id);
    return this.prisma.transaction.delete({ where: { id } });
  }

  async aggregateByUser(userId: string, period: PeriodFilter) {
    const date = this.buildDateFilter(period);
    const where = { userId, ...(date ? { date } : {}) };

    const [incomeAgg, expenseAgg] = await Promise.all([
      this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { ...where, type: TransactionType.INCOME },
      }),
      this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { ...where, type: TransactionType.EXPENSE },
      }),
    ]);

    const totalIncome = incomeAgg._sum.amount?.toNumber() ?? 0;
    const totalExpense = expenseAgg._sum.amount?.toNumber() ?? 0;

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }
}
