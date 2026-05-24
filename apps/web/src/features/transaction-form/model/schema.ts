import { z } from 'zod';

export const transactionFormSchema = z.object({
  amount: z.coerce.number().positive('Сумма должна быть больше 0'),
  type: z.enum(['INCOME', 'EXPENSE']),
  date: z.string().min(1, 'Укажите дату'),
  description: z.string().max(500, 'Не более 500 символов').optional(),
  categoryId: z.string().optional(),
});

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;
