'use client';

import { useQuery } from '@tanstack/react-query';

import { listCategories } from '../api/category.api';

export const categoryKeys = {
  all: ['categories'] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: listCategories,
  });
}
