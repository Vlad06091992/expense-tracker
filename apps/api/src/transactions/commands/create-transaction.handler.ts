import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TransactionsRepository } from '../transactions.repository';

import { CreateTransactionCommand } from './create-transaction.command';

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
