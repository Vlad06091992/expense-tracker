import type { CategoryDto, CreateCategoryInput, UpdateCategoryInput } from '@repo/shared-types';

import { apiFetch } from '@/shared/api/http-client';

export function listCategories(): Promise<CategoryDto[]> {
  return apiFetch<CategoryDto[]>('/categories');
}

export function createCategory(input: CreateCategoryInput): Promise<CategoryDto> {
  return apiFetch<CategoryDto>('/categories', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateCategory(id: string, input: UpdateCategoryInput): Promise<CategoryDto> {
  return apiFetch<CategoryDto>(`/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteCategory(id: string): Promise<void> {
  return apiFetch<void>(`/categories/${id}`, { method: 'DELETE' });
}
