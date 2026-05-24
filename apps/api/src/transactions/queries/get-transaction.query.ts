/** Запрос одной транзакции по идентификатору. */
export class GetTransactionQuery {
  /**
   * @param userId - Идентификатор пользователя-владельца.
   * @param id - UUID транзакции.
   */
  constructor(
    public readonly userId: string,
    public readonly id: string,
  ) {}
}
