import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TransactionsRepository } from '../transactions.repository';

import { DeleteTransactionCommand } from './delete-transaction.command';

/** Обработчик команды {@link DeleteTransactionCommand}. */
@CommandHandler(DeleteTransactionCommand)
export class DeleteTransactionHandler implements ICommandHandler<DeleteTransactionCommand> {
  constructor(private readonly repo: TransactionsRepository) {}

  /**
   * Удаляет транзакцию через репозиторий.
   *
   * @param command - Команда с `userId` и `id` транзакции.
   * @returns Удалённая транзакция.
   * @throws {NotFoundException} Если транзакция не найдена или принадлежит другому пользователю.
   */
  execute(command: DeleteTransactionCommand) {
    return this.repo.removeByUser(command.userId, command.id);
  }
}
