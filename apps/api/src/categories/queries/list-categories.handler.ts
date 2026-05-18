import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListCategoriesQuery } from './list-categories.query';
import { CategoriesRepository } from '../categories.repository';

@QueryHandler(ListCategoriesQuery)
export class ListCategoriesHandler implements IQueryHandler<ListCategoriesQuery> {
  constructor(private readonly repo: CategoriesRepository) {}

  execute(query: ListCategoriesQuery) {
    return this.repo.findAllByUser(query.userId);
  }
}
