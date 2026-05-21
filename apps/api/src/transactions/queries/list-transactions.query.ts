import { PeriodFilter } from '../transactions.repository';

export class ListTransactionsQuery {
  constructor(
    public readonly userId: string,
    public readonly period: PeriodFilter,
  ) {}
}
