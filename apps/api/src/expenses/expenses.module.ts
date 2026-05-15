import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

import { ExpensesController } from './expenses.controller';
import { ExpensesRepository } from './expenses.repository';
import { ListExpensesHandler } from './queries/list-expenses.handler';
import { GetExpenseHandler } from './queries/get-expense.handler';
import { CreateExpenseHandler } from './commands/create-expense.handler';
import { UpdateExpenseHandler } from './commands/update-expense.handler';
import { DeleteExpenseHandler } from './commands/delete-expense.handler';

const handlers = [
  ListExpensesHandler,
  GetExpenseHandler,
  CreateExpenseHandler,
  UpdateExpenseHandler,
  DeleteExpenseHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [ExpensesController],
  providers: [ExpensesRepository, ...handlers],
})
export class ExpensesModule {}
