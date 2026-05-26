import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TransactionsRepository } from '../transactions.repository';

import { UpdateTransactionCommand } from './update-transaction.command';

/** Обработчик команды {@link UpdateTransactionCommand}. */
@CommandHandler(UpdateTransactionCommand)
export class UpdateTransactionHandler implements ICommandHandler<UpdateTransactionCommand> {
  constructor(private readonly repo: TransactionsRepository) {}

  /**
   * Обновляет транзакцию через репозиторий.
   *
   * @param command - Команда с `userId`, `id` транзакции и DTO обновления.
   * @returns Обновлённая транзакция.
   * @throws {NotFoundException} Если транзакция не найдена или принадлежит другому пользователю.
   */
  execute(command: UpdateTransactionCommand) {
    return this.repo.updateByUser(command.userId, command.id, command.dto);
  }
}
