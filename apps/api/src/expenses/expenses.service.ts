import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import type { CreateExpenseDto } from './dto/create-expense.dto';
import type { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.expense.findMany({
      where: { userId },
      orderBy: { spentAt: 'desc' },
    });
  }

  findOne(userId: string, id: string) {
    return this.prisma.expense.findFirst({ where: { id, userId } });
  }

  create(userId: string, dto: CreateExpenseDto) {
    return this.prisma.expense.create({
      data: {
        userId,
        amount: dto.amount,
        currency: dto.currency ?? 'USD',
        description: dto.description,
        spentAt: dto.spentAt ? new Date(dto.spentAt) : undefined,
        categoryId: dto.categoryId,
      },
    });
  }

  update(userId: string, id: string, dto: UpdateExpenseDto) {
    return this.prisma.expense.updateMany({
      where: { id, userId },
      data: {
        amount: dto.amount,
        currency: dto.currency,
        description: dto.description,
        spentAt: dto.spentAt ? new Date(dto.spentAt) : undefined,
        categoryId: dto.categoryId,
      },
    });
  }

  remove(userId: string, id: string) {
    return this.prisma.expense.deleteMany({ where: { id, userId } });
  }
}
