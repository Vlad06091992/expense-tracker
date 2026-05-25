import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListTransactionsQuery } from './list-transactions.query';
import { TransactionsRepository } from '../transactions.repository';

/** Обработчик запроса {@link ListTransactionsQuery}. */
@QueryHandler(ListTransactionsQuery)
export class ListTransactionsHandler implements IQueryHandler<ListTransactionsQuery> {
  constructor(private readonly repo: TransactionsRepository) {}

  /**
   * Выполняет три параллельных запроса к репозиторию:
   * список транзакций, агрегаты и общее количество.
   *
   * @param query - Запрос с `userId`, периодом и параметрами пагинации.
   * @returns Объект `{ items, summary, meta }`:
   *   - `items` — массив транзакций текущей страницы;
   *   - `summary` — `{ totalIncome, totalExpense, balance }`;
   *   - `meta` — `{ page, limit, total, totalPages }`.
   */
  async execute(query: ListTransactionsQuery) {
    const { page, limit } = query.pagination;
    const skip = (page - 1) * limit;

    const [items, summary, total] = await Promise.all([
      this.repo.findAllByUser(query.userId, query.period, { skip, take: limit }),
      this.repo.aggregateByUser(query.userId, query.period),
      this.repo.countByUser(query.userId, query.period),
    ]);

    return {
      items,
      summary,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }
}
