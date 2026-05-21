import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TransactionsController } from './transactions.controller';
import { TransactionsRepository } from './transactions.repository';
import { CreateTransactionHandler } from './commands/create-transaction.handler';
import { UpdateTransactionHandler } from './commands/update-transaction.handler';
import { DeleteTransactionHandler } from './commands/delete-transaction.handler';
import { ListTransactionsHandler } from './queries/list-transactions.handler';
import { GetTransactionHandler } from './queries/get-transaction.handler';

const CommandHandlers = [
  CreateTransactionHandler,
  UpdateTransactionHandler,
  DeleteTransactionHandler,
];
const QueryHandlers = [ListTransactionsHandler, GetTransactionHandler];

@Module({
  imports: [CqrsModule],
  controllers: [TransactionsController],
  providers: [TransactionsRepository, ...CommandHandlers, ...QueryHandlers],
})
export class TransactionsModule {}
