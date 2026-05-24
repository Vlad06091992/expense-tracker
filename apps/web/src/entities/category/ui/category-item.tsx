import type { ReactNode } from 'react';
import type { CategoryDto } from '@repo/shared-types';

interface CategoryItemProps {
  category: CategoryDto;
  actions?: ReactNode;
}

export function CategoryItem({ category, actions }: CategoryItemProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-base"
          style={category.color ? { backgroundColor: category.color } : undefined}
        >
          {category.icon || '•'}
        </span>
        <span className="truncate font-medium">{category.name}</span>
      </div>
      {actions}
    </div>
  );
}
