import type { CreateExpenseDto } from '../dto/create-expense.dto';

export class CreateExpenseCommand {
  constructor(
    public readonly userId: string,
    public readonly dto: CreateExpenseDto,
  ) {}
}
