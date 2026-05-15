import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { User } from '@repo/database/src/index';

import { UsersService } from '../users.service';
import { FindUserByIdQuery } from './find-user-by-id.query';

@QueryHandler(FindUserByIdQuery)
export class FindUserByIdHandler implements IQueryHandler<FindUserByIdQuery, User | null> {
  constructor(private readonly usersService: UsersService) {}

  execute(query: FindUserByIdQuery): Promise<User | null> {
    return this.usersService.findById(query.id);
  }
}
