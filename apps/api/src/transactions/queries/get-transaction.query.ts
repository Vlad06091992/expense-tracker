export class GetTransactionQuery {
  constructor(
    public readonly userId: string,
    public readonly id: string,
  ) {}
}
