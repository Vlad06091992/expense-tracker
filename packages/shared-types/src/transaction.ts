export type TransactionType = 'INCOME' | 'EXPENSE';

export interface TransactionDto {
  id: string;
  amount: string;
  type: TransactionType;
  description: string | null;
  date: string;
  userId: string;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionInput {
  amount: number;
  type: TransactionType;
  description?: string;
  date: string;
  categoryId?: string;
}

export type UpdateTransactionInput = Partial<CreateTransactionInput>;

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TransactionListResponse {
  items: TransactionDto[];
  summary: TransactionSummary;
  meta: PaginationMeta;
}
