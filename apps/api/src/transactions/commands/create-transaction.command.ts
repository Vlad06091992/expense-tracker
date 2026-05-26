import type { CreateTransactionDto } from '../dto/create-transaction.dto';

/** Команда создания новой транзакции. */
export class CreateTransactionCommand {
  /**
   * @param userId - Идентификатор пользователя-владельца.
   * @param dto - Данные новой транзакции.
   */
  constructor(
    public readonly userId: string,
    public readonly dto: CreateTransactionDto,
  ) {}
}
