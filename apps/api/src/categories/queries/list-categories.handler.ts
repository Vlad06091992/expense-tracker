import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { CategoriesRepository } from '../categories.repository';

import { ListCategoriesQuery } from './list-categories.query';

@QueryHandler(ListCategoriesQuery)
export class ListCategoriesHandler implements IQueryHandler<ListCategoriesQuery> {
  constructor(private readonly repo: CategoriesRepository) {}

  execute(query: ListCategoriesQuery) {
    return this.repo.findAllByUser(query.userId);
  }
}
