export class DeleteExpenseCommand {
  constructor(
    public readonly userId: string,
    public readonly id: string,
  ) {}
}
