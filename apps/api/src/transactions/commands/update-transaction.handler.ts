import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateTransactionCommand } from './update-transaction.command';
import { TransactionsRepository } from '../transactions.repository';

@CommandHandler(UpdateTransactionCommand)
export class UpdateTransactionHandler implements ICommandHandler<UpdateTransactionCommand> {
  constructor(private readonly repo: TransactionsRepository) {}

  execute(command: UpdateTransactionCommand) {
    return this.repo.updateByUser(command.userId, command.id, command.dto);
  }
}
