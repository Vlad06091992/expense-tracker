import type { UpdateCategoryDto } from '../dto/update-category.dto';

export class UpdateCategoryCommand {
  constructor(
    public readonly userId: string,
    public readonly id: string,
    public readonly dto: UpdateCategoryDto,
  ) {}
}
