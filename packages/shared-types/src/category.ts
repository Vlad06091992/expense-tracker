export interface CategoryDto {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryInput {
  name: string;
  color?: string;
  icon?: string;
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>;
