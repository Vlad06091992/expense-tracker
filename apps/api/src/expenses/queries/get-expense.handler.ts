import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

import { ExpensesRepository } from '../expenses.repository';
import { GetExpenseQuery } from './get-expense.query';

@QueryHandler(GetExpenseQuery)
export class GetExpenseHandler implements IQueryHandler<GetExpenseQuery> {
  constructor(private readonly repo: ExpensesRepository) {}

  async execute(query: GetExpenseQuery) {
    const expense = await this.repo.findOneByUser(query.userId, query.id);
    if (!expense) {
      throw new NotFoundException('Expense not found');
    }
    return expense;
  }
}
