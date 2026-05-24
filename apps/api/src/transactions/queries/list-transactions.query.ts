import { PeriodFilter } from '../transactions.repository';

export interface PaginationInput {
  page: number;
  limit: number;
}

export class ListTransactionsQuery {
  constructor(
    public readonly userId: string,
    public readonly period: PeriodFilter,
    public readonly pagination: PaginationInput,
  ) {}
}
