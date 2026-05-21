import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListTransactionsQuery } from './list-transactions.query';
import { TransactionsRepository } from '../transactions.repository';

@QueryHandler(ListTransactionsQuery)
export class ListTransactionsHandler implements IQueryHandler<ListTransactionsQuery> {
  constructor(private readonly repo: TransactionsRepository) {}

  async execute(query: ListTransactionsQuery) {
    const [items, summary] = await Promise.all([
      this.repo.findAllByUser(query.userId, query.period),
      this.repo.aggregateByUser(query.userId, query.period),
    ]);
    return { items, summary };
  }
}
