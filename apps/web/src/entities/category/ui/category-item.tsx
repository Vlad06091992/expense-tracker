import type { CategoryDto } from '@repo/shared-types';
import type { ReactNode } from 'react';

interface CategoryItemProps {
  category: CategoryDto;
  actions?: ReactNode;
}

export function CategoryItem({ category, actions }: CategoryItemProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5 transition-shadow hover:shadow-md">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base"
          style={category.color ? { backgroundColor: category.color } : { backgroundColor: '#F1F5F9' }}
        >
          {category.icon || '•'}
        </span>
        <span className="truncate text-sm font-medium text-slate-800">{category.name}</span>
      </div>
      {actions}
    </div>
  );
}
