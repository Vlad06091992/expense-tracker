import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { CategoriesController } from './categories.controller';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryHandler } from './commands/create-category.handler';
import { DeleteCategoryHandler } from './commands/delete-category.handler';
import { UpdateCategoryHandler } from './commands/update-category.handler';
import { GetCategoryHandler } from './queries/get-category.handler';
import { ListCategoriesHandler } from './queries/list-categories.handler';

const CommandHandlers = [CreateCategoryHandler, UpdateCategoryHandler, DeleteCategoryHandler];
const QueryHandlers = [ListCategoriesHandler, GetCategoryHandler];

@Module({
  imports: [CqrsModule],
  controllers: [CategoriesController],
  providers: [CategoriesRepository, ...CommandHandlers, ...QueryHandlers],
})
export class CategoriesModule {}
