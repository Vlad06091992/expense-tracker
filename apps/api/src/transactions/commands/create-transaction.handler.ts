import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTransactionCommand } from './create-transaction.command';
import { TransactionsRepository } from '../transactions.repository';

@CommandHandler(CreateTransactionCommand)
export class CreateTransactionHandler implements ICommandHandler<CreateTransactionCommand> {
  constructor(private readonly repo: TransactionsRepository) {}

  execute(command: CreateTransactionCommand) {
    return this.repo.create(command.userId, command.dto);
  }
}
