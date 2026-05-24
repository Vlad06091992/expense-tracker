import { z } from 'zod';

export const categoryFormSchema = z.object({
  name: z.string().min(1, 'Введите название'),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Цвет в формате #RRGGBB')
    .optional()
    .or(z.literal('')),
  icon: z.string().max(8, 'Слишком длинная иконка').optional(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
