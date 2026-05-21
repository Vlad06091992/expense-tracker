import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteTransactionCommand } from './delete-transaction.command';
import { TransactionsRepository } from '../transactions.repository';

@CommandHandler(DeleteTransactionCommand)
export class DeleteTransactionHandler implements ICommandHandler<DeleteTransactionCommand> {
  constructor(private readonly repo: TransactionsRepository) {}

  execute(command: DeleteTransactionCommand) {
    return this.repo.removeByUser(command.userId, command.id);
  }
}
