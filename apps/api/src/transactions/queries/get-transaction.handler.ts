import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { TransactionsRepository } from '../transactions.repository';

import { GetTransactionQuery } from './get-transaction.query';

/** Обработчик запроса {@link GetTransactionQuery}. */
@QueryHandler(GetTransactionQuery)
export class GetTransactionHandler implements IQueryHandler<GetTransactionQuery> {
  constructor(private readonly repo: TransactionsRepository) {}

  /**
   * Возвращает одну транзакцию пользователя по UUID.
   *
   * @param query - Запрос с `userId` и `id` транзакции.
   * @returns Найденная транзакция.
   * @throws {NotFoundException} Если транзакция не найдена или принадлежит другому пользователю.
   */
  execute(query: GetTransactionQuery) {
    return this.repo.findOneByUser(query.userId, query.id);
  }
}
