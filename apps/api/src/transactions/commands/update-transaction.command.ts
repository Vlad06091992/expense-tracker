import type { UpdateTransactionDto } from '../dto/update-transaction.dto';

/** Команда частичного обновления транзакции. */
export class UpdateTransactionCommand {
  /**
   * @param userId - Идентификатор пользователя-владельца.
   * @param id - UUID транзакции для обновления.
   * @param dto - Поля для обновления (все опциональны).
   */
  constructor(
    public readonly userId: string,
    public readonly id: string,
    public readonly dto: UpdateTransactionDto,
  ) {}
}
