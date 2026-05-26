import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { CategoriesRepository } from '../categories.repository';

import { GetCategoryQuery } from './get-category.query';

@QueryHandler(GetCategoryQuery)
export class GetCategoryHandler implements IQueryHandler<GetCategoryQuery> {
  constructor(private readonly repo: CategoriesRepository) {}

  execute(query: GetCategoryQuery) {
    return this.repo.findOneByUser(query.userId, query.id);
  }
}
