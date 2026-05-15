import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

import { ExpensesRepository } from '../expenses.repository';
import { UpdateExpenseCommand } from './update-expense.command';

@CommandHandler(UpdateExpenseCommand)
export class UpdateExpenseHandler implements ICommandHandler<UpdateExpenseCommand> {
  constructor(private readonly repo: ExpensesRepository) {}

  async execute(command: UpdateExpenseCommand) {
    const { dto, userId, id } = command;
    const result = await this.repo.updateByUser(userId, id, {
      amount: dto.amount,
      currency: dto.currency,
      description: dto.description,
      spentAt: dto.spentAt ? new Date(dto.spentAt) : undefined,
      categoryId: dto.categoryId,
    });
    if (result.count === 0) {
      throw new NotFoundException('Expense not found');
    }
    return result;
  }
}
