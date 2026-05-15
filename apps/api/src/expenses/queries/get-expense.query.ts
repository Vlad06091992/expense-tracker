export class GetExpenseQuery {
  constructor(
    public readonly userId: string,
    public readonly id: string,
  ) {}
}
