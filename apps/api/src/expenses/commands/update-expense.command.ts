import type { UpdateExpenseDto } from '../dto/update-expense.dto';

export class UpdateExpenseCommand {
  constructor(
    public readonly userId: string,
    public readonly id: string,
    public readonly dto: UpdateExpenseDto,
  ) {}
}
