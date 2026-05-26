import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { User } from '@repo/database/src/index';

import { UsersRepository } from '../users.repository';

import { CreateUserCommand } from './create-user.command';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand, User> {
  constructor(private readonly usersRepository: UsersRepository) {}

  execute(command: CreateUserCommand): Promise<User> {
    return this.usersRepository.create({
      email: command.email,
      passwordHash: command.passwordHash,
      name: command.name,
    });
  }
}
