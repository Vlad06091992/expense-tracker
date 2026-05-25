/** Команда удаления транзакции. */
export class DeleteTransactionCommand {
  /**
   * @param userId - Идентификатор пользователя-владельца.
   * @param id - UUID транзакции для удаления.
   */
  constructor(
    public readonly userId: string,
    public readonly id: string,
  ) {}
}
