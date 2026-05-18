export class GetCategoryQuery {
  constructor(
    public readonly userId: string,
    public readonly id: string,
  ) {}
}
