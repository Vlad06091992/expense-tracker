'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { CategoryDto } from '@repo/shared-types';

import { useCreateCategory, useUpdateCategory } from '../model/mutations';
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

import { categoryFormSchema, type CategoryFormValues } from '../model/schema';

const DEFAULT_COLOR = '#64748b';

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: CategoryDto;
}

function defaultValues(category?: CategoryDto): CategoryFormValues {
  return {
    name: category?.name ?? '',
    color: category?.color ?? DEFAULT_COLOR,
    icon: category?.icon ?? '',
  };
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
}: CategoryFormDialogProps) {
  const isEdit = Boolean(category);
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: defaultValues(category),
  });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues(category));
    }
  }, [open, category, form]);

  async function onSubmit(values: CategoryFormValues) {
    const payload = {
      name: values.name.trim(),
      color: values.color ? values.color : undefined,
      icon: values.icon?.trim() ? values.icon.trim() : undefined,
    };

    try {
      if (category) {
        await updateMutation.mutateAsync({ id: category.id, input: payload });
        toast.success('Категория обновлена');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Категория создана');
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
            {isEdit ? 'Редактировать категорию' : 'Новая категория'}
          </DialogTitle>
          <DialogDescription>
            Укажите название, цвет и иконку категории.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название</FormLabel>
                  <FormControl>
                    <Input placeholder="Например, Продукты" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Цвет</FormLabel>
                  <FormControl>
                    <Input type="color" className="h-10 w-20 p-1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Иконка</FormLabel>
                  <FormControl>
                    <Input placeholder="Эмодзи, необязательно" {...field} />
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
