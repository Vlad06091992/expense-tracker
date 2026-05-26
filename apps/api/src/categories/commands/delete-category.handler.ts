import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CategoriesRepository } from '../categories.repository';

import { DeleteCategoryCommand } from './delete-category.command';

@CommandHandler(DeleteCategoryCommand)
export class DeleteCategoryHandler implements ICommandHandler<DeleteCategoryCommand> {
  constructor(private readonly repo: CategoriesRepository) {}

  execute(command: DeleteCategoryCommand) {
    return this.repo.removeByUser(command.userId, command.id);
  }
}
