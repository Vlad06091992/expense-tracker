import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateCategoryCommand } from './update-category.command';
import { CategoriesRepository } from '../categories.repository';

@CommandHandler(UpdateCategoryCommand)
export class UpdateCategoryHandler implements ICommandHandler<UpdateCategoryCommand> {
  constructor(private readonly repo: CategoriesRepository) {}

  execute(command: UpdateCategoryCommand) {
    return this.repo.updateByUser(command.userId, command.id, command.dto);
  }
}
