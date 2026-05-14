export interface ExpenseDto {
  id: string;
  amount: string;
  currency: string;
  description: string | null;
  spentAt: string;
  userId: string;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseInput {
  amount: number | string;
  currency?: string;
  description?: string;
  spentAt?: string;
  categoryId?: string;
}

export type UpdateExpenseInput = Partial<CreateExpenseInput>;

export interface ExpenseFilters {
  from?: string;
  to?: string;
  categoryId?: string;
}
