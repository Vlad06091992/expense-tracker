import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTransactionQuery } from './get-transaction.query';
import { TransactionsRepository } from '../transactions.repository';

@QueryHandler(GetTransactionQuery)
export class GetTransactionHandler implements IQueryHandler<GetTransactionQuery> {
  constructor(private readonly repo: TransactionsRepository) {}

  execute(query: GetTransactionQuery) {
    return this.repo.findOneByUser(query.userId, query.id);
  }
}
