import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ExpensesRepository } from '../expenses.repository';
import { CreateExpenseCommand } from './create-expense.command';

@CommandHandler(CreateExpenseCommand)
export class CreateExpenseHandler implements ICommandHandler<CreateExpenseCommand> {
  constructor(private readonly repo: ExpensesRepository) {}

  execute(command: CreateExpenseCommand) {
    const { dto, userId } = command;
    return this.repo.create(userId, {
      amount: dto.amount,
      currency: dto.currency ?? 'USD',
      description: dto.description,
      spentAt: dto.spentAt ? new Date(dto.spentAt) : new Date(),
      categoryId: dto.categoryId,
    });
  }
}
