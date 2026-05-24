import { PeriodFilter } from '../transactions.repository';

/** Параметры пагинации в терминах страниц (page/limit), до конвертации в skip/take). */
export interface PaginationInput {
  /** Номер страницы (начиная с 1). */
  page: number;
  /** Количество записей на странице. */
  limit: number;
}

/** Запрос постраничного списка транзакций пользователя. */
export class ListTransactionsQuery {
  /**
   * @param userId - Идентификатор пользователя-владельца.
   * @param period - Фильтр по периоду (год и/или месяц).
   * @param pagination - Параметры пагинации (страница и лимит).
   */
  constructor(
    public readonly userId: string,
    public readonly period: PeriodFilter,
    public readonly pagination: PaginationInput,
  ) {}
}
