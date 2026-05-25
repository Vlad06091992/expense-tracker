'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { CategoryDto } from '@repo/shared-types';

import { CategoryItem, useCategories } from '@/entities/category';
import { CategoryFormDialog, useDeleteCategory } from '@/features/category-form';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';

export function CategoriesPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryDto | undefined>(undefined);

  const { data, isLoading, isError } = useCategories();
  const deleteMutation = useDeleteCategory();

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(category: CategoryDto) {
    setEditing(category);
    setFormOpen(true);
  }

  async function handleDelete(category: CategoryDto) {
    if (!window.confirm(`Удалить категорию «${category.name}»?`)) return;
    try {
      await deleteMutation.mutateAsync(category.id);
      toast.success('Категория удалена');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось удалить');
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Категории</h1>
          <p className="mt-1 text-sm text-slate-500">Управление категориями расходов</p>
        </div>
        <Button onClick={openCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Добавить
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] w-full rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <p className="py-12 text-center text-sm text-slate-400">Не удалось загрузить категории</p>
      ) : !data || data.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-400">Категорий пока нет</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              actions={
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(category)}>
                    Изменить
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => handleDelete(category)}
                  >
                    Удалить
                  </Button>
                </div>
              }
            />
          ))}
        </div>
      )}

      <CategoryFormDialog open={formOpen} onOpenChange={setFormOpen} category={editing} />
    </div>
  );
}
