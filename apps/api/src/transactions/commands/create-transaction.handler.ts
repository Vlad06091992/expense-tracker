import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTransactionCommand } from './create-transaction.command';
import { TransactionsRepository } from '../transactions.repository';

/** Обработчик команды {@link CreateTransactionCommand}. */
@CommandHandler(CreateTransactionCommand)
export class CreateTransactionHandler implements ICommandHandler<CreateTransactionCommand> {
  constructor(private readonly repo: TransactionsRepository) {}

  /**
   * Создаёт транзакцию через репозиторий.
   *
   * @param command - Команда с `userId` и DTO новой транзакции.
   * @returns Созданная транзакция.
   */
  execute(command: CreateTransactionCommand) {
    return this.repo.create(command.userId, command.dto);
  }
}
