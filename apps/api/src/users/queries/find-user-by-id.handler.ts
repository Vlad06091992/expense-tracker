import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { User } from '@repo/database/src/index';

import { UsersRepository } from '../users.repository';
import { FindUserByIdQuery } from './find-user-by-id.query';

@QueryHandler(FindUserByIdQuery)
export class FindUserByIdHandler implements IQueryHandler<FindUserByIdQuery, User | null> {
  constructor(private readonly usersRepository: UsersRepository) {}

  execute(query: FindUserByIdQuery): Promise<User | null> {
    return this.usersRepository.findById(query.id);
  }
}
