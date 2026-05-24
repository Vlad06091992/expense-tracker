'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { TransactionDto } from '@repo/shared-types';

import { useCategories } from '@/entities/category';
import { useCreateTransaction, useUpdateTransaction } from '../model/mutations';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';

import { transactionFormSchema, type TransactionFormValues } from '../model/schema';

const NO_CATEGORY = 'none';

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: TransactionDto;
}

function defaultValues(transaction?: TransactionDto): TransactionFormValues {
  if (transaction) {
    return {
      amount: Number(transaction.amount),
      type: transaction.type,
      date: transaction.date.slice(0, 10),
      description: transaction.description ?? '',
      categoryId: transaction.categoryId ?? NO_CATEGORY,
    };
  }
  return {
    amount: 0,
    type: 'EXPENSE',
    date: new Date().toISOString().slice(0, 10),
    description: '',
    categoryId: NO_CATEGORY,
  };
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  transaction,
}: TransactionFormDialogProps) {
  const isEdit = Boolean(transaction);
  const { data: categories } = useCategories();
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: defaultValues(transaction),
  });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues(transaction));
    }
  }, [open, transaction, form]);

  async function onSubmit(values: TransactionFormValues) {
    const payload = {
      amount: values.amount,
      type: values.type,
      date: new Date(values.date).toISOString(),
      description: values.description?.trim() ? values.description.trim() : undefined,
      categoryId:
        values.categoryId && values.categoryId !== NO_CATEGORY
          ? values.categoryId
          : undefined,
    };

    try {
      if (transaction) {
        await updateMutation.mutateAsync({ id: transaction.id, input: payload });
        toast.success('Транзакция обновлена');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Транзакция создана');
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось сохранить');
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Редактировать транзакцию' : 'Новая транзакция'}
          </DialogTitle>
          <DialogDescription>
            Заполните данные операции и сохраните изменения.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="EXPENSE">Расход</SelectItem>
                      <SelectItem value="INCOME">Доход</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Сумма</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Дата</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Категория</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Без категории" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NO_CATEGORY}>Без категории</SelectItem>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Input placeholder="Необязательно" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Сохранение…' : 'Сохранить'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
