import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCategoryCommand } from './create-category.command';
import { CategoriesRepository } from '../categories.repository';

@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler implements ICommandHandler<CreateCategoryCommand> {
  constructor(private readonly repo: CategoriesRepository) {}

  execute(command: CreateCategoryCommand) {
    return this.repo.create(command.userId, command.dto);
  }
}
