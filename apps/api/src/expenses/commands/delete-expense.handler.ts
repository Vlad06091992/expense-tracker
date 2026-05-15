import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

import { ExpensesRepository } from '../expenses.repository';
import { DeleteExpenseCommand } from './delete-expense.command';

@CommandHandler(DeleteExpenseCommand)
export class DeleteExpenseHandler implements ICommandHandler<DeleteExpenseCommand> {
  constructor(private readonly repo: ExpensesRepository) {}

  async execute(command: DeleteExpenseCommand) {
    const result = await this.repo.removeByUser(command.userId, command.id);
    if (result.count === 0) {
      throw new NotFoundException('Expense not found');
    }
    return result;
  }
}
