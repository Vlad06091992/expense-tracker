import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { CreateUserHandler } from './commands/create-user.handler';
import { FindUserByEmailHandler } from './queries/find-user-by-email.handler';
import { FindUserByIdHandler } from './queries/find-user-by-id.handler';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';

const handlers = [CreateUserHandler, FindUserByEmailHandler, FindUserByIdHandler];

@Module({
  imports: [CqrsModule],
  controllers: [UsersController],
  providers: [UsersRepository, ...handlers],
})
export class UsersModule {}
