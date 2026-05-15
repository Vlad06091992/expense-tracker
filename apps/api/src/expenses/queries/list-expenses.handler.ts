import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ExpensesRepository } from '../expenses.repository';
import { ListExpensesQuery } from './list-expenses.query';

@QueryHandler(ListExpensesQuery)
export class ListExpensesHandler implements IQueryHandler<ListExpensesQuery> {
  constructor(private readonly repo: ExpensesRepository) {}

  execute(query: ListExpensesQuery) {
    return this.repo.findAllByUser(query.userId);
  }
}
